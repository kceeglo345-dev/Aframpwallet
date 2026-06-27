use dialoguer::{Confirm, Input, Select};
use serde::Deserialize;
use std::cmp::min;
use std::env;

const DEFAULT_API: &str = "http://localhost:3000";

#[derive(Clone, Deserialize)]
struct CreateResponse {
    merchant_id: String,
    seed: String,
}

#[derive(Deserialize)]
struct GenerateResponse {
    success: bool,
    a: String,
    b: String,
    c: String,
    nullifier: String,
    commitment: String,
    error: Option<String>,
}

#[derive(Deserialize)]
struct SubmitResponse {
    success: bool,
    tx_hash: Option<String>,
    error: Option<String>,
}

fn api_url() -> String {
    env::var("MERCHANT_API").unwrap_or_else(|_| DEFAULT_API.to_string())
}

fn menu_items() -> Vec<&'static str> {
    vec![
        "Create New Merchant",
        "Generate + Submit Payment",
        "Submit to Contract",
    ]
}

fn create_merchant() -> Option<CreateResponse> {
    println!("\n--- Create Merchant ---");
    let url = format!("{}/merchant/create", api_url());
    match ureq::post(&url).send("") {
        Ok(resp) => {
            match resp.into_body().read_json::<CreateResponse>() {
                Ok(r) => {
                    println!("\n✅ Merchant created!");
                    println!("   ID:   {}", r.merchant_id);
                    println!("   Seed: {}", r.seed);
                    println!("\n⚠️  SAVE YOUR SEED — it's your private key!");
                    Some(r)
                }
                Err(e) => {
                    eprintln!("❌ Failed to parse response: {e}");
                    None
                }
            }
        }
        Err(e) => {
            eprintln!("❌ API error: {e}");
            None
        }
    }
}

fn generate_proof(seed: &str) {
    println!("\n--- Generate Payment Proof ---");

    let amount: u64 = loop {
        let input: String = Input::new()
            .with_prompt("Payment amount")
            .default("100".into())
            .interact_text()
            .unwrap();
        match input.parse() {
            Ok(v) => break v,
            Err(_) => eprintln!("Invalid amount, try again"),
        }
    };

    println!("\nGenerating proof...");

    // Fetch merchant's PK first
    let pk_url = format!("{}/api/merchant/{}/pk", api_url(), seed);
    let pk_resp = ureq::get(&pk_url).call().unwrap().into_body().read_json::<serde_json::Value>().unwrap();
    let pk_hex = pk_resp["pk_hex"].as_str().unwrap_or("").to_string();
    let merchant_id = pk_resp["merchant_id"].as_str().unwrap_or("").to_string();

    // Generate proof using the wallet endpoint
    let rng_secret: String = (0..64).map(|_| { const CHARS: &[u8] = b"0123456789abcdef"; CHARS[rand::random::<usize>() % 16] as char }).collect();
    let url = format!("{}/api/wallet/generate-proof", api_url());
    let req = serde_json::json!({
        "pk_hex": pk_hex,
        "customer_secret": rng_secret,
        "amount": amount,
        "merchant_id": merchant_id,
    });

    match ureq::post(&url).send_json(&req) {
        Ok(resp) => {
            match resp.into_body().read_json::<GenerateResponse>() {
                Ok(r) => {
                    if !r.success {
                        eprintln!("❌ Proof generation failed: {}", r.error.unwrap_or_default());
                        return;
                    }
                    println!("\n✅ Proof generated!");
                    println!("   Nullifier:   {}", r.nullifier);
                    println!("   Commitment:  {}", r.commitment);
                    println!("\n   Proof.A: {}", &r.a[..min(32, r.a.len())]);
                    println!("   Proof.B: {}...", &r.b[..min(32, r.b.len())]);
                    println!("   Proof.C: {}", &r.c[..min(32, r.c.len())]);

                    if Confirm::new()
                        .with_prompt("Submit this proof to contract?")
                        .default(true)
                        .interact()
                        .unwrap()
                    {
                        submit_proof_to_contract(seed, &r.a, &r.b, &r.c, &r.nullifier, &r.commitment);
                    }
                }
                Err(e) => eprintln!("❌ Failed to parse response: {e}"),
            }
        }
        Err(e) => eprintln!("❌ API error: {e}"),
    }
}

fn submit_proof_to_contract(seed: &str, a: &str, b: &str, c: &str, nullifier: &str, commitment: &str) {
    let amount_str: String = Input::new()
        .with_prompt("Payment amount (in cents)")
        .default("100".into())
        .interact_text()
        .unwrap();
    let amount: u64 = amount_str.parse().unwrap_or(100);
    let customer_id: String = Input::new()
        .with_prompt("Customer ID (64 hex chars)")
        .default("00000000000000000000000000000000000000000000000000000000deadbeef".into())
        .interact_text()
        .unwrap();

    println!("\nSubmitting to contract...");
    let url = format!("{}/api/payment/submit-to-contract", api_url());
    let req = serde_json::json!({
        "seed": seed,
        "a": a,
        "b": b,
        "c": c,
        "nullifier": nullifier,
        "commitment": commitment,
        "amount": amount,
        "customer_id": customer_id,
    });

    match ureq::post(&url).send_json(&req) {
        Ok(resp) => {
            match resp.into_body().read_json::<SubmitResponse>() {
                Ok(r) => {
                    if r.success {
                        println!("\n✅ Submitted to contract!");
                        if let Some(tx) = r.tx_hash { println!("   TX: {tx}"); }
                    } else {
                        println!("\n❌ Submission failed: {}", r.error.unwrap_or_default());
                    }
                }
                Err(e) => eprintln!("❌ Failed to parse response: {e}"),
            }
        }
        Err(e) => eprintln!("❌ API error: {e}"),
    }
}

fn submit_to_contract(seed: &str) {
    println!("\n--- Submit Payment to Contract ---");

    let amount: u64 = loop {
        let input: String = Input::new()
            .with_prompt("Payment amount")
            .default("100".into())
            .interact_text()
            .unwrap();
        match input.parse() {
            Ok(v) => break v,
            Err(_) => eprintln!("Invalid amount, try again"),
        }
    };

    let customer_id: String = Input::new()
        .with_prompt("Customer ID (64 hex chars)")
        .default("00000000000000000000000000000000000000000000000000000000deadbeef".into())
        .interact_text()
        .unwrap();

    // Step 1: Fetch merchant's PK
    println!("\nFetching merchant key...");
    let pk_url = format!("{}/api/merchant/{}/pk", api_url(), seed);
    let pk_resp = ureq::get(&pk_url).call().unwrap().into_body().read_json::<serde_json::Value>().unwrap();
    let pk_hex = pk_resp["pk_hex"].as_str().unwrap_or("").to_string();
    let merchant_id = pk_resp["merchant_id"].as_str().unwrap_or("").to_string();

    // Step 2: Generate proof
    println!("Generating proof...");
    let rng_secret: String = (0..64).map(|_| { const CHARS: &[u8] = b"0123456789abcdef"; CHARS[rand::random::<usize>() % 16] as char }).collect();
    let gen_url = format!("{}/api/wallet/generate-proof", api_url());
    let gen_req = serde_json::json!({
        "pk_hex": pk_hex,
        "customer_secret": rng_secret,
        "amount": amount,
        "merchant_id": merchant_id,
    });
    let gen_resp = ureq::post(&gen_url).send_json(&gen_req).unwrap().into_body().read_json::<GenerateResponse>().unwrap();
    if !gen_resp.success {
        eprintln!("❌ Proof generation failed: {}", gen_resp.error.unwrap_or_default());
        return;
    }

    // Step 3: Submit to contract
    println!("Submitting proof to contract...");
    let url = format!("{}/api/payment/submit-to-contract", api_url());
    let req = serde_json::json!({
        "seed": seed,
        "a": gen_resp.a,
        "b": gen_resp.b,
        "c": gen_resp.c,
        "nullifier": gen_resp.nullifier,
        "commitment": gen_resp.commitment,
        "amount": amount,
        "customer_id": customer_id,
    });

    match ureq::post(&url).send_json(&req) {
        Ok(resp) => {
            match resp.into_body().read_json::<SubmitResponse>() {
                Ok(r) => {
                    if r.success {
                        println!("\n✅ Proof submitted to contract!");
                        if let Some(tx) = r.tx_hash {
                            println!("   Tx: {}", tx);
                        }
                    } else {
                        println!("\n❌ Submission failed");
                        if let Some(e) = r.error {
                            println!("   Error: {}", e);
                        }
                    }
                }
                Err(e) => eprintln!("❌ Failed to parse response: {e}"),
            }
        }
        Err(e) => eprintln!("❌ API error: {e}"),
    }
}

fn main() {
    let mut seed: Option<String> = None;

    loop {
        println!("\n═══════════════════════════════");
        println!("   🔐 POS Payment Terminal");
        println!("═══════════════════════════════");

        let selection = Select::new()
            .items(&menu_items())
            .default(0)
            .interact()
            .unwrap();

        match selection {
            0 => {
                if let Some(r) = create_merchant() {
                    seed = Some(r.seed);
                }
            }
            1 => {
                let s = match seed.as_ref() {
                    Some(s) => s.clone(),
                    None => {
                        let input: String = Input::new()
                            .with_prompt("Merchant seed")
                            .interact_text()
                            .unwrap();
                        seed = Some(input.clone());
                        input
                    }
                };
                generate_proof(&s);
            }
            2 => {
                let s = match seed.as_ref() {
                    Some(s) => s.clone(),
                    None => {
                        let input: String = Input::new()
                            .with_prompt("Merchant seed")
                            .interact_text()
                            .unwrap();
                        seed = Some(input.clone());
                        input
                    }
                };
                submit_to_contract(&s);
            }
            3 => {
                println!("\n👋 Goodbye!");
                break;
            }
            _ => unreachable!(),
        }

        if selection != 4 {
            if !Confirm::new()
                .with_prompt("\nBack to menu?")
                .default(true)
                .interact()
                .unwrap()
            {
                println!("\n👋 Goodbye!");
                break;
            }
        }
    }
}
