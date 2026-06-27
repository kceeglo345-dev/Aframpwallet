# Aframp Wallet — Frontend Guide

## What Is Aframp?

Aframp is a **zero-knowledge privacy layer for Stellar merchant POS payments**. Customers generate ZK proofs on-device so the merchant never sees their secret, and the on-chain transaction only reveals a nullifier + commitment (no amount, no customer identity).

```
┌──────────────┐     QR (api_url, contract_id, merchant_id, seed_hex)     ┌──────────────┐
│  Merchant    │ ──────────────────────────────────────────────────────>   │   Wallet     │
│  Dashboard   │                                                          │   App        │
│              │ <── GET /api/merchant/:seed_hex/pk ───────────────────   │              │
│  API Server  │                                                          │              │
│              │     ─── POST process_payment (proof, merchant_id,        │              │
│  Contract    │         nullifier, commitment) ───────────────────────>   │              │
│  CBNGF...    │                                                          │              │
└──────────────┘                                                          └──────────────┘
```

## Backend Stack

| Component | What It Does | Endpoint / File |
|-----------|-------------|-----------------|
| **Merchant API** (Rust/Axum) | Serves proving key, relays encrypted proofs to contract | `http://<host>:3000` |
| **Stellar Contract** (Soroban) | Stores VK, verifies Groth16 pairings, tracks nullifiers | `CBNGFNHWZZOBDKG3GDZLPXRWMD3RXFIOLWKZQZUHNRMEBJRQP2ZSIJ5A` |
| **Privacy Circuits** (Rust) | Builds ZK circuit, generates CRS, `customer_generate_proof()` | `privacy-circuits/` |
| **Stellar CLI** (`soroban` / `stellar` 27.0.0) | Submits transactions to testnet | requires `alice` identity funded with testnet XLM |

## API Endpoints

### `GET /api/merchant/:seed_hex/qr-info`

Called when the **wallet scans the merchant's QR code**. Returns everything needed to start a payment.

**Response:**
```json
{
  "api_url": "http://localhost:3000",
  "merchant_id": "1007e700db742e61042a291b301f66922208c2808ca942d18d1970e8da45d0ab",
  "contract_id": "CBNGFNHWZZOBDKG3GDZLPXRWMD3RXFIOLWKZQZUHNRMEBJRQP2ZSIJ5A",
  "pk_url": "http://localhost:3000/api/merchant/<seed_hex>/pk",
  "seed_hex": "aed045aaa451bf588594d5f9597ba49aa96fa3b43efa1a2dde0e097f59d234a1"
}
```

### `GET /api/merchant/:seed_hex/pk`

Returns the merchant's **compressed Groth16 ProvingKey** as hex. Used by the wallet to generate proofs.

**Response:**
```json
{
  "pk_hex": "e0031a0100...",
  "merchant_id": "1007e700db742e61042a291b301f66922208c2808ca942d18d1970e8da45d0ab"
}
```

### `POST /api/wallet/generate-proof` (DEMO PATH — REPLACE WITH WASM)

Generates a proof server-side. Only needed until the WASM prover is built.

**Request:**
```json
{
  "pk_hex": "e0031a0100...",
  "customer_secret": "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "amount": 100,
  "merchant_id": "1007e700db742e61042a291b301f66922208c2808ca942d18d1970e8da45d0ab"
}
```

**Response:**
```json
{
  "success": true,
  "a": "1e6b215d5104339df6207b1c2654dbb2d8ef87d74a6e119...",
  "b": "2d3c9e5bcd8aa047fbab0042191dbcfdd8ad0e391fb2dbe...",
  "c": "1835e5fdaa7cb7039a727a7d30626494a233a9050bae33cb...",
  "nullifier": "2994e16b53d4946cd11c43b5bec2ca54eadd18aa0cc916ae47c7e5010acd8a92",
  "commitment": "1f6b13ff569f8c62948643a52b57e2cef1ef6b2dfcc9859d02e840aec4bc62ef"
}
```

### `POST /api/payment/submit-to-contract`

Relays a customer-generated proof to the Stellar contract. Also stores an encrypted payment note for the merchant dashboard.

**Request:**
```json
{
  "seed": "aed045aaa451bf588594d5f9597ba49aa96fa3b43efa1a2dde0e097f59d234a1",
  "a": "1e6b215d5104339df6207b1c2654dbb2d8ef87d74a6e119e463eee4973b88345...",
  "b": "2d3c9e5bcd8aa047fbab0042191dbcfdd8ad0e391fb2dbebe9ec1c442d569320...",
  "c": "1835e5fdaa7cb7039a727a7d30626494a233a9050bae33cb61bafda91cb96fa0...",
  "nullifier": "2994e16b53d4946cd11c43b5bec2ca54eadd18aa0cc916ae47c7e5010acd8a92",
  "commitment": "1f6b13ff569f8c62948643a52b57e2cef1ef6b2dfcc9859d02e840aec4bc62ef",
  "amount": 100,
  "customer_id": "cust-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "tx_hash": "🔗 https://stellar.expert/explorer/testnet/tx/76edc0c8073c593e3df4e3b5056d9666c38f7d471616f91d69f218d691b2fcdf",
  "error": null
}
```

## How Payment Works (Frontend Flow)

### Step 1: Scan QR Code
The wallet scans the merchant's QR which contains JSON:
```json
{
  "api_url": "http://192.168.1.100:3000",
  "merchant_id": "1007e700db742e61042a291b301f66922208c2808ca942d18d1970e8da45d0ab",
  "contract_id": "CBNGFNHWZZOBDKG3GDZLPXRWMD3RXFIOLWKZQZUHNRMEBJRQP2ZSIJ5A",
  "seed_hex": "aed045aaa451bf588594d5f9597ba49aa96fa3b43efa1a2dde0e097f59d234a1",
  "merchant_name": "Cafe Mocha"
}
```
QR may also be encoded as an `aframp://pay?data=<base64>` deep link.

### Step 2: Fetch Proving Key
```
GET {api_url}/api/merchant/{seed_hex}/pk
```
Returns the merchant's compressed proving key (hex-encoded). Without this key, you cannot generate a valid proof.

### Step 3: Enter Amount & Generate Proof

**Production path (WASM — on-device):**
The wallet app loads `wallet-wasm/pkg/wallet_wasm.js` via dynamic import and calls:
```js
import init, { generate_proof } from '../../wallet-wasm/pkg/wallet_wasm.js';
await init();
const result = generate_proof(pk_hex, customer_secret, BigInt(amount_cents), merchant_id_hex);
// → { a, b, c, nullifier, commitment }  (all hex strings)
```
The WASM binary is ~237 KB (includes BN254 curve ops + Groth16 prover).  
Falls back to the demo path if WASM fails to load.

**Demo path (server-side fallback):**
```
POST {api_url}/api/wallet/generate-proof
{ "pk_hex": "...", "customer_secret": "...", "amount": 100, "merchant_id": "..." }
→ { a, b, c, nullifier, commitment }
```

The `customer_secret` is **random 32 bytes chosen by the wallet**. Never share it. It proves this customer made this payment.

### Step 4: Submit to Contract

```
POST {api_url}/api/payment/submit-to-contract
{ "seed": merchant.seed_hex, "a": a_hex, "b": b_hex, "c": c_hex,
  "nullifier": nullifier_hex, "commitment": commitment_hex,
  "amount": 100, "customer_id": "cust-abc123" }
→ { "tx_hash": "https://stellar.expert/.../tx/<hash>" }
```

The merchant API:
1. Encrypts `{ amount, customer_id, timestamp }` with the merchant's viewing key
2. Saves encrypted note to `.{seed}/payment_notes/{nullifier}.enc`
3. Calls the Stellar contract's `process_payment(proof, merchant_id, nullifier, commitment)` via Soroban CLI

### Step 5: Contract Verification
The Stellar contract:
1. Deserializes the proof (3 BN254 curve points — `a: G1`, `b: G2`, `c: G1`)
2. Reconstructs public signals: `[1, merchant_id, nullifier, commitment]`
3. Performs **Groth16 pairing check** on BN254
4. If valid: stores `nullifier` as used, emits on-chain event, returns `true`
5. If invalid: returns `Error(Contract, #1)` = `VerificationFailed`
6. If already used: returns `Error(Contract, #3)` = `NullifierAlreadyUsed`

## The ZK Circuit (What the Proof Proves)

The `PaymentCircuit` has:
- **Private witnesses:** `customer_secret`, `amount`
- **Public inputs:** `merchant_id`, `nullifier`, `commitment`
- **Constraints:**
  ```
  nullifier = customer_secret + amount
  commitment = customer_secret × amount × merchant_id
  amount ≠ 0
  ```

The proof tells the contract: *"Someone who knows a secret matching this commitment paid this amount to this merchant"* — without revealing the secret or the amount.

## What the Wallet UI Should Look Like

### Screen 1: Scanner
```
┌─────────────────────────┐
│                         │
│    ┌───────────────┐    │
│    │               │    │
│    │  Camera View  │    │
│    │               │    │
│    └───────────────┘    │
│                         │
│  Point at merchant QR   │
│                         │
└─────────────────────────┘
```
- Full-screen camera viewfinder
- Flashlight toggle (top-right)
- Manual entry button: "Enter merchant code" (text field for paste)
- Handles both JSON QR codes and `aframp://pay?data=...` deep links
- On scan → navigate to PaymentScreen

### Screen 2: Payment
```
┌─────────────────────────┐
│ ← Back          CAFE    │
│                   ★     │
│                         │
│   Merchant: Cafe Mocha  │
│   Contract: CBNGF...    │
│                         │
│   ┌─────────────────┐   │
│   │ $    0.00       │   │
│   └─────────────────┘   │
│                         │
│   [1] [2] [3]           │
│   [4] [5] [6]           │
│   [7] [8] [9]           │
│   [.] [0] [⌫]          │
│                         │
│   ┌─────────────────┐   │
│   │   Pay $42.00    │   │
│   └─────────────────┘   │
│                         │
│   🔒 Zero-knowledge     │
│   Amount hidden on-chain│
└─────────────────────────┘
```
- Merchant name + merchant_id (truncated)
- Contract ID (truncated, gray)
- `payment_type` chip: "Private" / "Public" toggle (future: private-only for now)
- Numeric keypad for amount entry
- Big CTA: "Pay $X.XX" — disabled while amount = 0
- On tap → show loading overlay: "Generating proof…" → "Submitting…"
- Privacy badge: "🔒 ZK-Proof — amount hidden from chain"
- On success → navigate to ConfirmScreen

### Screen 3: Confirmation
```
┌─────────────────────────┐
│                         │
│          ✅             │
│    Payment Complete!    │
│                         │
│    $42.00               │
│    to Cafe Mocha        │
│                         │
│    TX: 76edc0...fcdf    │
│    (tap to copy)        │
│                         │
│    View on Explorer →   │
│                         │
│    ┌─────────────────┐  │
│    │  New Payment    │  │
│    └─────────────────┘  │
│                         │
│   🔒 Privacy: ensured   │
└─────────────────────────┘
```
- Large green checkmark animation
- Amount + merchant name
- Transaction hash (truncated, tappable to copy)
- "View on Explorer" link → opens `https://stellar.expert/explorer/testnet/tx/<hash>`
- "New Payment" button → back to scanner
- Privacy badge: "🔒 Privacy: ensured — your amount and identity are hidden"
- Optionally show merchant_id and contract_id in fine print

### Screen 4: History (future)
Currently not implemented — add a list of past payments with:
- Date, amount, merchant name
- Transaction status (confirmed/pending)
- Tap → transaction details (tx hash, explorer link)

## Deployment

### Merchant Dashboard
```
cd merchant-dashboard
npm run build
npm run preview   # serves on :4173
```

### Merchant API
```
CONTRACT_ID=CBNGFNHWZZOBDKG3GDZLPXRWMD3RXFIOLWKZQZUHNRMEBJRQP2ZSIJ5A \
  cargo run --bin merchant-api
```

### Wallet App
```
cd wallet-app
npm install
npx expo start
```

## Testing on Testnet

- Get testnet XLM: https://stellar.org/laboratory/#account-creator?network=testnet
- Fund `alice` identity: `stellar keys fund alice --network testnet`
- Build contract: `cargo build --target wasm32v1-none --release -p privacy-contract`
- Deploy: `stellar contract upload --wasm target/wasm32v1-none/release/privacy_contract.wasm --source alice --network testnet`
- Init contract: `privacy-cli init-contract <CONTRACT_ID>`
- Generate proof: `privacy-cli proof 50 <customer_hex_32_bytes>` → saves to `/tmp/proof.json`
- Submit: `privacy-cli pay <CONTRACT_ID> /tmp/proof.json`

## Wallet App Architecture (Planned)

```
wallet-app/
├── App.tsx                  # Root navigator (scan → payment → confirm)
├── src/
│   ├── screens/
│   │   ├── ScanScreen.tsx   # Camera QR scanner
│   │   ├── PaymentScreen.tsx# Amount entry, proof generation, submission
│   │   └── ConfirmScreen.tsx# Success view with tx hash
│   ├── services/
│   │   └── payment.ts       # HTTP calls + WASM prover integration
│   ├── components/          # (future)
│   └── types/
│       └── index.ts         # MerchantInfo, GenerateProofResponse, etc.
├── wallet-wasm/             # Rust → WASM prover package
│   ├── src/lib.rs           # generate_proof() exposed via wasm-bindgen
│   ├── Cargo.toml
│   └── pkg/                 # wasm-pack output (auto-generated)
│       ├── wallet_wasm.js
│       ├── wallet_wasm_bg.wasm   # ~237 KB Groth16 prover
│       └── wallet_wasm.d.ts
├── package.json
├── app.json
└── tsconfig.json
```

## Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | QR scanning, amount entry, proof generation (demo path) | ✅ Done (server-side) |
| P1 | On-device WASM prover (replace `/api/wallet/generate-proof`) | ✅ Done (`wallet-wasm/`) |
| P2 | Submit proof to contract + encrypt note direct (requires Stellar account in wallet) | ❌ Won't do — relay stores encrypted note for dashboard |
| P3 | Payment history screen | 📋 Planned |
| P4 | Public key pinning / merchant verification | 📋 Planned |
