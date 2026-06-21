use ark_bls12_381::{Bls12_381, Fr};
use ark_groth16::{Groth16, ProvingKey, VerifyingKey, Proof};
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, LinearCombination, Variable};
use ark_std::Zero;

#[derive(Clone)]
pub struct PrivacyCircuit {
    pub secret: Fr,
    pub nullifier: Fr,
    pub commitment: Fr,
    pub amount: Fr,
}

impl ConstraintSynthesizer<Fr> for PrivacyCircuit {
    fn generate_constraints(
        self,
        cs: ConstraintSystemRef<Fr>,
    ) -> ark_relations::r1cs::Result<()> {
        let secret_var = cs.new_witness_variable(|| Ok(self.secret))?;
        let amount_var = cs.new_witness_variable(|| Ok(self.amount))?;

        let nullifier_var = cs.new_input_variable(|| Ok(self.nullifier))?;
        cs.enforce_constraint(
            LinearCombination::from(secret_var) + amount_var,
            Variable::One.into(),
            nullifier_var.into(),
        )?;

        let commitment_var = cs.new_input_variable(|| Ok(self.commitment))?;
        cs.enforce_constraint(
            secret_var.into(),
            amount_var.into(),
            commitment_var.into(),
        )?;

        Ok(())
    }
}

pub fn generate_keys() -> (ProvingKey<Bls12_381>, VerifyingKey<Bls12_381>) {
    let circuit = PrivacyCircuit {
        secret: Fr::zero(),
        nullifier: Fr::zero(),
        commitment: Fr::zero(),
        amount: Fr::zero(),
    };
    let pk = Groth16::<Bls12_381>::generate_random_parameters_with_reduction(
        circuit,
        &mut ark_std::rand::thread_rng(),
    )
    .unwrap();
    let vk = pk.vk.clone();
    (pk, vk)
}

pub fn prove(
    secret: Fr,
    amount: Fr,
    pk: &ProvingKey<Bls12_381>,
) -> (Proof<Bls12_381>, Fr, Fr) {
    let nullifier = secret + amount;
    let commitment = secret * amount;

    let circuit = PrivacyCircuit {
        secret,
        nullifier,
        commitment,
        amount,
    };

    let proof = Groth16::<Bls12_381>::create_random_proof_with_reduction(
        circuit,
        pk,
        &mut ark_std::rand::thread_rng(),
    )
    .unwrap();
    (proof, nullifier, commitment)
}
