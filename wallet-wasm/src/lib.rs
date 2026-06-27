use ark_ff::{BigInteger, PrimeField};
use ark_serialize::CanonicalDeserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate_proof(
    pk_hex: &str,
    customer_secret_hex: &str,
    amount: u64,
    merchant_id_hex: &str,
) -> Result<JsValue, JsValue> {
    let pk_bytes = hex::decode(pk_hex).map_err(|e| JsValue::from_str(&format!("invalid pk_hex: {e}")))?;
    let pk = ark_groth16::ProvingKey::<ark_bn254::Bn254>::deserialize_compressed(&mut &pk_bytes[..])
        .map_err(|e| JsValue::from_str(&format!("failed to deserialize proving key: {e}")))?;

    let customer_secret = parse_hex_32("customer_secret", customer_secret_hex)?;
    let merchant_id = parse_hex_32("merchant_id", merchant_id_hex)?;

    let (proof, nullifier, commitment) = privacy_circuits::customer_generate_proof(
        &pk, &customer_secret, amount, &merchant_id,
    )
    .map_err(|e| JsValue::from_str(&format!("proof generation failed: {e}")))?;

    let result = serde_wasm_bindgen::to_value(&serde_json::json!({
        "a": g1_to_hex(&proof.a),
        "b": g2_to_hex(&proof.b),
        "c": g1_to_hex(&proof.c),
        "nullifier": fr_to_hex(&nullifier),
        "commitment": fr_to_hex(&commitment),
    }))
    .map_err(|e| JsValue::from_str(&format!("serialization failed: {e}")))?;

    Ok(result)
}

fn parse_hex_32(name: &str, hex_str: &str) -> Result<[u8; 32], JsValue> {
    let bytes = hex::decode(hex_str)
        .map_err(|e| JsValue::from_str(&format!("invalid {name} hex: {e}")))?;
    if bytes.len() != 32 {
        return Err(JsValue::from_str(&format!("{name} must be 32 bytes (got {})", bytes.len())));
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&bytes);
    Ok(arr)
}

fn fr_to_hex(fr: &ark_bn254::Fr) -> String {
    hex::encode(fr.into_bigint().to_bytes_be())
}

fn g1_to_hex(point: &ark_bn254::G1Affine) -> String {
    let mut out = Vec::with_capacity(64);
    out.extend_from_slice(&point.x.into_bigint().to_bytes_be());
    out.extend_from_slice(&point.y.into_bigint().to_bytes_be());
    hex::encode(out)
}

fn g2_to_hex(point: &ark_bn254::G2Affine) -> String {
    let mut out = Vec::with_capacity(128);
    out.extend_from_slice(&point.x.c1.into_bigint().to_bytes_be());
    out.extend_from_slice(&point.x.c0.into_bigint().to_bytes_be());
    out.extend_from_slice(&point.y.c1.into_bigint().to_bytes_be());
    out.extend_from_slice(&point.y.c0.into_bigint().to_bytes_be());
    hex::encode(out)
}
