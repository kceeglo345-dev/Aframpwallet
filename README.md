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

**Aframp** wraps Stellar payments in Groth16 zero-knowledge proofs. The blockchain sees only a validity proof and a unique nullifier — *nothing else*. Payment amounts, customer identities, and merchant relationships stay cryptographically hidden.

| Without Aframp | With Aframp |
|---|---|
| Amount, sender, receiver public | Only validity proof on-chain |
| Competitors see your volume | Zero knowledge revealed |
| Customer data exposed | Merchant controls all data |
| No regulatory compliance path | Selective disclosure via viewing keys |

## How It Works

```
                    ┌─────────────────────────────────┐
                    │      Merchant Secret (32B)      │
                    └──────────┬──────────────────────┘
                               │
                    ┌──────────▼──────────────────────┐
                    │     ZK Circuit (4 constraints)   │
                    │                                  │
                    │  merchant_id = secret × 2        │
                    │  nullifier = secret + amount     │
                    │  commitment = secret × amt × cust│
                    │  amount × inv(amount) = 1        │
                    └──────────┬──────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌────────────┐   ┌────────────┐   ┌──────────────┐
      │ Merchant   │   │ Nullifier  │   │ Commitment   │
      │ ID (secret)│   │ (unique)   │   │ (blinded)    │
      └────────────┘   └────────────┘   └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────────────────┐
                    │   Soroban Contract Verifier      │
                    │   (BN254 Pairing Checks)         │
                    └─────────────────────────────────┘
```

**Circuit Constraints:**
1. `merchant_id = secret × 2` — Merchant identity derived from seed
2. `nullifier = secret + amount` — Unique per payment, prevents double-spend  
3. `commitment = secret × amount × customer` — Binds payment to customer
4. `amount × inv(amount) = 1` — Ensures non-zero amount

### End-to-End Privacy Flow

```
                        COMPLETE PRIVACY FLOW

  Customer                       Merchant
  ────────                       ────────

  1. Customer pays
     ├── Encrypt data (amount, customer)
     ├── Generate commitment
     └── Submit to contract

  2. Contract
     ├── Receives encrypted payment
     ├── Stores on-chain (encrypted)
     └── Nullifier prevents double-spend

  3. Merchant opens dashboard
     ├── Viewing key decrypts all payments
     ├── Balance calculated client-side
     └── Transactions visible only to merchant

  4. Compliance (optional)
     ├── Merchant shares viewing key
     ├── Auditor decrypts transactions
     └── Report generated
```

## Demo

**Live at:** [http://localhost:3000](http://localhost:3000)

**Smart Contract:** `CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y` (Stellar Testnet)

**GitHub:** [github.com/kelly-musk/Aframpwallet](https://github.com/kelly-musk/Aframpwallet)

### Screenshots

_Coming soon_

---

## Architecture

```
aframp/
├── privacy-circuits/       # ZK Circuit + Groth16 prover/verifier
│   └── src/lib.rs          # PaymentCircuit, MerchantPaymentSystem
├── privacy-contract/       # Soroban smart contract
│   └── src/lib.rs          # Groth16 verifier (BN254)
├── privacy-cli/            # Terminal CLI for merchants
├── merchant-api/           # Axum REST API server
│   └── src/main.rs         # /api/* endpoints, CORS, static files
├── pos-client/             # POS terminal TUI (dialoguer)
├── merchant-dashboard/     # React + Vite merchant console
│   └── src/
│       ├── pages/          # Home, Features, Dashboard, etc.
│       └── components/     # Navbar, Footer, AppLayout
└── privacy-utils/          # Shared helpers
```

### Tech Stack

| Component | Technology |
|---|---|
| Proving System | arkworks 0.4 + Groth16 (BN254) |
| Smart Contracts | Soroban (Stellar Protocol 25+) |
| Backend API | Rust + Axum + Tokio |
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Chart.js + react-chartjs-2 |
| Data Fetching | TanStack React Query |
| POS Client | Rust + dialoguer TUI |

---

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
cargo test                    # Unit tests (circuit + contract)
./test_e2e.sh                 # End-to-end integration test (12 checks)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/merchant/create` | Create merchant identity |
| POST | `/api/payment/generate-proof` | Generate ZK proof |
| POST | `/api/payment/verify` | Local proof verification |
| POST | `/api/payment/submit-to-contract` | Submit to Stellar |
| POST | `/api/compliance/report` | Compliance report |
| POST | `/api/compliance/viewing-key` | Generate viewing key |
| GET | `/api/dashboard/stats` | Dashboard analytics |
| GET | `/api/merchant/:id` | Merchant info |
| GET | `/api/export/transactions` | CSV export |

---

## Team

Built for the Stellar Hackathon.

---

## License

MIT
