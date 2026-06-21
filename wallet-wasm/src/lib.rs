use wasm_bindgen::prelude::*;
use wallet_core::Wallet;

#[wasm_bindgen]
pub struct PrivacyWallet {
    inner: Wallet,
}

#[wasm_bindgen]
impl PrivacyWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: &str) -> Self {
        Self {
            inner: Wallet::from_seed(seed),
        }
    }

    #[wasm_bindgen]
    pub fn create_private_send(
        &self,
        recipient: &str,
        amount: u64,
        asset: &str,
    ) -> Result<String, JsError> {
        let proof = self
            .inner
            .generate_proof(recipient, amount, asset)
            .map_err(|e| JsError::new(&e))?;

        Ok(proof.to_hex())
    }

    #[wasm_bindgen]
    pub fn get_viewing_key(&self) -> String {
        self.inner.derive_viewing_key().to_hex()
    }

    #[wasm_bindgen]
    pub fn decrypt_transaction(&self, viewing_key: &str, data: &str) -> String {
        self.inner.decrypt_tx(viewing_key, data)
    }
}
