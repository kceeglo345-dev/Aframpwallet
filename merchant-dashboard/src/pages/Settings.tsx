import { useQuery } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export default function Settings() {
  const { data: merchantInfo } = useQuery({
    queryKey: ['merchant-info'],
    queryFn: () => MerchantAPI.getMerchantInfo('demo_001'),
  });

  const merchantId = merchantInfo?.merchant_id || 'demo_001';
  const contractId = import.meta.env.VITE_CONTRACT_ID || 'CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y';
  const seedHex = import.meta.env.VITE_MERCHANT_SEED || '';

  const qrData = JSON.stringify({
    api_url: API_URL,
    merchant_id: merchantId,
    contract_id: contractId,
    merchant_name: 'Aframp Demo Merchant',
    seed_hex: seedHex,
  });

  const aframpUrl = `aframp://pay?api_url=${encodeURIComponent(API_URL)}&merchant_id=${encodeURIComponent(merchantId)}&contract_id=${encodeURIComponent(contractId)}&name=Aframp+Demo+Merchant&seed_hex=${encodeURIComponent(seedHex)}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Merchant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Merchant ID</p>
                  <p className="font-medium text-gray-900 font-mono text-xs break-all">{merchantId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Network</p>
                  <p className="font-medium text-gray-900">{merchantInfo?.network || 'Stellar Testnet'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Balance</p>
                  <p className="font-medium text-gray-900">{merchantInfo?.balance || '$1,234.56'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Active ✓</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Private payments enabled</p>
                    <p className="text-sm text-gray-500">ZK proofs required for all transactions</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">ON</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Compliance reporting</p>
                    <p className="text-sm text-gray-500">Automatic audit trail generation</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">ACTIVE</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Export Data</h3>
              <div className="flex flex-wrap gap-3">
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition cursor-pointer">
                  Export Transactions
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition cursor-pointer">
                  Export Viewing Key
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition cursor-pointer">
                  Clear History
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer QR Code</h2>
          <p className="text-sm text-gray-500 mb-4">
            Display this QR code on your POS terminal. Customers scan it with the Aframp Wallet app to initiate a private payment.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <QRCodeSVG value={aframpUrl} size={200} level="M" />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">Aframp Demo Merchant</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{merchantId.slice(0, 16)}...</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition cursor-pointer"
                onClick={() => navigator.clipboard.writeText(aframpUrl)}
              >
                Copy URL
              </button>
              <button
                className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition cursor-pointer"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(JSON.parse(qrData), null, 2))}
              >
                Copy JSON
              </button>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>How it works:</strong> Customer opens Aframp Wallet, scans this QR, enters amount, and pays. The payment is ZK-encrypted — only your viewing key can decrypt it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
