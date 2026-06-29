<p align="center">
  <img src="https://raw.githubusercontent.com/kelly-musk/Aframpwallet/master/merchant-dashboard/public/favicon.svg" width="80" />
</p>

<h1 align="center">Aframp</h1>

<p align="center">
  <strong>Zero-Knowledge Privacy Layer for Stellar Merchant Payments</strong>
</p>

<p align="center">
  <a href="https://github.com/kelly-musk/Aframpwallet"><img src="https://img.shields.io/badge/Stellar-Testnet-7B1FA2" /></a>
  <a href="https://github.com/kelly-musk/Aframpwallet"><img src="https://img.shields.io/badge/ZK-Groth16_Bn254-3B71E3" /></a>
  <a href="https://github.com/kelly-musk/Aframpwallet"><img src="https://img.shields.io/badge/WASM-Client_Side-FF6B35" /></a>
  <a href="https://github.com/kelly-musk/Aframpwallet"><img src="https://img.shields.io/badge/License-MIT-green" /></a>
</p>

---

## The Problem

Every Stellar transaction — amount, sender, receiver — is visible to the entire network.

For merchants, this is a business liability:
- **Competitors** track your revenue and customer activity
- **Customers** lose financial privacy on every purchase
- **Regulations** (GDPR, data protection) require confidentiality that public blockchains don't provide
- **High-value B2B payments** expose sensitive business relationships

## The Solution

**Aframp** wraps Stellar payments in Groth16 zero-knowledge proofs over BN254. The blockchain sees only a validity proof and a unique nullifier — *nothing else*. Payment amounts, customer identities, and merchant relationships stay cryptographically hidden.

Proofs are generated **client-side via WASM** — the customer's secret never leaves their device. The merchant API only receives the proof and relays it to the Soroban smart contract.

| Without Aframp | With Aframp |
|---|---|
| Amount, sender, receiver public | Only validity proof on-chain |
| Competitors see your volume | Zero knowledge revealed |
| Customer data exposed | Merchant controls all data via viewing keys |
| No regulatory compliance path | Selective disclosure for auditors |

## Architecture

```
aframp/
├── privacy-circuits/       # ZK Circuit + Groth16 prover/verifier (arkworks)
│   └── src/lib.rs          # PaymentCircuit, MerchantPaymentSystem
├── privacy-contract/       # Soroban smart contract (no_std WASM)
│   └── src/lib.rs          # Groth16 verifier via BN254 pairing checks
├── privacy-cli/            # Terminal CLI for merchant ops
├── merchant-api/           # Axum REST API server (port 3000)
│   └── src/main.rs         # Merchant CRUD, proof relay, dashboard stats
├── pos-client/             # POS terminal TUI (dialoguer + ureq)
├── merchant-dashboard/     # React 19 + Vite + Tailwind merchant console
│   └── src/
│       ├── pages/          # Dashboard, Transactions, Compliance, Pay Demo
│       ├── components/     # Navbar, Footer, AppLayout, StatsCard
│       └── services/       # API client, WASM prover wrapper
├── wallet-wasm/            # WASM-compiled ZK prover (wasm-bindgen)
│   └── src/lib.rs          # generate_proof() exported to JS
└── wallet-app/             # React Native (Expo) mobile wallet for customers
```

## End-to-End Flow

```
                      CLIENT-SIDE PRIVACY FLOW

  Browser/App                        Merchant
  ────────────                       ────────

  1. Fetch merchant's proving key (pk_hex)
     via GET /api/merchant/:id/pk

  2. Generate random customer secret (32 bytes)
     ├── secret stays in browser memory
     ├── WASM prover computes:
     │     nullifier  = secret + amount
     │     commitment = secret × amount × merchant_id
     └── WASM prover generates Groth16 proof

  3. Submit proof (a, b, c, nullifier, commitment)
     to POST /api/payment/submit-to-contract

  4. Merchant API relays to Soroban contract
     ├── Contract verifies BN254 pairing checks
     ├── Stores nullifier (prevents double-spend)
     └── Encrypts payment note for dashboard

  5. Merchant views in dashboard
     ├── Decrypted with viewing key (AES-256-GCM)
     ├── Balance, transactions, charts
     └── Compliance reports with selective disclosure
```

## Tech Stack

| Component | Technology |
|---|---|
| Proving System | arkworks 0.4 + Groth16 (BN254) |
| Smart Contracts | Soroban (Stellar Protocol 25+) |
| Backend API | Rust + Axum + Tokio |
| Frontend | React 19 + Vite + TypeScript + Tailwind v4 |
| Client-Side ZK | WASM (wasm-bindgen, 237 KB) |
| Data Fetching | TanStack React Query |
| Charts | Chart.js + Recharts |
| Mobile | React Native (Expo) |
| POS Client | Rust + dialoguer TUI |

## Quick Start

### Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Soroban CLI (for contract deployment)
cargo install soroban-cli --version 27.0.0

# Stellar testnet identity
soroban keys generate alice --network testnet
```

### Build & Run

```bash
# Clone and build
git clone https://github.com/kelly-musk/Aframpwallet.git
cd Aframpwallet
cargo build

# Build frontend
cd merchant-dashboard && npm install && npm run build && cd ..

# Start the API server
CONTRACT_ID=CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y \
./target/debug/merchant-api
```

Open **http://localhost:3000** → Click **"Get Started"** → Follow the onboarding wizard.

### Generate a Proof (Client-Side WASM Demo)

Visit **http://localhost:3000/pay** after starting the server:

1. Enter a merchant seed hex
2. Enter an amount
3. Click **"Generate Proof (in browser)"** — the WASM prover runs locally
4. Submit to the Soroban contract

The customer secret is generated by `crypto.getRandomValues()` and never sent to the server. Proof generation happens entirely in the browser via the compiled `wallet-wasm` module.

### CLI Usage

```bash
# Create merchant identity and save keys
cargo run -p privacy-cli -- merchant

# Initialize a deployed contract with your VK
cargo run -p privacy-cli -- init-contract <CONTRACT_ID>

# Generate a payment proof
cargo run -p privacy-cli -- proof
```

### Run Tests

```bash
cargo test                    # Unit tests (circuit + contract) — 10 tests
./test_e2e.sh                 # End-to-end integration test (12 checks)
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/merchant/create` | Create merchant identity (generates seed, pk, vk) |
| GET | `/api/merchant/:seed_hex/pk` | Fetch proving key for client-side proof generation |
| GET | `/api/merchant/:seed_hex/payments` | List payment records |
| GET | `/api/merchant/:seed_hex/balance` | Merchant balance |
| GET | `/api/merchant/:seed_hex/qr-info` | QR code data for customer wallet |
| POST | `/api/payment/submit-to-contract` | Submit proof to Soroban contract |
| POST | `/api/merchant/init-contract` | Initialize contract with verifying key |
| GET | `/api/dashboard/stats` | Dashboard analytics |
| POST | `/api/compliance/report` | Compliance report |
| POST | `/api/compliance/viewing-key` | Generate viewing key for decryption |
| GET | `/api/export/transactions` | CSV export |

## Smart Contract

Deployed on Stellar Testnet:

```
CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y
```

The Soroban contract (`privacy-contract/`) exposes:
- `initialize(vk)` — Store verifying key
- `verify_proof(proof, pub_signals)` — Groth16 BN254 pairing check
- `process_payment(proof, merchant_id, nullifier, commitment)` — Verify + nullifier check + record
- `is_nullifier_used(nullifier)` — Check double-spend status

## Repository Structure

| Directory | Lines | Description |
|---|---|---|
| `privacy-circuits/` | ~250 | ZK circuit with 3 R1CS constraints |
| `privacy-contract/` | ~390 | Soroban Groth16 verifier, 6 passing tests |
| `merchant-api/` | ~700 | Axum API server, 14 routes |
| `merchant-dashboard/` | ~2,000 | React SPA, 11 pages |
| `wallet-wasm/` | ~65 | WASM-compiled prover (237 KB) |
| `privacy-cli/` | ~280 | Terminal CLI |
| `pos-client/` | ~330 | POS TUI |
| `wallet-app/` | ~900 | React Native mobile wallet |

## License

MIT — Built for the Stellar Hackathon.
