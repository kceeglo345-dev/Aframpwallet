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

  const aframpUrl = `aframp://pay?api_url=${encodeURIComponent(API_URL)}&merchant_id=${encodeURIComponent(merchantId)}&contract_id=${encodeURIComponent(contractId)}&name=Aframp+Demo+Merchant&seed_hex=${encodeURIComponent(seedHex)}`;

  const settings = [
    {
      title: 'Private payments enabled',
      desc: 'ZK proofs required for all transactions',
      enabled: true,
    },
    {
      title: 'Compliance reporting',
      desc: 'Automatic audit trail generation',
      enabled: true,
    },
    {
      title: 'Auto-generate viewing keys',
      desc: 'Create a new viewing key for each payment',
      enabled: false,
    },
    {
      title: 'Email notifications',
      desc: 'Get notified when payments arrive',
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your merchant configuration and customer QR code</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: settings */}
        <div className="space-y-6">
          {/* Merchant details */}
          <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">Merchant Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
                <p className="text-xs text-gray-500">Merchant ID</p>
                <p className="text-sm font-mono text-gray-300 mt-1 break-all">{merchantId.slice(0, 24)}...</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
                <p className="text-xs text-gray-500">Network</p>
                <p className="text-sm text-gray-300 mt-1">{merchantInfo?.network || 'Stellar Testnet'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm text-gray-300 mt-1">{merchantInfo?.balance || '$1,234.56'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm text-[#2ed42b] mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ed42b]" />
                  Active
                </p>
              </div>
            </div>
          </div>

          {/* Privacy settings */}
          <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">Privacy Settings</h2>
            <div className="space-y-3">
              {settings.map((setting) => (
                <div key={setting.title} className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d14] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{setting.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
                  </div>
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-[#2ed42b]' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Export Data</h2>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d14] border border-white/8 text-sm text-gray-300 hover:border-white/15 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Export Transactions
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d14] border border-white/8 text-sm text-gray-300 hover:border-white/15 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                Export Viewing Key
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* Right column: QR code */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-2">Customer QR Code</h2>
          <p className="text-sm text-gray-500 mb-5">
            Display this QR code on your POS terminal. Customers scan it with the Aframp Wallet app to initiate a private payment.
          </p>

          <div className="bg-[#0d0d14] rounded-2xl p-6 flex flex-col items-center border border-white/5">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG value={aframpUrl} size={200} level="M" />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-white">Aframp Demo Merchant</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{merchantId.slice(0, 16)}...</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="text-xs bg-[#2ed42b] text-black px-3 py-1.5 rounded-lg hover:bg-[#22b020] transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(aframpUrl)}
              >
                Copy URL
              </button>
              <button
                className="text-xs bg-[#0d0d14] border border-white/8 text-gray-300 px-3 py-1.5 rounded-lg hover:border-white/15 transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(JSON.stringify({ api_url: API_URL, merchant_id: merchantId, contract_id: contractId }, null, 2))}
              >
                Copy JSON
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#2ed42b]/8 border border-[#2ed42b]/15">
            <p className="text-xs text-[#2ed42b]">
              <strong>How it works:</strong> Customer opens Aframp Wallet, scans this QR, enters amount, and pays. The payment is ZK-encrypted — only your viewing key can decrypt it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
