# Aframp

Zero-knowledge privacy layer for Stellar merchant payments.

Aframp wraps Stellar payments in Groth16 zero-knowledge proofs (BN254), hiding payment amounts, customer identities, and business relationships while maintaining full verifiability and regulatory compliance.

## How it works

```
Merchant Secret ──→ Merchant ID (secret × 2)
                 ──→ Nullifier (secret + amount) — unique per payment, prevents double-spend
                 ──→ Commitment (secret × amount × customer) — binds payment to customer
```

The circuit enforces 4 constraints. The merchant generates a proof locally and submits it to the Soroban smart contract, which verifies via BN254 pairing checks. The contract sees only the proof and nullifier — no amounts, no identities.

## Architecture

```
privacy-circuits/    — PaymentCircuit + MerchantPaymentSystem (Groth16 on BN254, arkworks 0.4)
privacy-contract/    — Soroban smart contract with Groth16 verifier
privacy-utils/       — Shared types and helpers
privacy-cli/         — CLI for merchant setup and proof generation
merchant-api/        — Axum REST API server (Rust)
pos-client/          — Terminal-based POS client (dialoguer TUI)
merchant-dashboard/  — Merchant console (React + Vite + Tailwind v4 + Chart.js)
```

## Smart Contract

Deployed on Stellar testnet: `CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y`

Four exported functions:
- `initialize` — store verification key
- `verify_proof` — BN254 pairing check
- `process_payment` — verify proof + check nullifier + settle
- `is_nullifier_used` — check for double-spend

## Getting Started

### Prerequisites

- Rust (edition 2021)
- Soroban CLI 27.0.0
- Node.js 20+
- Stellar testnet identity (`soroban keys generate alice --network testnet`)

### Build

```bash
cargo build
cd merchant-dashboard && npm install && npm run build
```

### Run the server

```bash
CONTRACT_ID=CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y \
MERCHANT_SEED=<your_32_byte_hex_seed> \
./target/debug/merchant-api
```

Open http://localhost:3000

### CLI

```bash
# Create merchant identity
cargo run -p privacy-cli -- merchant

# Initialize deployed contract with your VK
cargo run -p privacy-cli -- init-contract <CONTRACT_ID>

# Generate a payment proof
cargo run -p privacy-cli -- proof
```

### Tests

```bash
cargo test                      # circuit + contract tests
./test_e2e.sh                   # full integration test (12 steps)
```

## License

MIT
