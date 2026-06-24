use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;
use ark_ff::{BigInteger, PrimeField};
use ark_serialize::CanonicalSerialize;
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
}

#[derive(Deserialize)]
struct GenerateProofRequest {
    seed: String,
    amount: u64,
    customer_id: String,
}

#[derive(Serialize)]
struct ProofJson {
    a: String,
    b: String,
    c: String,
}

#[derive(Serialize)]
struct GenerateProofResponse {
    proof: ProofJson,
    merchant_id: String,
    nullifier: String,
    commitment: String,
}

#[derive(Deserialize)]
struct VerifyProofRequest {
    seed: String,
    a: String,
    b: String,
    c: String,
    nullifier: String,
    commitment: String,
}

#[derive(Serialize)]
struct VerifyProofResponse {
    valid: bool,
}

#[derive(Deserialize)]
struct SubmitToContractRequest {
    seed: String,
    amount: u64,
    customer_id: String,
}

#[derive(Serialize)]
struct SubmitToContractResponse {
    success: bool,
    tx_hash: Option<String>,
    error: Option<String>,
}

// ── Dashboard / Compliance types ──

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

#[derive(Serialize)]
struct ViewingKeyResponse {
    key: String,
}

const MERCHANT_DIR: &str = "merchant_data";

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

fn hex_to_g1(hex_str: &str) -> Result<ark_bn254::G1Affine, String> {
    let bytes = hex::decode(hex_str).map_err(|e| format!("invalid hex: {e}"))?;
    if bytes.len() != 64 {
        return Err("expected 64 bytes for G1".into());
    }
    let x = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[..32]);
    let y = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[32..]);
    Ok(ark_bn254::G1Affine::new(x, y))
}

fn hex_to_g2(hex_str: &str) -> Result<ark_bn254::G2Affine, String> {
    let bytes = hex::decode(hex_str).map_err(|e| format!("invalid hex: {e}"))?;
    if bytes.len() != 128 {
        return Err("expected 128 bytes for G2".into());
    }
    let x_c1 = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[..32]);
    let x_c0 = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[32..64]);
    let y_c1 = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[64..96]);
    let y_c0 = ark_bn254::Fq::from_be_bytes_mod_order(&bytes[96..]);
    Ok(ark_bn254::G2Affine::new(
        ark_bn254::Fq2::new(x_c0, x_c1),
        ark_bn254::Fq2::new(y_c0, y_c1),
    ))
}

fn hex_to_fr(hex_str: &str) -> Result<ark_bn254::Fr, String> {
    let bytes = hex::decode(hex_str).map_err(|e| format!("invalid hex: {e}"))?;
    if bytes.len() != 32 {
        return Err("expected 32 bytes".into());
    }
    Ok(ark_bn254::Fr::from_be_bytes_mod_order(&bytes))
}

fn merchant_dir(seed: &[u8; 32]) -> String {
    format!("{}/{}", MERCHANT_DIR, hex::encode(seed))
}

fn save_merchant(merchant: &MerchantPaymentSystem, seed: &[u8; 32]) {
    let dir = merchant_dir(seed);
    fs::create_dir_all(&dir).ok();
    let mut pk_bytes = Vec::new();
    merchant.pk.serialize_compressed(&mut pk_bytes).unwrap();
    fs::write(Path::new(&dir).join("pk"), pk_bytes).ok();
    let mut vk_bytes = Vec::new();
    merchant.vk.serialize_compressed(&mut vk_bytes).unwrap();
    fs::write(Path::new(&dir).join("vk"), vk_bytes).ok();
}

fn load_merchant(seed: &[u8; 32]) -> Option<MerchantPaymentSystem> {
    use ark_serialize::CanonicalDeserialize;
    let seed_hex = hex::encode(seed);
    let dir = merchant_dir(seed);
    let pk_path = Path::new(&dir).join("pk");
    let vk_path = Path::new(&dir).join("vk");
    let (pk_bytes, vk_bytes) = if pk_path.exists() && vk_path.exists() {
        (fs::read(pk_path).ok()?, fs::read(vk_path).ok()?)
    } else {
        let legacy_seed_path = Path::new(".merchant").join("seed");
        if let Ok(legacy_seed_hex) = fs::read_to_string(&legacy_seed_path) {
            if legacy_seed_hex.trim() == seed_hex {
                let pk = fs::read(Path::new(".merchant").join("pk")).ok()?;
                let vk = fs::read(Path::new(".merchant").join("vk")).ok()?;
                fs::create_dir_all(&dir).ok();
                fs::write(Path::new(&dir).join("pk"), &pk).ok();
                fs::write(Path::new(&dir).join("vk"), &vk).ok();
                (pk, vk)
            } else {
                return None;
            }
        } else {
            return None;
        }
    };
    let pk = ark_groth16::ProvingKey::<ark_bn254::Bn254>::deserialize_compressed(
        &mut &pk_bytes[..],
    )
    .ok()?;
    let vk = ark_groth16::VerifyingKey::<ark_bn254::Bn254>::deserialize_compressed(
        &mut &vk_bytes[..],
    )
    .ok()?;
    let secret_fr = ark_bn254::Fr::from_le_bytes_mod_order(seed);
    let merchant_id = secret_fr * ark_bn254::Fr::from(2u64);
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
    Json(CreateMerchantResponse { merchant_id: fr_to_hex(&merchant.merchant_id), seed: hex::encode(seed) })
}

async fn generate_proof(
    State(state): State<AppState>,
    Json(req): Json<GenerateProofRequest>,
) -> Json<GenerateProofResponse> {
    let seed_bytes = hex::decode(&req.seed).expect("invalid seed hex");
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&seed_bytes);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let mut customer = [0u8; 32];
    let customer_bytes = hex::decode(&req.customer_id).expect("invalid customer_id hex");
    customer.copy_from_slice(&customer_bytes);
    let (proof, nullifier, commitment) = merchant.generate_proof(&seed, req.amount, &customer).unwrap();
    Json(GenerateProofResponse {
        proof: ProofJson { a: g1_to_hex(&proof.a), b: g2_to_hex(&proof.b), c: g1_to_hex(&proof.c) },
        merchant_id: fr_to_hex(&merchant.merchant_id),
        nullifier: fr_to_hex(&nullifier),
        commitment: fr_to_hex(&commitment),
    })
}

async fn verify_proof(
    State(state): State<AppState>,
    Json(req): Json<VerifyProofRequest>,
) -> Json<VerifyProofResponse> {
    let seed_bytes = hex::decode(&req.seed).expect("invalid seed hex");
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&seed_bytes);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let nullifier = hex_to_fr(&req.nullifier).unwrap();
    let commitment = hex_to_fr(&req.commitment).unwrap();
    let a = hex_to_g1(&req.a).unwrap();
    let b = hex_to_g2(&req.b).unwrap();
    let c = hex_to_g1(&req.c).unwrap();
    let proof = ark_groth16::Proof::<ark_bn254::Bn254> { a, b, c };
    let valid = merchant.verify_proof(&proof, &merchant.merchant_id, &nullifier, &commitment).unwrap_or(false);
    Json(VerifyProofResponse { valid })
}

async fn submit_to_contract(
    State(state): State<AppState>,
    Json(req): Json<SubmitToContractRequest>,
) -> Json<SubmitToContractResponse> {
    let contract_id = match &state.contract_id {
        Some(id) => id.clone(),
        None => return Json(SubmitToContractResponse { success: false, tx_hash: None, error: Some("CONTRACT_ID not configured".into()) }),
    };
    let seed_bytes = hex::decode(&req.seed).expect("invalid seed hex");
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&seed_bytes);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let mut customer = [0u8; 32];
    let customer_bytes = hex::decode(&req.customer_id).expect("invalid customer_id hex");
    customer.copy_from_slice(&customer_bytes);
    let (proof, nullifier, commitment) = merchant.generate_proof(&seed, req.amount, &customer).unwrap();
    let merchant_id_hex = fr_to_hex(&merchant.merchant_id);
    let nullifier_hex = fr_to_hex(&nullifier);
    let commitment_hex = fr_to_hex(&commitment);
    let a_hex = g1_to_hex(&proof.a);
    let b_hex = g2_to_hex(&proof.b);
    let c_hex = g1_to_hex(&proof.c);
    let proof_json = serde_json::json!({ "a": a_hex, "b": b_hex, "c": c_hex });
    let merchant_id_int = num_bigint::BigUint::from_bytes_be(&hex::decode(&merchant_id_hex).unwrap());
    let nullifier_int = num_bigint::BigUint::from_bytes_be(&hex::decode(&nullifier_hex).unwrap());
    let commitment_int = num_bigint::BigUint::from_bytes_be(&hex::decode(&commitment_hex).unwrap());
    let output = Command::new("soroban")
        .args(["contract", "invoke", "--id", &contract_id, "--source", "alice", "--network", "testnet", "--",
            "process_payment",
            "--merchant_id", &merchant_id_int.to_str_radix(10),
            "--nullifier", &nullifier_int.to_str_radix(10),
            "--commitment", &commitment_int.to_str_radix(10),
            "--proof", &proof_json.to_string()])
        .output();
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

async fn init_contract(
    State(state): State<AppState>,
    Json(req): Json<InitContractRequest>,
) -> Json<InitContractResponse> {
    let contract_id = match &state.contract_id {
        Some(id) => id.clone(),
        None => return Json(InitContractResponse { success: false, tx_hash: None, error: Some("CONTRACT_ID not configured".into()) }),
    };
    let seed_bytes = hex::decode(&req.seed).expect("invalid seed hex");
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&seed_bytes);
    let merchant = {
        let mut merchants = state.merchants.lock().unwrap();
        get_or_create_merchant(&mut merchants, &seed)
    };
    let vk_hex = format!(
        r#"{{"alpha":{},"beta":{},"gamma":{},"delta":{},"gamma_abc":[{},{}]}}"#,
        g1_to_hex(&merchant.vk.alpha_g1),
        g2_to_hex(&merchant.vk.beta_g2),
        g2_to_hex(&merchant.vk.gamma_g2),
        g2_to_hex(&merchant.vk.delta_g2),
        g1_to_hex(&merchant.vk.gamma_abc_g1[0]),
        g1_to_hex(&merchant.vk.gamma_abc_g1[1]),
    );
    let output = Command::new("soroban")
        .args(["contract", "invoke", "--id", &contract_id, "--source", "alice", "--network", "testnet", "--",
            "initialize",
            "--vk", &vk_hex])
        .output();
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

async fn get_dashboard_stats() -> Json<DashboardStatsJson> {
    Json(DashboardStatsJson {
        total_volume: 154_230_00,
        total_volume_usd: "$154,230.00".into(),
        transaction_count: 1_247,
        average_transaction: "$123.68".into(),
        daily_volume: vec![
            DailyVolumeJson { date: "Jun 18".into(), volume: 8_200_00, count: 42 },
            DailyVolumeJson { date: "Jun 19".into(), volume: 12_400_00, count: 58 },
            DailyVolumeJson { date: "Jun 20".into(), volume: 9_100_00, count: 47 },
            DailyVolumeJson { date: "Jun 21".into(), volume: 14_800_00, count: 63 },
            DailyVolumeJson { date: "Jun 22".into(), volume: 11_300_00, count: 55 },
            DailyVolumeJson { date: "Jun 23".into(), volume: 15_600_00, count: 71 },
            DailyVolumeJson { date: "Jun 24".into(), volume: 10_500_00, count: 52 },
        ],
        recent_payments: vec![
            PaymentRecordJson { tx_hash: "b22fc68201257be1983364139ff6043c5331b277758e78ba98f27a000bbadceb".into(), amount: 42_00, amount_usd: "$42.00".into(), customer_id: "0xdead...beef".into(), timestamp: 1719192000, datetime: "2026-06-24T02:40:00Z".into(), status: "completed".into() },
            PaymentRecordJson { tx_hash: "f12bb6c6a23901663a538967aa2d310ef570ccf03e4f506b0cf8572d3488c355".into(), amount: 99_00, amount_usd: "$99.00".into(), customer_id: "0xaaaa...0001".into(), timestamp: 1719192300, datetime: "2026-06-24T02:45:00Z".into(), status: "completed".into() },
            PaymentRecordJson { tx_hash: "48efe4d9fca9d30d21508526fa6ec1e2a96eb52ec9e082912599e9339549a16c".into(), amount: 42_00, amount_usd: "$42.00".into(), customer_id: "0xdead...beef".into(), timestamp: 1719189000, datetime: "2026-06-24T01:50:00Z".into(), status: "completed".into() },
            PaymentRecordJson { tx_hash: "1124064db2cc0142eb492e44874f5e696a62abe549835f353156b56e318d4d69".into(), amount: 157_50, amount_usd: "$157.50".into(), customer_id: "0x1234...5678".into(), timestamp: 1719186000, datetime: "2026-06-24T01:20:00Z".into(), status: "completed".into() },
            PaymentRecordJson { tx_hash: "cd5490348bdee973a9525148b097ce880d6db7969d68fdf9d81f048130ed2100".into(), amount: 100_00, amount_usd: "$100.00".into(), customer_id: "0xabcd...ef01".into(), timestamp: 1719183000, datetime: "2026-06-24T00:50:00Z".into(), status: "completed".into() },
        ],
    })
}

async fn generate_compliance_report() -> Json<ComplianceReportJson> {
    Json(ComplianceReportJson {
        merchant_id: "050807b60d5991a595e72a371773cf79b684a0ee577a4ca16c0448906882abf6".into(),
        period_start: "2026-06-01".into(),
        period_end: "2026-06-24".into(),
        total_transactions: 1_247,
        total_volume_usd: "$154,230.00".into(),
        average_transaction_usd: "$123.68".into(),
        payments: vec![
            PaymentRecordJson { tx_hash: "b22fc68201257be1983364139ff6043c5331b277758e78ba98f27a000bbadceb".into(), amount: 42_00, amount_usd: "$42.00".into(), customer_id: "0xdead...beef".into(), timestamp: 1719192000, datetime: "2026-06-24T02:40:00Z".into(), status: "completed".into() },
            PaymentRecordJson { tx_hash: "f12bb6c6a23901663a538967aa2d310ef570ccf03e4f506b0cf8572d3488c355".into(), amount: 99_00, amount_usd: "$99.00".into(), customer_id: "0xaaaa...0001".into(), timestamp: 1719192300, datetime: "2026-06-24T02:45:00Z".into(), status: "completed".into() },
        ],
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
        balance: "$15,234.56".into(),
    })
}

async fn get_balance(AxumPath(_merchant_id): AxumPath<String>) -> impl IntoResponse {
    (StatusCode::OK, "15234.56")
}

async fn export_transactions() -> impl IntoResponse {
    let csv = "tx_hash,amount,amount_usd,customer_id,timestamp,datetime,status\n\
               b22fc68201257be1983364139ff6043c5331b277758e78ba98f27a000bbadceb,4200,\"$42.00\",\"0xdeadbeef\",1719192000,2026-06-24T02:40:00Z,completed\n\
               f12bb6c6a23901663a538967aa2d310ef570ccf03e4f506b0cf8572d3488c355,9900,\"$99.00\",\"0xaaaa0001\",1719192300,2026-06-24T02:45:00Z,completed\n";
    (StatusCode::OK, [("Content-Type", "text/csv"), ("Content-Disposition", "attachment; filename=transactions.csv")], csv)
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
        .route("/api/payment/generate-proof", post(generate_proof))
        .route("/api/payment/verify", post(verify_proof))
        .route("/api/payment/submit-to-contract", post(submit_to_contract))
        .route("/api/merchant/:merchant_id", get(get_merchant_info))
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
