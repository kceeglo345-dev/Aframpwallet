import { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ScanScreen from './src/screens/ScanScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ConfirmScreen from './src/screens/ConfirmScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import type { MerchantInfo } from './src/types';

type Screen = 'scan' | 'payment' | 'confirm' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('scan');
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState(0);
  const [nullifier, setNullifier] = useState('');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleMerchantScanned = (info: MerchantInfo) => {
    setMerchant(info);
    setScreen('payment');
  };

  const handlePaymentComplete = (hash: string, amt: number, nul: string) => {
    setTxHash(hash);
    setAmount(amt);
    setNullifier(nul);
    setScreen('confirm');
  };

  const handleNewPayment = () => {
    setMerchant(null);
    setTxHash('');
    setAmount(0);
    setNullifier('');
    setHistoryRefresh(n => n + 1);
    setScreen('scan');
  };

  const handleShowHistory = () => {
    setHistoryRefresh(n => n + 1);
    setScreen('history');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={styles.container}>
        {screen === 'scan' && (
          <ScanScreen
            onMerchantScanned={handleMerchantScanned}
            onShowHistory={handleShowHistory}
          />
        )}
        {screen === 'payment' && merchant && (
          <PaymentScreen
            merchant={merchant}
            onBack={handleNewPayment}
            onComplete={handlePaymentComplete}
          />
        )}
        {screen === 'confirm' && merchant && (
          <ConfirmScreen
            txHash={txHash}
            amount={amount}
            nullifier={nullifier}
            merchant={merchant}
            onNewPayment={handleNewPayment}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen onBack={handleNewPayment} refreshKey={historyRefresh} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
