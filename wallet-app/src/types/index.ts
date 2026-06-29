export interface MerchantInfo {
  api_url: string;
  merchant_id: string;
  contract_id: string;
  pk_url?: string;
  seed_hex?: string;
  merchant_name?: string;
}

export interface PaymentRecord {
  id: string;
  merchant_name: string;
  merchant_id: string;
  contract_id: string;
  amount_cents: number;
  tx_hash: string;
  nullifier: string;
  timestamp: number;
  status: 'confirmed';
}

export interface WalletGenerateProofRequest {
  pk_hex: string;
  customer_secret: string;
  amount: number;
  merchant_id: string;
}

export interface WalletGenerateProofResponse {
  success: boolean;
  a?: string;
  b?: string;
  c?: string;
  nullifier?: string;
  commitment?: string;
  error?: string;
}

export interface SubmitToContractRequest {
  seed: string;
  a: string;
  b: string;
  c: string;
  nullifier: string;
  commitment: string;
  amount: number;
  customer_id: string;
}

export interface SubmitToContractResponse {
  success: boolean;
  tx_hash?: string;
  error?: string;
}

export interface PkResponse {
  pk_hex: string;
  merchant_id: string;
}
