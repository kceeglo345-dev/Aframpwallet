import { useEffect } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import type { MerchantInfo } from '../types';
import { savePayment } from '../services/storage';

interface Props {
  txHash: string;
  amount: number;
  nullifier: string;
  merchant: MerchantInfo;
  onNewPayment: () => void;
}

function explorerUrl(txHash: string): string {
  const hash = txHash.includes('/tx/') ? txHash.split('/tx/')[1]?.split(' ')[0] || txHash : txHash;
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export default function ConfirmScreen({ txHash, amount, nullifier, merchant, onNewPayment }: Props) {
  useEffect(() => {
    savePayment({
      id: `${nullifier}`,
      merchant_name: merchant.merchant_name || 'Merchant',
      merchant_id: merchant.merchant_id,
      contract_id: merchant.contract_id,
      amount_cents: amount,
      tx_hash: txHash,
      nullifier,
      timestamp: Date.now(),
      status: 'confirmed',
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>

      <Text style={styles.title}>Payment Sent</Text>
      <Text style={styles.amount}>${(amount / 100).toFixed(2)}</Text>
      <Text style={styles.merchant}>to {merchant.merchant_name || 'Merchant'}</Text>

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>Confirmed</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Privacy</Text>
          <Text style={styles.value}>ZK-Protected</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TX Hash</Text>
          <Text style={[styles.value, styles.mono]} numberOfLines={1}>
            {txHash.slice(0, 20)}...
          </Text>
        </View>
      </View>

      <Text style={styles.explorerLink} onPress={() => Linking.openURL(explorerUrl(txHash))}>
        View on Explorer →
      </Text>

      <Text style={styles.note}>
        This transaction is encrypted. Only the merchant can view the amount with their viewing key.
      </Text>

      <Text style={styles.button} onPress={onNewPayment}>
        New Payment
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FBBF24',
    marginBottom: 4,
  },
  merchant: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 32,
  },
  details: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    color: '#64748B',
    fontSize: 14,
  },
  value: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  explorerLink: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  note: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  button: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    backgroundColor: '#FBBF24',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
