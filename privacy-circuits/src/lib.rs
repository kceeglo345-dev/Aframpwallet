use ark_bn254::{Bn254, Fr};
use ark_ff::{Field, One, Zero, PrimeField};
use ark_groth16::Groth16;
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_r1cs_std::{prelude::*, fields::fp::FpVar};
use ark_snark::{CircuitSpecificSetupSNARK, SNARK};

/// Payment circuit — customer proves they paid a specific merchant
///
/// Public inputs:  merchant_id, nullifier, commitment
/// Private inputs: customer_secret, amount
///
/// Constraints:
///   1. nullifier = customer_secret + amount         (uniqueness, prevents double-spend)
///   2. commitment = customer_secret * amount * merchant_id  (binds payment to merchant)
///   3. amount * inv(amount) = 1                     (non-zero amount)
#[derive(Clone)]
pub struct PaymentCircuit {
    // Private inputs (known only to customer)
    pub customer_secret: Fr,
    pub amount: Fr,

    // Public inputs (verified by contract)
    pub merchant_id: Fr,
    pub nullifier: Fr,
    pub commitment: Fr,
}

impl ConstraintSynthesizer<Fr> for PaymentCircuit {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<Fr>,
    ) -> Result<(), SynthesisError> {
        // Witness variables (private — customer knows these)
        let secret = FpVar::new_witness(cs.clone(), || Ok(self.customer_secret))?;
        let amount = FpVar::new_witness(cs.clone(), || Ok(self.amount))?;

        // Public input variables (contract sees these)
        let merchant = FpVar::new_input(cs.clone(), || Ok(self.merchant_id))?;
        let nullifier = FpVar::new_input(cs.clone(), || Ok(self.nullifier))?;
        let commitment = FpVar::new_input(cs.clone(), || Ok(self.commitment))?;

        // Constraint 1: nullifier = secret + amount
        let computed_nullifier = secret.clone() + amount.clone();
        computed_nullifier.enforce_equal(&nullifier)?;

        // Constraint 2: commitment = secret * amount * merchant_id
        let computed_commitment = secret.clone() * amount.clone() * merchant;
        computed_commitment.enforce_equal(&commitment)?;

        // Constraint 3: amount != 0 (inverse non-zero check)
        {
            let inv_amount = FpVar::new_witness(cs.clone(), || {
                if self.amount.is_zero() {
                    Err(SynthesisError::Unsatisfiable)
                } else {
                    Ok(self.amount.inverse().unwrap())
                }
            })?;
            (amount * inv_amount).enforce_equal(&FpVar::constant(Fr::one()))?;
        }

        Ok(())
    }
}

/// Merchant payment system — generates CRS, verifies proofs
pub struct MerchantPaymentSystem {
    pub merchant_id: Fr,
    pub pk: ark_groth16::ProvingKey<Bn254>,
    pub vk: ark_groth16::VerifyingKey<Bn254>,
}

impl MerchantPaymentSystem {
    /// Create a new merchant payment system with random CRS
    ///
    /// `merchant_id` is an arbitrary 32-byte identifier for the merchant.
    /// It's a public input to the circuit — customers include it in their proofs.
    pub fn new(merchant_id: &[u8; 32]) -> Self {
        let merchant_fr = Fr::from_le_bytes_mod_order(merchant_id);

        // Generate CRS from a representative circuit (non-zero amounts)
        let circuit = PaymentCircuit {
            customer_secret: Fr::from(1u64),
            amount: Fr::from(1u64),
            merchant_id: merchant_fr,
            nullifier: Fr::from(2u64),    // 1 + 1
            commitment: Fr::from(1u64),   // 1 * 1 * merchant_id — set to merchant_id
        };

        let mut rng = rand::thread_rng();
        let (pk, vk) = Groth16::<Bn254>::setup(circuit, &mut rng).unwrap();

        Self { merchant_id: merchant_fr, pk, vk }
    }

    /// Verify a proof from a customer
    pub fn verify_proof(
        &self,
        proof: &ark_groth16::Proof<Bn254>,
        merchant_id: &Fr,
        nullifier: &Fr,
        commitment: &Fr,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let public_inputs = vec![*merchant_id, *nullifier, *commitment];
        Ok(Groth16::<Bn254>::verify(&self.vk, &public_inputs, proof)?)
    }
}

/// Generate a proof as a customer
///
/// `merchant_pk` is the merchant's proving key (from QR code or API).
/// `customer_secret` is a random 32-byte secret chosen by the customer.
/// `merchant_id` is the merchant's public identifier (from QR code).
pub fn customer_generate_proof(
    pk: &ark_groth16::ProvingKey<Bn254>,
    customer_secret: &[u8; 32],
    amount: u64,
    merchant_id: &[u8; 32],
) -> Result<(ark_groth16::Proof<Bn254>, Fr, Fr), Box<dyn std::error::Error>> {
    let mut rng = rand::thread_rng();

    let secret_fr = Fr::from_le_bytes_mod_order(customer_secret);
    let amount_fr = Fr::from(amount);
    let merchant_fr = Fr::from_le_bytes_mod_order(merchant_id);

    // Compute public values
    let nullifier = secret_fr + amount_fr;
    let commitment = secret_fr * amount_fr * merchant_fr;

    let circuit = PaymentCircuit {
        customer_secret: secret_fr,
        amount: amount_fr,
        merchant_id: merchant_fr,
        nullifier,
        commitment,
    };

    let proof = Groth16::<Bn254>::prove(pk, circuit, &mut rng)?;
    Ok((proof, nullifier, commitment))
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::RngCore;

    #[test]
    fn test_customer_payment_flow() {
        println!("\n🔐 Customer Payment Flow");
        println!("========================");

        let mut rng = rand::thread_rng();

        // Merchant generates their identity and CRS
        let mut merchant_id_bytes = [0u8; 32];
        rng.fill_bytes(&mut merchant_id_bytes);
        let merchant = MerchantPaymentSystem::new(&merchant_id_bytes);
        let mut id_buf = [0u8; 32];
        ark_serialize::CanonicalSerialize::serialize_compressed(&merchant.merchant_id, &mut id_buf[..]).unwrap();
        println!("✅ Merchant CRS generated");
        println!("   Merchant ID: {}", hex::encode(id_buf));

        // Customer picks a secret and amount
        let mut customer_secret = [0u8; 32];
        rng.fill_bytes(&mut customer_secret);
        let amount = 100u64;
        println!("\n📝 Customer generating proof...");

        let (proof, nullifier, commitment) = customer_generate_proof(
            &merchant.pk,
            &customer_secret,
            amount,
            &merchant_id_bytes,
        ).unwrap();

        let mut n_buf = [0u8; 32];
        ark_serialize::CanonicalSerialize::serialize_compressed(&nullifier, &mut n_buf[..]).unwrap();
        println!("   Nullifier: {}", hex::encode(n_buf));
        let mut c_buf = [0u8; 32];
        ark_serialize::CanonicalSerialize::serialize_compressed(&commitment, &mut c_buf[..]).unwrap();
        println!("   Commitment: {}", hex::encode(c_buf));

        // Merchant verifies the proof
        println!("\n🔍 Merchant verifying proof...");
        let valid = merchant
            .verify_proof(&proof, &merchant.merchant_id, &nullifier, &commitment)
            .unwrap();
        assert!(valid);
        println!("✅ Proof is VALID");

        // Verification with wrong merchant_id should fail
        println!("\n🔍 Testing invalid merchant_id...");
        let invalid_id = Fr::from(999u64);
        let valid = merchant
            .verify_proof(&proof, &invalid_id, &nullifier, &commitment)
            .unwrap();
        assert!(!valid);
        println!("✅ Invalid merchant_id correctly rejected");

        // Proof size
        let proof_size = ark_serialize::CanonicalSerialize::serialized_size(&proof, ark_serialize::Compress::Yes);
        println!("\n📦 Proof size: {} bytes", proof_size);
        println!("\n🎉 All tests passed!");
    }

    #[test]
    fn test_performance() {
        println!("\n⚡ Performance Test");
        println!("==================");

        let mut rng = rand::thread_rng();
        let mut mid = [0u8; 32];
        rng.fill_bytes(&mut mid);
        let merchant = MerchantPaymentSystem::new(&mid);

        let mut secret = [0u8; 32];
        rng.fill_bytes(&mut secret);

        let start = std::time::Instant::now();
        let (proof, _nullifier, _commitment) = customer_generate_proof(
            &merchant.pk, &secret, 100, &mid,
        ).unwrap();
        let duration = start.elapsed();
        println!("✅ Proof generation: {:?}", duration);

        let start = std::time::Instant::now();
        let _valid = merchant
            .verify_proof(&proof, &merchant.merchant_id, &_nullifier, &_commitment)
            .unwrap();
        let duration = start.elapsed();
        println!("✅ Proof verification: {:?}", duration);
    }

    #[test]
    fn test_zero_amount_rejected() {
        println!("\n⛔ Zero Amount Test");
        println!("==================");

        let mut rng = rand::thread_rng();
        let mut mid = [0u8; 32];
        rng.fill_bytes(&mut mid);
        let merchant = MerchantPaymentSystem::new(&mid);

        let mut secret = [0u8; 32];
        rng.fill_bytes(&mut secret);

        let result = customer_generate_proof(&merchant.pk, &secret, 0, &mid);
        assert!(result.is_err(), "Zero amount should be rejected");
        println!("✅ Zero amount correctly rejected");
    }
}
