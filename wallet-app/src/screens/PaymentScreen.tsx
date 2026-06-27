import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { MerchantInfo } from '../types';
import { createPaymentService } from '../services/payment';

interface Props {
  merchant: MerchantInfo;
  onBack: () => void;
  onComplete: (txHash: string, amount: number, nullifier: string) => void;
}

export default function PaymentScreen({ merchant, onBack, onComplete }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = createPaymentService(
        merchant.api_url,
        merchant.merchant_id,
        merchant.seed_hex,
      );

      // Step 1: Fetch merchant's proving key
      setStep('Fetching merchant key...');
      const pkInfo = await service.fetchPk();

      // Step 2: Generate proof locally (via merchant's proving service for demo)
      setStep('Generating ZK proof...');
      const proofResult = await service.generateProof(pkInfo.pk_hex, amt);
      if (!proofResult.success) {
        throw new Error(proofResult.error || 'Proof generation failed');
      }

      // Step 3: Submit proof to contract
      setStep('Submitting to contract...');
      const submitResult = await service.submitToContract(
        { a: proofResult.a, b: proofResult.b, c: proofResult.c },
        proofResult.nullifier,
        proofResult.commitment,
        amt,
      );
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Contract submission failed');
      }

      onComplete(submitResult.tx_hash || 'confirmed', Math.round(amt * 100), proofResult.nullifier || '');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
      Alert.alert('Payment Failed', msg);
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Private Payment</Text>
      <Text style={styles.merchantName}>{merchant.merchant_name || 'Merchant'}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Amount (USD)</Text>
        <View style={styles.inputRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#475569"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
        </View>

        {amount ? (
          <View style={styles.privacyNote}>
            <Text style={styles.noteIcon}>🔒</Text>
            <Text style={styles.noteText}>
              ZK-encrypted. Only the merchant can decrypt with their viewing key.
            </Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {step ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#FBBF24" />
          <Text style={styles.loadingText}>{step}</Text>
        </View>
      ) : null}

      <View style={styles.buttons}>
        <Text style={styles.backButton} onPress={onBack}>
          Cancel
        </Text>
        <Text
          style={[styles.payButton, (!amount || loading) ? styles.payButtonDisabled : null]}
          onPress={handlePay}
        >
          {loading ? 'Processing...' : `Pay $${amount || '0.00'}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FBBF24',
    textAlign: 'center',
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarSign: {
    fontSize: 36,
    color: '#F1F5F9',
    fontWeight: '300',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 36,
    color: '#F1F5F9',
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 8,
  },
  noteIcon: {
    fontSize: 14,
  },
  noteText: {
    fontSize: 12,
    color: '#93C5FD',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 16,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
  },
  payButton: {
    flex: 2,
    textAlign: 'center',
    paddingVertical: 16,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  errorBox: {
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    color: '#FBBF24',
    fontSize: 14,
  },
});
