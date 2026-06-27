import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaymentRecord } from '../types';

const STORAGE_KEY = 'aframp_payment_history';

export async function savePayment(record: PaymentRecord): Promise<void> {
  const existing = await loadAllPayments();
  existing.unshift(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function loadAllPayments(): Promise<PaymentRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PaymentRecord[];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
