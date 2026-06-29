import init, { generate_proof } from '../lib/wallet-wasm/wallet_wasm.js'
import type { ProofResult } from '../types'

let wasmReady = false

export async function initWasm(): Promise<void> {
  if (wasmReady) return
  await init()
  wasmReady = true
}

export function isWasmReady(): boolean {
  return wasmReady
}

export function generateProofClientSide(
  pkHex: string,
  customerSecretHex: string,
  amount: bigint,
  merchantIdHex: string,
): ProofResult {
  if (!wasmReady) {
    throw new Error('WASM not initialized. Call initWasm() first.')
  }
  const result: any = generate_proof(pkHex, customerSecretHex, amount, merchantIdHex)
  return {
    a: result.a,
    b: result.b,
    c: result.c,
    nullifier: result.nullifier,
    commitment: result.commitment,
  }
}
