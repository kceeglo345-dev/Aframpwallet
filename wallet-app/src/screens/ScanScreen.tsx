import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { MerchantInfo } from '../types';

interface Props {
  onMerchantScanned: (info: MerchantInfo) => void;
  onShowHistory: () => void;
}

function parseMerchantQR(data: string): MerchantInfo | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.api_url && parsed.merchant_id && parsed.contract_id) {
      return {
        api_url: parsed.api_url.replace(/\/+$/, ''),
        merchant_id: parsed.merchant_id,
        contract_id: parsed.contract_id,
        merchant_name: parsed.merchant_name || 'Merchant',
        seed_hex: parsed.seed_hex,
      };
    }
  } catch {
    // Try URL format: aframp://pay?api_url=...&merchant_id=...&contract_id=...
    try {
      const url = new URL(data);
      const params = url.searchParams;
      if (url.protocol === 'aframp:' || url.pathname === '/pay') {
        const api_url = params.get('api_url');
        const merchant_id = params.get('merchant_id');
        const contract_id = params.get('contract_id');
        if (api_url && merchant_id && contract_id) {
          return {
            api_url: api_url.replace(/\/+$/, ''),
            merchant_id,
            contract_id,
            merchant_name: params.get('name') || 'Merchant',
            seed_hex: params.get('seed_hex') || undefined,
          };
        }
      }
    } catch {}
  }
  return null;
}

export default function ScanScreen({ onMerchantScanned, onShowHistory }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aframp Wallet</Text>
        <Text style={styles.subtitle}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aframp Wallet</Text>
        <Text style={styles.subtitle}>Camera permission required to scan merchant QR codes</Text>
        <Text style={styles.button} onPress={requestPermission}>Grant Permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Merchant QR</Text>
      <Text style={styles.subtitle}>Point your camera at the merchant's QR code</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanning ? (result) => {
            const info = parseMerchantQR(result.data);
            if (info) {
              setScanning(false);
              onMerchantScanned(info);
            }
          } : undefined}
        >
          <View style={styles.overlay}>
            <View style={styles.viewfinder} />
          </View>
        </CameraView>
      </View>

      <Text style={styles.hint}>
        The QR code is displayed on the merchant's POS terminal
      </Text>

      <Text style={styles.historyButton} onPress={onShowHistory}>
        Payment History →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  cameraContainer: {
    width: 300,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#FBBF24',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  hint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  button: {
    fontSize: 18,
    color: '#FBBF24',
    fontWeight: '600',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 8,
  },
  historyButton: {
    marginTop: 20,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    paddingVertical: 12,
  },
});
