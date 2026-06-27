use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;
use aes_gcm::{
    Aes256Gcm, Key, Nonce,
    aead::{Aead, KeyInit},
};
use ark_ff::{BigInteger, PrimeField};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use axum::{
    Router,
    extract::{Path as AxumPath, State},
    http::{Method, StatusCode},
    Json,
    response::IntoResponse,
    routing::{get, post},
};
use privacy_circuits::MerchantPaymentSystem;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

type SeedHex = String;

#[derive(Clone)]
struct AppState {
    merchants: std::sync::Arc<Mutex<HashMap<SeedHex, MerchantPaymentSystem>>>,
    contract_id: Option<String>,
    fixed_seed: Option<String>,
}

#[derive(Serialize)]
struct CreateMerchantResponse {
    merchant_id: String,
    seed: String,
    viewing_key: String,
}

#[derive(Deserialize)]
struct SubmitToContractRequest {
    seed: String,
    a: String,
    b: String,
    c: String,
    nullifier: String,
    commitment: String,
    amount: u64,
    customer_id: String,
}

#[derive(Serialize)]
struct SubmitToContractResponse {
    success: bool,
    tx_hash: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct InitContractRequest {
    seed: String,
}

#[derive(Serialize)]
struct InitContractResponse {
    success: bool,
    tx_hash: Option<String>,
    error: Option<String>,
}

#[derive(Serialize)]
struct PaymentRecordJson {
    tx_hash: String,
    amount: u64,
    amount_usd: String,
    customer_id: String,
    timestamp: u64,
    datetime: String,
    status: String,
}

#[derive(Serialize)]
struct DailyVolumeJson {
    date: String,
    volume: u64,
    count: u64,
}

#[derive(Serialize)]
struct DashboardStatsJson {
    total_volume: u64,
    total_volume_usd: String,
    transaction_count: u64,
    average_transaction: String,
    balance: String,
    daily_volume: Vec<DailyVolumeJson>,
    recent_payments: Vec<PaymentRecordJson>,
}

#[derive(Serialize)]
struct ComplianceReportJson {
    merchant_id: String,
    period_start: String,
    period_end: String,
    total_transactions: u64,
    total_volume_usd: String,
    average_transaction_usd: String,
    payments: Vec<PaymentRecordJson>,
    generated_at: String,
}

#[derive(Serialize)]
struct MerchantInfoJson {
    merchant_id: String,
    status: String,
    private_payments_enabled: bool,
    supported_assets: Vec<String>,
    fee: String,
    network: String,
    balance: String,
}

#[derive(Deserialize)]
struct WalletGenerateProofRequest {
    pk_hex: String,
    customer_secret: String,
    amount: u64,
    merchant_id: String,
}

#[derive(Serialize)]
struct WalletGenerateProofResponse {
    success: bool,
    a: String,
    b: String,
    c: String,
    nullifier: String,
    commitment: String,
    error: Option<String>,
}

#[derive(Serialize)]
struct ViewingKeyResponse {
    key: String,
}

#[derive(Serialize)]
struct DecryptedPaymentJson {
    amount: u64,
    amount_usd: String,
    customer_id: String,
    timestamp: u64,
    datetime: String,
}

#[derive(Serialize)]
struct MerchantPaymentsResponse {
    payments: Vec<DecryptedPaymentJson>,
    balance: String,
}

#[derive(Serialize)]
struct MerchantQrInfo {
    api_url: String,
    merchant_id: String,
    contract_id: String,
    pk_url: String,
    seed_hex: String,
}

#[derive(Serialize)]
struct MerchantPkResponse {
    pk_hex: String,
    merchant_id: String,
}

#[derive(Serialize)]
struct MerchantBalanceResponse {
    balance: String,
    note_count: usize,
    visible_on_chain: String,
}

const MERCHANT_DIR: &str = "merchant_data";

// ── Helpers ──

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

fn merchant_dir(seed: &[u8; 32]) -> String {
    format!("{}/{}", MERCHANT_DIR, hex::encode(seed))
}

// ── Viewing Key Encryption / Decryption ──

fn encrypt_payment_data(viewing_key: &[u8; 32], amount: u64, customer_id: &str, timestamp: u64) -> String {
    let plaintext = format!("{}|{}|{}", amount, customer_id, timestamp);
    let key = Key::<Aes256Gcm>::from_slice(viewing_key);
    let cipher = Aes256Gcm::new(key);
    let nonce_bytes: [u8; 12] = rand::random();
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes()).unwrap();
    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);
    hex::encode(combined)
}

fn decrypt_payment_data(viewing_key: &[u8; 32], encrypted_hex: &str) -> Result<(u64, String, u64), String> {
    let combined = hex::decode(encrypted_hex).map_err(|e| format!("invalid hex: {e}"))?;
    if combined.len() < 13 {
        return Err("data too short".into());
    }
    let nonce = Nonce::from_slice(&combined[..12]);
    let ciphertext = &combined[12..];
    let key = Key::<Aes256Gcm>::from_slice(viewing_key);
    let cipher = Aes256Gcm::new(key);
    let plaintext = cipher.decrypt(nonce, ciphertext).map_err(|_| "decryption failed (wrong viewing key?)")?;
    let plaintext_str = String::from_utf8(plaintext).map_err(|_| "invalid utf-8")?;
    let parts: Vec<&str> = plaintext_str.split('|').collect();
    if parts.len() != 3 {
        return Err("invalid payment data format".into());
    }
    let amount: u64 = parts[0].parse().map_err(|_| "invalid amount")?;
    let customer_id = parts[1].to_string();
    let timestamp: u64 = parts[2].parse().map_err(|_| "invalid timestamp")?;
    Ok((amount, customer_id, timestamp))
}

fn viewing_key_path(seed: &[u8; 32]) -> String {
    format!("{}/viewing_key", merchant_dir(seed))
}

fn save_viewing_key(seed: &[u8; 32], viewing_key: &[u8; 32]) {
    let path = viewing_key_path(seed);
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).ok();
    }
    fs::write(&path, viewing_key).ok();
}

fn load_viewing_key(seed: &[u8; 32]) -> Option<[u8; 32]> {
    let path = viewing_key_path(seed);
    fs::read(&path).ok().map(|bytes| {
        let mut key = [0u8; 32];
        let len = bytes.len().min(32);
        key[..len].copy_from_slice(&bytes[..len]);
        key
    })
}

// ── Merchant Persistence ──

fn save_merchant(merchant: &MerchantPaymentSystem, seed: &[u8; 32]) {
    let dir = merchant_dir(seed);
    fs::create_dir_all(&dir).ok();
    let mut pk_bytes = Vec::new();
    merchant.pk.serialize_compressed(&mut pk_bytes).unwrap();
    fs::write(Path::new(&dir).join("pk"), pk_bytes).ok();
    let mut vk_bytes = Vec::new();
    merchant.vk.serialize_compressed(&mut vk_bytes).unwrap();
    fs::write(Path::new(&dir).join("vk"), vk_bytes).ok();
    fs::write(Path::new(&dir).join("merchant_id"), hex::encode(seed)).ok();
}

fn load_merchant(seed: &[u8; 32]) -> Option<MerchantPaymentSystem> {
    use ark_serialize::CanonicalDeserialize;
    let dir = merchant_dir(seed);
    let pk_path = Path::new(&dir).join("pk");
    let vk_path = Path::new(&dir).join("vk");
    let pk_bytes = fs::read(pk_path).ok()?;
    let vk_bytes = fs::read(vk_path).ok()?;
    let pk = ark_groth16::ProvingKey::<ark_bn254::Bn254>::deserialize_compressed(
        &mut &pk_bytes[..],
    ).ok()?;
    let vk = ark_groth16::VerifyingKey::<ark_bn254::Bn254>::deserialize_compressed(
        &mut &vk_bytes[..],
    ).ok()?;
    let merchant_id = ark_bn254::Fr::from_le_bytes_mod_order(seed);
    Some(MerchantPaymentSystem { merchant_id, pk, vk })
}

fn get_or_create_merchant(
    merchants: &mut HashMap<SeedHex, MerchantPaymentSystem>,
    seed: &[u8; 32],
) -> MerchantPaymentSystem {
    let key = hex::encode(seed);
    if let Some(m) = merchants.get(&key) {
        return MerchantPaymentSystem { merchant_id: m.merchant_id, pk: m.pk.clone(), vk: m.vk.clone() };
    }
    if let Some(m) = load_merchant(seed) {
        merchants.insert(key, MerchantPaymentSystem { merchant_id: m.merchant_id, pk: m.pk.clone(), vk: m.vk.clone() });
        return m;
    }
    let m = MerchantPaymentSystem::new(seed);
    save_merchant(&m, seed);
    merchants.insert(key, MerchantPaymentSystem { merchant_id: m.merchant_id, pk: m.pk.clone(), vk: m.vk.clone() });
    m
}

fn parse_hex_seed(hex_str: &str) -> [u8; 32] {
    let bytes = hex::decode(hex_str).expect("invalid seed hex");
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&bytes);
    seed
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn datetime_from_timestamp(ts: u64) -> String {
    let secs = ts as i64;
    let naive = chrono::DateTime::from_timestamp(secs, 0).unwrap();
    naive.format("%Y-%m-%dT%H:%M:%SZ").to_string()
}

// ── Dashboard state ──

struct MerchantDashboardState {
    total_volume: u64,
    transaction_count: u64,
    payments: Vec<DecryptedPaymentJson>,
}

fn update_dashboard_state(seed: &[u8; 32]) -> MerchantDashboardState {
    if let Some(vk) = load_viewing_key(seed) {
        let dir = merchant_dir(seed);
        let notes_dir = Path::new(&dir).join("payment_notes");
        let mut total_volume = 0u64;
        let mut transaction_count = 0u64;
        let mut payments = Vec::new();
        if notes_dir.exists() {
            if let Ok(entries) = fs::read_dir(&notes_dir) {
                for entry in entries.flatten() {
                    if let Ok(data) = fs::read(entry.path()) {
                        let hex_str = String::from_utf8_lossy(&data);
                        if let Ok((amount, customer_id, timestamp)) = decrypt_payment_data(&vk, &hex_str) {
                            total_volume += amount;
                            transaction_count += 1;
                            payments.push(DecryptedPaymentJson {
                                amount,
                                amount_usd: format!("${:.2}", amount as f64 / 100.0),
                                customer_id,
                                timestamp,
                                datetime: datetime_from_timestamp(timestamp),
                            });
                        }
                    }
                }
            }
        }
        payments.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        MerchantDashboardState { total_volume, transaction_count, payments }
    } else {
        MerchantDashboardState { total_volume: 0, transaction_count: 0, payments: vec![] }
    }
}

// ── API Handlers ──

async fn create_merchant(State(state): State<AppState>) -> Json<CreateMerchantResponse> {
    let seed = if let Some(ref fixed_seed_hex) = state.fixed_seed {
        parse_hex_seed(fixed_seed_hex)
    } else {
        let mut rng = rand::thread_rng();
        let mut seed = [0u8; 32];
        rng.fill_bytes(&mut seed);
        seed
    };
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let mut viewing_key = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut viewing_key);
    save_viewing_key(&seed, &viewing_key);
    Json(CreateMerchantResponse {
        merchant_id: fr_to_hex(&merchant.merchant_id),
        seed: hex::encode(seed),
        viewing_key: hex::encode(viewing_key),
    })
}

/// Submit a customer-generated proof to the contract.
/// The proof was built on-device by the customer using the merchant's PK.
async fn submit_to_contract(
    State(state): State<AppState>,
    Json(req): Json<SubmitToContractRequest>,
) -> Json<SubmitToContractResponse> {
    let contract_id = match &state.contract_id {
        Some(id) => id.clone(),
        None => return Json(SubmitToContractResponse { success: false, tx_hash: None, error: Some("CONTRACT_ID not configured".into()) }),
    };
    let seed = parse_hex_seed(&req.seed);

    // Encrypt payment data with viewing key for dashboard
    let viewing_key = load_viewing_key(&seed);
    if let Some(vk) = viewing_key {
        let customer_hex = hex::encode(req.customer_id.as_bytes());
        let encrypted = encrypt_payment_data(&vk, req.amount, &customer_hex, current_timestamp());
        let notes_dir = Path::new(&merchant_dir(&seed)).join("payment_notes");
        fs::create_dir_all(&notes_dir).ok();
        let note_path = notes_dir.join(format!("{}.enc", req.nullifier));
        fs::write(&note_path, &encrypted).ok();
    }

    let proof_str = serde_json::json!({ "a": req.a, "b": req.b, "c": req.c }).to_string();
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let _nullifier_int = num_bigint::BigUint::from_bytes_be(&hex::decode(&req.nullifier).unwrap_or_default());
    let _commitment_int = num_bigint::BigUint::from_bytes_be(&hex::decode(&req.commitment).unwrap_or_default());

    let proof_file = match tempfile::Builder::new().prefix("proof_").suffix(".json").tempfile() {
        Ok(f) => f,
        Err(e) => return Json(SubmitToContractResponse { success: false, tx_hash: None, error: Some(format!("failed to create temp file: {e}")) }),
    };
    let proof_path = proof_file.path().to_str().unwrap().to_string();
    std::fs::write(proof_file.path(), &proof_str).ok();

    let output = Command::new("soroban")
        .args(["contract", "invoke", "--id", &contract_id, "--source", "alice", "--network", "testnet", "--",
            "process_payment",
            "--merchant_id", &format!("0x{}", fr_to_hex(&merchant.merchant_id)),
            "--nullifier", &format!("0x{}", req.nullifier),
            "--commitment", &format!("0x{}", req.commitment),
            "--proof-file-path", &proof_path])
        .output();
    drop(proof_file);
    match output {
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr);
            if out.status.success() {
                let tx_hash = stderr.lines()
                    .find(|l| l.contains("stellar.expert"))
                    .map(|l| l.trim().to_string());
                Json(SubmitToContractResponse { success: true, tx_hash, error: None })
            } else {
                Json(SubmitToContractResponse { success: false, tx_hash: None, error: Some(stderr.trim().to_string()) })
            }
        }
        Err(e) => Json(SubmitToContractResponse { success: false, tx_hash: None, error: Some(format!("soroban CLI error: {e}")) }),
    }
}

async fn init_contract(
    State(state): State<AppState>,
    Json(req): Json<InitContractRequest>,
) -> Json<InitContractResponse> {
    let contract_id = match &state.contract_id {
        Some(id) => id.clone(),
        None => return Json(InitContractResponse { success: false, tx_hash: None, error: Some("CONTRACT_ID not configured".into()) }),
    };
    let seed = parse_hex_seed(&req.seed);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let vk_file = match tempfile::Builder::new().prefix("vk_").suffix(".json").tempfile() {
        Ok(f) => f,
        Err(e) => return Json(InitContractResponse { success: false, tx_hash: None, error: Some(format!("failed to create temp file: {e}")) }),
    };
    let vk_path = vk_file.path().to_str().unwrap().to_string();
    let vk_json = serde_json::json!({
        "alpha": g1_to_hex(&merchant.vk.alpha_g1),
        "beta": g2_to_hex(&merchant.vk.beta_g2),
        "gamma": g2_to_hex(&merchant.vk.gamma_g2),
        "delta": g2_to_hex(&merchant.vk.delta_g2),
        "ic": [
            g1_to_hex(&merchant.vk.gamma_abc_g1[0]),
            g1_to_hex(&merchant.vk.gamma_abc_g1[1]),
        ],
    });
    std::fs::write(vk_file.path(), serde_json::to_string(&vk_json).unwrap()).ok();
    let output = Command::new("soroban")
        .args(["contract", "invoke", "--id", &contract_id, "--source", "alice", "--network", "testnet", "--",
            "initialize",
            "--vk-file-path", &vk_path])
        .output();
    drop(vk_file);
    match output {
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr);
            if out.status.success() {
                let tx_hash = stderr.lines()
                    .find(|l| l.contains("stellar.expert"))
                    .map(|l| l.trim().to_string());
                Json(InitContractResponse { success: true, tx_hash, error: None })
            } else {
                Json(InitContractResponse { success: false, tx_hash: None, error: Some(stderr.trim().to_string()) })
            }
        }
        Err(e) => Json(InitContractResponse { success: false, tx_hash: None, error: Some(format!("soroban CLI error: {e}")) }),
    }
}

// ── Dashboard / Compliance Handlers ──

async fn get_dashboard_stats(State(app): State<AppState>) -> Json<DashboardStatsJson> {
    let seed = app.fixed_seed.as_ref().map(|s| parse_hex_seed(s));
    let _merchants = app.merchants.lock().unwrap();

    if let Some(seed) = seed {
        let ds = update_dashboard_state(&seed);
        let balance = format!("${:.2}", ds.total_volume as f64 / 100.0);
        let avg = if ds.transaction_count > 0 {
            format!("${:.2}", ds.total_volume as f64 / ds.transaction_count as f64 / 100.0)
        } else {
            "$0.00".into()
        };
        let recent: Vec<PaymentRecordJson> = ds.payments.iter().take(5).map(|p| PaymentRecordJson {
            tx_hash: String::new(),
            amount: p.amount,
            amount_usd: p.amount_usd.clone(),
            customer_id: p.customer_id.clone(),
            timestamp: p.timestamp,
            datetime: p.datetime.clone(),
            status: "completed".into(),
        }).collect();
        Json(DashboardStatsJson {
            total_volume: ds.total_volume,
            total_volume_usd: balance.clone(),
            transaction_count: ds.transaction_count as u64,
            average_transaction: avg,
            balance,
            daily_volume: vec![],
            recent_payments: recent,
        })
    } else {
        Json(DashboardStatsJson {
            total_volume: 0,
            total_volume_usd: "$0.00".into(),
            transaction_count: 0,
            average_transaction: "$0.00".into(),
            balance: "$0.00".into(),
            daily_volume: vec![],
            recent_payments: vec![],
        })
    }
}

async fn generate_compliance_report() -> Json<ComplianceReportJson> {
    Json(ComplianceReportJson {
        merchant_id: "050807b60d5991a595e72a371773cf79b684a0ee577a4ca16c0448906882abf6".into(),
        period_start: "2026-06-01".into(),
        period_end: "2026-06-24".into(),
        total_transactions: 1_247,
        total_volume_usd: "$154,230.00".into(),
        average_transaction_usd: "$123.68".into(),
        payments: vec![],
        generated_at: "2026-06-24T03:00:00Z".into(),
    })
}

async fn get_merchant_info(AxumPath(merchant_id): AxumPath<String>) -> Json<MerchantInfoJson> {
    Json(MerchantInfoJson {
        merchant_id,
        status: "active".into(),
        private_payments_enabled: true,
        supported_assets: vec!["USDC".into(), "XLM".into()],
        fee: "0.1%".into(),
        network: "Stellar Testnet".into(),
        balance: "$0.00 (private)".into(),
    })
}

async fn get_merchant_payments(
    State(_state): State<AppState>,
    AxumPath(seed_hex): AxumPath<String>,
) -> Json<MerchantPaymentsResponse> {
    let seed = parse_hex_seed(&seed_hex);
    let ds = update_dashboard_state(&seed);
    let balance = format!("${:.2}", ds.total_volume as f64 / 100.0);
    Json(MerchantPaymentsResponse {
        balance: balance.clone(),
        payments: ds.payments,
    })
}

async fn get_merchant_balance(
    State(_state): State<AppState>,
    AxumPath(seed_hex): AxumPath<String>,
) -> Json<MerchantBalanceResponse> {
    let seed = parse_hex_seed(&seed_hex);
    let ds = update_dashboard_state(&seed);
    Json(MerchantBalanceResponse {
        balance: format!("${:.2}", ds.total_volume as f64 / 100.0),
        note_count: ds.transaction_count as usize,
        visible_on_chain: "$0.00".into(),
    })
}

async fn get_balance(AxumPath(_merchant_id): AxumPath<String>) -> impl IntoResponse {
    (StatusCode::OK, "0.00 (private)")
}

/// Generate a proof using the merchant's public key (pk).
/// This is the DEMO path — production would use WASM on-device.
async fn wallet_generate_proof(
    Json(req): Json<WalletGenerateProofRequest>,
) -> Json<WalletGenerateProofResponse> {
    use privacy_circuits::customer_generate_proof;

    let pk_bytes = match hex::decode(&req.pk_hex) {
        Ok(b) => b,
        Err(e) => return Json(WalletGenerateProofResponse {
            success: false, a: String::new(), b: String::new(), c: String::new(),
            nullifier: String::new(), commitment: String::new(),
            error: Some(format!("invalid pk_hex: {e}")),
        }),
    };
    let pk = match ark_groth16::ProvingKey::<ark_bn254::Bn254>::deserialize_compressed(&mut &pk_bytes[..]) {
        Ok(p) => p,
        Err(e) => return Json(WalletGenerateProofResponse {
            success: false, a: String::new(), b: String::new(), c: String::new(),
            nullifier: String::new(), commitment: String::new(),
            error: Some(format!("invalid pk bytes: {e}")),
        }),
    };

    let mut customer_secret = [0u8; 32];
    let secret_bytes = hex::decode(&req.customer_secret).unwrap_or_default();
    let len = secret_bytes.len().min(32);
    customer_secret[..len].copy_from_slice(&secret_bytes[..len]);

    let mut merchant_id = [0u8; 32];
    let mid_bytes = hex::decode(&req.merchant_id).unwrap_or_default();
    let len2 = mid_bytes.len().min(32);
    merchant_id[..len2].copy_from_slice(&mid_bytes[..len2]);

    match customer_generate_proof(&pk, &customer_secret, req.amount, &merchant_id) {
        Ok((proof, nullifier, commitment)) => Json(WalletGenerateProofResponse {
            success: true,
            a: g1_to_hex(&proof.a),
            b: g2_to_hex(&proof.b),
            c: g1_to_hex(&proof.c),
            nullifier: fr_to_hex(&nullifier),
            commitment: fr_to_hex(&commitment),
            error: None,
        }),
        Err(e) => Json(WalletGenerateProofResponse {
            success: false, a: String::new(), b: String::new(), c: String::new(),
            nullifier: String::new(), commitment: String::new(),
            error: Some(format!("proof generation failed: {e}")),
        }),
    }
}

async fn export_transactions() -> impl IntoResponse {
    let csv = "tx_hash,amount,amount_usd,customer_id,timestamp,datetime,status\n";
    (StatusCode::OK, [("Content-Type", "text/csv"), ("Content-Disposition", "attachment; filename=transactions.csv")], csv)
}

/// Serve the proving key so the customer can build proofs on-device
async fn get_merchant_pk(
    State(state): State<AppState>,
    AxumPath(seed_hex): AxumPath<String>,
) -> Json<MerchantPkResponse> {
    let seed = parse_hex_seed(&seed_hex);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let mut pk_bytes = Vec::new();
    merchant.pk.serialize_compressed(&mut pk_bytes).unwrap();
    Json(MerchantPkResponse {
        pk_hex: hex::encode(pk_bytes),
        merchant_id: fr_to_hex(&merchant.merchant_id),
    })
}

async fn get_merchant_qr_info(
    State(state): State<AppState>,
    AxumPath(seed_hex): AxumPath<String>,
) -> Json<MerchantQrInfo> {
    let contract_id = state.contract_id.as_deref().unwrap_or("").to_string();
    let seed = parse_hex_seed(&seed_hex);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let base_url = format!("http://localhost:{}", std::env::var("PORT").unwrap_or_else(|_| "3000".into()));
    Json(MerchantQrInfo {
        api_url: base_url.clone(),
        merchant_id: fr_to_hex(&merchant.merchant_id),
        contract_id: contract_id.clone(),
        pk_url: format!("{}/api/merchant/{}/pk", base_url, seed_hex),
        seed_hex,
    })
}

async fn generate_viewing_key() -> Json<ViewingKeyResponse> {
    let mut rng = rand::thread_rng();
    let mut key = [0u8; 32];
    rng.fill_bytes(&mut key);
    Json(ViewingKeyResponse { key: hex::encode(key) })
}

// ── Main ──

#[tokio::main]
async fn main() {
    let contract_id = std::env::var("CONTRACT_ID").ok();
    let fixed_seed = std::env::var("MERCHANT_SEED").ok();

    let state = AppState {
        merchants: std::sync::Arc::new(Mutex::new(HashMap::new())),
        contract_id,
        fixed_seed,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let api_routes = Router::new()
        .route("/api/dashboard/stats", get(get_dashboard_stats))
        .route("/api/compliance/report", post(generate_compliance_report))
        .route("/api/compliance/viewing-key", post(generate_viewing_key))
        .route("/api/merchant/create", post(create_merchant))
        .route("/api/merchant/init-contract", post(init_contract))
        .route("/api/merchant/:merchant_id", get(get_merchant_info))
        .route("/api/merchant/:seed_hex/pk", get(get_merchant_pk))
        .route("/api/merchant/:seed_hex/payments", get(get_merchant_payments))
        .route("/api/merchant/:seed_hex/balance", get(get_merchant_balance))
        .route("/api/merchant/:seed_hex/qr-info", get(get_merchant_qr_info))
        .route("/api/payment/submit-to-contract", post(submit_to_contract))
        .route("/api/wallet/generate-proof", post(wallet_generate_proof))
        .route("/api/balance/:merchant_id", get(get_balance))
        .route("/api/export/transactions", get(export_transactions))
        .with_state(state);

    let app = Router::new()
        .merge(api_routes)
            .fallback_service(
                ServeDir::new("merchant-dashboard/dist")
                    .append_index_html_on_directories(true)
                    .fallback(ServeFile::new("merchant-dashboard/dist/index.html"))
            )
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Merchant API listening on http://0.0.0.0:3000");
    if std::env::var("CONTRACT_ID").is_ok() {
        println!("Contract submission enabled via CONTRACT_ID");
    }
    if std::env::var("MERCHANT_SEED").is_ok() {
        println!("Fixed merchant seed configured");
    }
    axum::serve(listener, app).await.unwrap();
}
