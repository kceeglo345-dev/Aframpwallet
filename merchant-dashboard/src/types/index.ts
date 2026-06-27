export interface PaymentRecord {
  tx_hash: string;
  amount: number;
  amount_usd: string;
  customer_id: string;
  timestamp: number;
  datetime: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface DailyVolume {
  date: string;
  volume: number;
  count: number;
}

export interface DashboardStats {
  total_volume: number;
  total_volume_usd: string;
  transaction_count: number;
  average_transaction: string;
  balance: string;
  daily_volume: DailyVolume[];
  recent_payments: PaymentRecord[];
}

export interface ComplianceReport {
  merchant_id: string;
  period_start: string;
  period_end: string;
  total_transactions: number;
  total_volume_usd: string;
  average_transaction_usd: string;
  payments: PaymentRecord[];
  generated_at: string;
}

export interface MerchantInfo {
  merchant_id: string;
  status: 'active' | 'inactive';
  private_payments_enabled: boolean;
  supported_assets: string[];
  fee: string;
  network: string;
  balance: string;
}
