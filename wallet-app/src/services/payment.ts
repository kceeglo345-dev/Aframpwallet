import axios from 'axios';

export interface ProofResult {
  success: boolean;
  a: string;
  b: string;
  c: string;
  nullifier: string;
  commitment: string;
  error?: string;
}

export interface SubmitResult {
  success: boolean;
  tx_hash?: string;
  error?: string;
}

export interface PkInfo {
  pk_hex: string;
  merchant_id: string;
}

let wasmModule: any = null;
let wasmInit: Promise<void> | null = null;

function generateCustomerSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateCustomerId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function ensureWasm() {
  if (wasmModule) return;
  if (!wasmInit) {
    wasmInit = (async () => {
      try {
        const wasm = await import('wallet-wasm');
        await wasm.default();
        wasmModule = wasm;
      } catch {
        wasmModule = null;
      }
    })();
  }
  await wasmInit;
}

export function createPaymentService(apiUrl: string, merchantId: string, seedHex?: string) {
  const api = axios.create({ baseURL: apiUrl, timeout: 60000 });

  /** Initialize the WASM prover early */
  ensureWasm().catch(() => {});

  return {
    fetchPk: async (): Promise<PkInfo> => {
      if (!seedHex) throw new Error('seedHex required to fetch pk');
      const response = await api.get(`/api/merchant/${seedHex}/pk`);
      return response.data;
    },

    /** Generate proof locally via WASM, fall back to merchant API */
    generateProof: async (pkHex: string, amount: number): Promise<ProofResult> => {
      const customerSecret = generateCustomerSecret();
      const amountCents = Math.round(amount * 100);

      try {
        await ensureWasm();
        if (wasmModule) {
          const result = wasmModule.generate_proof(
            pkHex,
            customerSecret,
            BigInt(amountCents),
            merchantId,
          );
          return {
            success: true,
            a: result.a,
            b: result.b,
            c: result.c,
            nullifier: result.nullifier,
            commitment: result.commitment,
          };
        }
      } catch (e: any) {
        console.warn('WASM prover failed, falling back to server:', e.message);
      }

      // Fallback: generate via merchant API
      const response = await api.post('/api/wallet/generate-proof', {
        pk_hex: pkHex,
        customer_secret: customerSecret,
        amount: amountCents,
        merchant_id: merchantId,
      });
      return response.data;
    },

    /** Submit a customer-generated proof to the contract */
    submitToContract: async (
      proof: { a: string; b: string; c: string },
      nullifier: string,
      commitment: string,
      amount: number,
    ): Promise<SubmitResult> => {
      if (!seedHex) throw new Error('seedHex required to submit');
      const customerId = generateCustomerId();
      const response = await api.post('/api/payment/submit-to-contract', {
        seed: seedHex,
        a: proof.a,
        b: proof.b,
        c: proof.c,
        nullifier,
        commitment,
        amount: Math.round(amount * 100),
        customer_id: customerId,
      });
      return response.data;
    },
  };
}
