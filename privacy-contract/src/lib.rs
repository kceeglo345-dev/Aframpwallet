#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bn254::{Bn254Fr, Bn254G1Affine, Bn254G2Affine},
    vec, BytesN, Env, U256, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VerifierError {
    MalformedVerifyingKey = 0,
    VerificationFailed = 1,
    NotInitialized = 2,
    NullifierAlreadyUsed = 3,
}

#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: Bn254G1Affine,
    pub beta: Bn254G2Affine,
    pub gamma: Bn254G2Affine,
    pub delta: Bn254G2Affine,
    pub ic: Vec<Bn254G1Affine>,
}

#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: Bn254G1Affine,
    pub b: Bn254G2Affine,
    pub c: Bn254G1Affine,
}

#[contracttype]
pub enum DataKey {
    Vk,
    Used(BytesN<32>),
}

#[contract]
pub struct PrivacyPayment;

#[contractimpl]
impl PrivacyPayment {
    pub fn initialize(env: Env, vk: VerificationKey) {
        env.storage().instance().set(&DataKey::Vk, &vk);
    }

    pub fn verify_proof(
        env: Env,
        vk: VerificationKey,
        proof: Proof,
        pub_signals: Vec<Bn254Fr>,
    ) -> Result<bool, VerifierError> {
        if pub_signals.len() + 1 != vk.ic.len() {
            return Err(VerifierError::MalformedVerifyingKey);
        }

        let bn254 = env.crypto().bn254();

        let mut scalars = vec![&env, Bn254Fr::from(U256::from_u32(&env, 1))];
        for i in 0..pub_signals.len() {
            scalars.push_back(pub_signals.get(i).unwrap());
        }
        let vk_x = bn254.g1_msm(vk.ic, scalars);

        let neg_a = -proof.a;

        let vp1 = vec![&env, neg_a, vk.alpha, vk_x, proof.c];
        let vp2 = vec![&env, proof.b, vk.beta, vk.gamma, vk.delta];

        Ok(bn254.pairing_check(vp1, vp2))
    }

    pub fn process_payment(
        env: Env,
        proof: Proof,
        merchant_id: Bn254Fr,
        nullifier: Bn254Fr,
        commitment: Bn254Fr,
    ) -> Result<bool, VerifierError> {
        let vk: VerificationKey = env.storage().instance().get(&DataKey::Vk)
            .ok_or(VerifierError::NotInitialized)?;

        let pub_signals = vec![&env, merchant_id, nullifier.clone(), commitment];
        let valid = Self::verify_proof(env.clone(), vk, proof, pub_signals)?;

        if !valid {
            return Err(VerifierError::VerificationFailed);
        }

        let nullifier_bytes = nullifier.to_bytes();
        if env.storage().instance().has(&DataKey::Used(nullifier_bytes.clone())) {
            return Err(VerifierError::NullifierAlreadyUsed);
        }

        env.storage().instance().set(&DataKey::Used(nullifier_bytes), &true);
        Ok(true)
    }

    pub fn is_nullifier_used(env: Env, nullifier: Bn254Fr) -> bool {
        let nullifier_bytes = nullifier.to_bytes();
        env.storage().instance().has(&DataKey::Used(nullifier_bytes))
    }
}

#[cfg(test)]
mod test {
    extern crate std;
    use super::*;
    use ark_ff::{BigInteger, PrimeField};
    use rand::RngCore;

    fn fq_to_bytes(fq: &ark_bn254::Fq) -> [u8; 32] {
        let be = fq.clone().into_bigint().to_bytes_be();
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&be);
        arr
    }

    fn ark_g1_to_soroban(env: &Env, point: &ark_bn254::G1Affine) -> Bn254G1Affine {
        let mut combined = [0u8; 64];
        combined[..32].copy_from_slice(&fq_to_bytes(&point.x));
        combined[32..].copy_from_slice(&fq_to_bytes(&point.y));
        Bn254G1Affine::from_array(env, &combined)
    }

    fn ark_g2_to_soroban(env: &Env, point: &ark_bn254::G2Affine) -> Bn254G2Affine {
        let mut combined = [0u8; 128];
        combined[..32].copy_from_slice(&fq_to_bytes(&point.x.c1));
        combined[32..64].copy_from_slice(&fq_to_bytes(&point.x.c0));
        combined[64..96].copy_from_slice(&fq_to_bytes(&point.y.c1));
        combined[96..].copy_from_slice(&fq_to_bytes(&point.y.c0));
        Bn254G2Affine::from_array(env, &combined)
    }

    fn ark_fr_to_soroban(env: &Env, fr: &ark_bn254::Fr) -> Bn254Fr {
        let be = fr.clone().into_bigint().to_bytes_be();
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&be);
        Bn254Fr::from_bytes(BytesN::from_array(env, &arr))
    }

    fn build_soroban_vk(
        env: &Env,
        vk: &ark_groth16::VerifyingKey<ark_bn254::Bn254>,
    ) -> VerificationKey {
        let mut ic = vec![env, ark_g1_to_soroban(env, &vk.gamma_abc_g1[0])];
        for point in vk.gamma_abc_g1.iter().skip(1) {
            ic.push_back(ark_g1_to_soroban(env, point));
        }
        VerificationKey {
            alpha: ark_g1_to_soroban(env, &vk.alpha_g1),
            beta: ark_g2_to_soroban(env, &vk.beta_g2),
            gamma: ark_g2_to_soroban(env, &vk.gamma_g2),
            delta: ark_g2_to_soroban(env, &vk.delta_g2),
            ic,
        }
    }

    fn build_soroban_proof(
        env: &Env,
        proof: &ark_groth16::Proof<ark_bn254::Bn254>,
    ) -> Proof {
        Proof {
            a: ark_g1_to_soroban(env, &proof.a),
            b: ark_g2_to_soroban(env, &proof.b),
            c: ark_g1_to_soroban(env, &proof.c),
        }
    }

    #[test]
    fn test_verify_valid_proof() {
        let env = Env::default();
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        let soroban_vk = build_soroban_vk(&env, &merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        let pub_signals = vec![
            &env,
            ark_fr_to_soroban(&env, &merchant.merchant_id),
            ark_fr_to_soroban(&env, &nullifier_fr),
            ark_fr_to_soroban(&env, &commitment_fr),
        ];

        let result = PrivacyPayment::verify_proof(
            env.clone(), soroban_vk, soroban_proof, pub_signals,
        );
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_verify_invalid_proof() {
        let env = Env::default();
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        let soroban_vk = build_soroban_vk(&env, &merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        // Wrong merchant_id should fail
        let pub_signals = vec![
            &env,
            ark_fr_to_soroban(&env, &ark_bn254::Fr::from(999u64)),
            ark_fr_to_soroban(&env, &nullifier_fr),
            ark_fr_to_soroban(&env, &commitment_fr),
        ];
        let result = PrivacyPayment::verify_proof(
            env.clone(), soroban_vk, soroban_proof, pub_signals,
        );
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[test]
    fn test_wrong_vk_rejects_proof() {
        let env = Env::default();
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        // Different merchant = different VK
        let mut other_id = [0u8; 32];
        rng.fill_bytes(&mut other_id);
        let other_merchant = privacy_circuits::MerchantPaymentSystem::new(&other_id);
        let soroban_wrong_vk = build_soroban_vk(&env, &other_merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        let pub_signals = vec![
            &env,
            ark_fr_to_soroban(&env, &merchant.merchant_id),
            ark_fr_to_soroban(&env, &nullifier_fr),
            ark_fr_to_soroban(&env, &commitment_fr),
        ];

        let result = PrivacyPayment::verify_proof(
            env.clone(), soroban_wrong_vk, soroban_proof, pub_signals,
        );
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[test]
    fn test_malformed_vk_rejected() {
        let env = Env::default();
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        let soroban_vk = build_soroban_vk(&env, &merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        let too_many_signals = vec![
            &env,
            ark_fr_to_soroban(&env, &merchant.merchant_id),
            ark_fr_to_soroban(&env, &nullifier_fr),
            ark_fr_to_soroban(&env, &commitment_fr),
            ark_fr_to_soroban(&env, &ark_bn254::Fr::from(1u64)),
        ];

        let result = PrivacyPayment::verify_proof(
            env.clone(), soroban_vk, soroban_proof, too_many_signals,
        );
        assert_eq!(result, Err(VerifierError::MalformedVerifyingKey));
    }

    #[test]
    fn test_process_payment_full_flow() {
        let env = Env::default();
        let contract_id = env.register(PrivacyPayment, ());
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        let soroban_vk = build_soroban_vk(&env, &merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        env.as_contract(&contract_id, || {
            PrivacyPayment::initialize(env.clone(), soroban_vk);

            let result = PrivacyPayment::process_payment(
                env.clone(),
                soroban_proof,
                ark_fr_to_soroban(&env, &merchant.merchant_id),
                ark_fr_to_soroban(&env, &nullifier_fr),
                ark_fr_to_soroban(&env, &commitment_fr),
            );
            assert!(result.is_ok());
            assert!(result.unwrap());
        });
    }

    #[test]
    fn test_nullifier_rejects_double_spend() {
        let env = Env::default();
        let contract_id = env.register(PrivacyPayment, ());
        let mut rng = rand::thread_rng();

        let mut merchant_id = [0u8; 32];
        rng.fill_bytes(&mut merchant_id);
        let merchant = privacy_circuits::MerchantPaymentSystem::new(&merchant_id);

        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);

        let (proof, nullifier_fr, commitment_fr) = privacy_circuits::customer_generate_proof(
            &merchant.pk, &customer_secret, 100, &merchant_id,
        ).unwrap();

        let soroban_vk = build_soroban_vk(&env, &merchant.vk);
        let soroban_proof = build_soroban_proof(&env, &proof);

        env.as_contract(&contract_id, || {
            PrivacyPayment::initialize(env.clone(), soroban_vk);

            let first = PrivacyPayment::process_payment(
                env.clone(),
                soroban_proof.clone(),
                ark_fr_to_soroban(&env, &merchant.merchant_id),
                ark_fr_to_soroban(&env, &nullifier_fr),
                ark_fr_to_soroban(&env, &commitment_fr),
            );
            assert!(first.is_ok());
            assert!(first.unwrap());

            let nullifier = ark_fr_to_soroban(&env, &nullifier_fr);
            assert!(PrivacyPayment::is_nullifier_used(env.clone(), nullifier.clone()));

            let second = PrivacyPayment::process_payment(
                env.clone(),
                soroban_proof,
                ark_fr_to_soroban(&env, &merchant.merchant_id),
                nullifier,
                ark_fr_to_soroban(&env, &commitment_fr),
            );
            assert_eq!(second, Err(VerifierError::NullifierAlreadyUsed));
        });
    }
}
