fn main() {
    let mut rng = rand::thread_rng();
    let signing_key = ed25519_dalek::SigningKey::generate(&mut rng);
    let verifying_key = signing_key.verifying_key();
    println!("Secret: {}", hex::encode(signing_key.to_bytes()));
    println!("Public: {}", hex::encode(verifying_key.to_bytes()));
}
