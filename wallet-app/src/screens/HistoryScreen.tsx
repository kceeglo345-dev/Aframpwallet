import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import type { PaymentRecord } from '../types';
import { loadAllPayments, clearHistory } from '../services/storage';

interface Props {
  onBack: () => void;
  refreshKey: number;
}

function explorerUrl(txHash: string): string {
  const hash = txHash.includes('/tx/') ? txHash.split('/tx/')[1]?.split(' ')[0] || txHash : txHash;
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export default function HistoryScreen({ onBack, refreshKey }: Props) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    loadAllPayments().then(setPayments);
  }, [refreshKey]);

  const handleClear = () => {
    Alert.alert('Clear History', 'Remove all payment records?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearHistory().then(() => setPayments([])) },
    ]);
  };

  const renderItem = ({ item }: { item: PaymentRecord }) => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const hash = item.tx_hash.includes('/tx/')
      ? item.tx_hash.split('/tx/')[1]?.slice(0, 12) || item.tx_hash
      : item.tx_hash.slice(0, 12);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(explorerUrl(item.tx_hash))}
      >
        <View style={styles.rowLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.merchant_name[0] || '?'}</Text>
          </View>
          <View>
            <Text style={styles.merchantName}>{item.merchant_name}</Text>
            <Text style={styles.meta}>{dateStr} · {timeStr}</Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.amount}>${(item.amount_cents / 100).toFixed(2)}</Text>
          <Text style={styles.hash}>{hash}…</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backLink} onPress={onBack}>← Back</Text>
        <Text style={styles.title}>History</Text>
        {payments.length > 0 && (
          <Text style={styles.clearLink} onPress={handleClear}>Clear</Text>
        )}
      </View>

      {payments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No payments yet</Text>
          <Text style={styles.emptySub}>Payments you make will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backLink: {
    color: '#94A3B8',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  clearLink: {
    color: '#EF4444',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FBBF24',
    fontSize: 18,
    fontWeight: '700',
  },
  merchantName: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#FBBF24',
    fontSize: 18,
    fontWeight: '700',
  },
  hash: {
    color: '#475569',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 14,
  },
});
