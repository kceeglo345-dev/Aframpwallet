use soroban_sdk::{BytesN, Env, Vec, contractclient, contracterror, contracttype};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Groth16Error {
    InvalidProof = 0,
    MalformedPublicInputs = 1,
    MalformedProof = 2,
}

#[derive(Clone)]
#[contracttype]
pub struct Groth16Proof {
    pub a: BytesN<64>,
    pub b: BytesN<128>,
    pub c: BytesN<64>,
}

impl Groth16Proof {
    pub fn is_empty(&self) -> bool {
        self.a.to_array() == [0u8; 64]
            || self.b.to_array() == [0u8; 128]
            || self.c.to_array() == [0u8; 64]
    }
}

#[contractclient(crate_path = "soroban_sdk", name = "Groth16VerifierClient")]
pub trait Groth16VerifierInterface {
    fn verify(
        env: Env,
        proof: Groth16Proof,
        public_inputs: Vec<BytesN<32>>,
    ) -> bool;
}
