use std::net::SocketAddr;

use ark_bls12_381::Bls12_381;
use ark_groth16::Groth16;
use ark_serialize::CanonicalDeserialize;
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::post,
    Router,
};
use circuits::generate_keys;
use serde::{Deserialize, Serialize};
use wallet_core::{Network, TransactionBuilder, VerifyingKey};

const PRIVACY_POOL_ID: &str = "CCJZ5DG7B2G5XMJHY7XLX2Y77HPRGM3GQ7JX2Q5XH6XJ5K2Z5PRIVACY";

#[derive(Deserialize)]
#[allow(dead_code)]
struct PrivateTxRequest {
    proof: String,
    commitment: String,
    nullifier: String,
    recipient: String,
    amount: u64,
    asset: String,
}

#[derive(Serialize)]
struct TxResponse {
    tx_hash: String,
    status: String,
}

#[derive(Clone)]
struct AppState {
    vk: VerifyingKey<Bls12_381>,
}

fn verify_zk_proof(
    state: &AppState,
    proof_hex: &str,
    commitment_hex: &str,
) -> Result<bool, StatusCode> {
    let proof_bytes = hex::decode(proof_hex).map_err(|_| StatusCode::BAD_REQUEST)?;
    let proof = ark_groth16::Proof::<Bls12_381>::deserialize_compressed(proof_bytes.as_slice())
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let commitment_bytes =
        hex::decode(commitment_hex).map_err(|_| StatusCode::BAD_REQUEST)?;
    let commitment = ark_bls12_381::Fr::deserialize_compressed(commitment_bytes.as_slice())
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let pvk = ark_groth16::prepare_verifying_key(&state.vk);
    let public_inputs = vec![commitment];

    Groth16::<Bls12_381>::verify_proof(&pvk, &proof, &public_inputs)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn submit_private_tx(
    State(state): State<AppState>,
    Json(payload): Json<PrivateTxRequest>,
) -> Result<Json<TxResponse>, StatusCode> {
    let valid = verify_zk_proof(&state, &payload.proof, &payload.commitment)?;
    if !valid {
        return Err(StatusCode::BAD_REQUEST);
    }

    let rpc_url = Network::Futurenet.rpc_url();
    let tx = TransactionBuilder::new(Network::Futurenet)
        .contract_call(PRIVACY_POOL_ID, "withdraw")
        .arg(&payload.recipient)
        .arg(&payload.proof)
        .arg(&payload.commitment)
        .build();

    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sendTransaction",
        "params": {
            "transaction": tx.data,
        }
    });

    let resp = client
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let resp_json: serde_json::Value = resp
        .json()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let tx_hash = resp_json["result"]["hash"]
        .as_str()
        .unwrap_or("unknown")
        .to_string();
    let status = resp_json["result"]["status"]
        .as_str()
        .unwrap_or("unknown")
        .to_string();

    Ok(Json(TxResponse { tx_hash, status }))
}

#[tokio::main]
async fn main() {
    let (_pk, vk) = generate_keys();

    let state = AppState { vk };

    let app = Router::new()
        .route("/api/private-send", post(submit_private_tx))
        .route("/api/health", post(|| async { "OK" }))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
