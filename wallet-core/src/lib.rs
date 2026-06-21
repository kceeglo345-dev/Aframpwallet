use ark_bls12_381::Fr;
use ark_ff::PrimeField;
use ark_serialize::CanonicalSerialize;
use circuits::{generate_keys, prove};
use sha2::{Digest, Sha256};

pub use ark_groth16::{Proof, VerifyingKey};

#[derive(Clone, Debug)]
pub struct ViewingKey([u8; 32]);

impl ViewingKey {
    pub fn to_hex(&self) -> String {
        hex::encode(self.0)
    }

    pub fn from_hex(s: &str) -> Result<Self, String> {
        let bytes = hex::decode(s).map_err(|e| e.to_string())?;
        let mut arr = [0u8; 32];
        if bytes.len() != 32 {
            return Err("invalid viewing key length".into());
        }
        arr.copy_from_slice(&bytes);
        Ok(ViewingKey(arr))
    }
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Transaction {
    pub data: String,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct PrivateSend {
    pub proof_hex: String,
    pub nullifier_hex: String,
    pub commitment_hex: String,
    pub recipient: String,
    pub amount: u64,
    pub asset: String,
}

impl PrivateSend {
    pub fn to_hex(&self) -> String {
        serde_json::to_string(self).unwrap_or_default()
    }

    pub fn from_hex(s: &str) -> Result<Self, String> {
        serde_json::from_str(s).map_err(|e| e.to_string())
    }
}

pub struct Wallet {
    secret: Fr,
    pk: ark_groth16::ProvingKey<ark_bls12_381::Bls12_381>,
}

impl Wallet {
    pub fn from_seed(seed: &str) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(seed.as_bytes());
        let hash = hasher.finalize();
        let secret = Fr::from_le_bytes_mod_order(&hash);

        Wallet {
            secret,
            pk: Self::load_or_generate_pk(),
        }
    }

    fn load_or_generate_pk() -> ark_groth16::ProvingKey<ark_bls12_381::Bls12_381> {
        generate_keys().0
    }

    pub fn generate_proof(
        &self,
        recipient: &str,
        amount: u64,
        asset: &str,
    ) -> Result<PrivateSend, String> {
        let amount_fr = Fr::from(amount);
        let (proof, nullifier, commitment) = prove(self.secret, amount_fr, &self.pk);

        let mut proof_buf = Vec::new();
        proof
            .serialize_compressed(&mut proof_buf)
            .map_err(|e| e.to_string())?;

        let mut nullifier_buf = Vec::new();
        nullifier
            .serialize_compressed(&mut nullifier_buf)
            .map_err(|e| e.to_string())?;

        let mut commitment_buf = Vec::new();
        commitment
            .serialize_compressed(&mut commitment_buf)
            .map_err(|e| e.to_string())?;

        Ok(PrivateSend {
            proof_hex: hex::encode(proof_buf),
            nullifier_hex: hex::encode(nullifier_buf),
            commitment_hex: hex::encode(commitment_buf),
            recipient: recipient.to_string(),
            amount,
            asset: asset.to_string(),
        })
    }

    pub fn derive_viewing_key(&self) -> ViewingKey {
        let mut hasher = Sha256::new();
        hasher.update(b"viewing_key:");
        let secret_bytes = self.secret.to_string();
        hasher.update(secret_bytes.as_bytes());
        let hash = hasher.finalize();
        let mut key = [0u8; 32];
        key.copy_from_slice(&hash);
        ViewingKey(key)
    }

    pub fn decrypt_tx(&self, _viewing_key: &str, data: &str) -> String {
        format!("decrypted({})", data)
    }
}

#[derive(Clone, Debug)]
pub enum Network {
    Futurenet,
    Testnet,
    Mainnet,
}

impl Network {
    pub fn rpc_url(&self) -> &str {
        match self {
            Network::Futurenet => "https://rpc-futurenet.stellar.org",
            Network::Testnet => "https://soroban-testnet.stellar.org",
            Network::Mainnet => "https://soroban.stellar.org",
        }
    }
}

pub struct TransactionBuilder {
    network: Network,
    contract_id: String,
    method: String,
    args: Vec<String>,
}

impl TransactionBuilder {
    pub fn new(network: Network) -> Self {
        TransactionBuilder {
            network,
            contract_id: String::new(),
            method: String::new(),
            args: Vec::new(),
        }
    }

    pub fn contract_call(mut self, contract_id: &str, method: &str) -> Self {
        self.contract_id = contract_id.to_string();
        self.method = method.to_string();
        self
    }

    pub fn arg(mut self, arg: &str) -> Self {
        self.args.push(arg.to_string());
        self
    }

    pub fn build(&self) -> Transaction {
        Transaction {
            data: serde_json::json!({
                "network": format!("{:?}", self.network),
                "contract_id": self.contract_id,
                "method": self.method,
                "args": self.args,
            })
            .to_string(),
        }
    }
}
