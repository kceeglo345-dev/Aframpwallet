import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface MerchantResult {
  seed: string;
  merchant_id: string;
}

const steps = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Create' },
  { num: 3, label: 'Save Key' },
  { num: 4, label: 'Contract' },
  { num: 5, label: 'Integrate' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [merchant, setMerchant] = useState<MerchantResult | null>(null);
  const [seedCopied, setSeedCopied] = useState(false);
  const [contractStatus, setContractStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [contractMsg, setContractMsg] = useState('');

  const createMerchant = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/merchant/create');
      setMerchant(res.data);
      setStep(3);
    } catch {
      alert('Failed to create merchant. Is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  const initContract = async () => {
    if (!merchant) return;
    setLoading(true);
    setContractStatus('idle');
    try {
      const res = await axios.post('/api/merchant/init-contract', { seed: merchant.seed });
      if (res.data.success) {
        setContractStatus('success');
        setContractMsg(res.data.tx_hash || 'Contract initialized.');
      } else {
        setContractStatus('error');
        setContractMsg(res.data.error || 'Unknown error');
      }
    } catch {
      setContractStatus('error');
      setContractMsg('CONTRACT_ID not configured on the server.');
    } finally {
      setLoading(false);
    }
  };

  const copySeed = () => {
    if (!merchant) return;
    navigator.clipboard.writeText(merchant.seed);
    setSeedCopied(true);
    setTimeout(() => setSeedCopied(false), 2000);
  };

  const progress = `${(step / steps.length) * 100}%`;

  return (
    <div>
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50 via-white to-gold-50" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className={`text-xs font-medium ${step >= s.num ? 'text-navy-700' : 'text-gray-400'}`}
                >
                  {s.label}
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-navy-600 to-gold-500 rounded-full transition-all duration-500"
                style={{ width: progress }}
              />
            </div>
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
                Accept private payments on Stellar
              </h1>
              <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
                In under 2 minutes, you'll have a merchant identity, a deployed privacy contract, and everything you need to start accepting confidential payments.
              </p>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { title: 'Create Identity', desc: 'Generate your merchant seed and proving keys' },
                  { title: 'Deploy Contract', desc: 'Initialize the verifier on Stellar testnet' },
                  { title: 'Accept Payments', desc: 'Start collecting private payments instantly' },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-white border border-gray-100 text-left">
                    <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-10 inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20 cursor-pointer"
              >
                Start Setup
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Create Merchant */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">Create your merchant identity</h2>
              <p className="mt-3 text-gray-600">
                We'll generate a cryptographically secure seed that derives your merchant ID, proving key, and verification key.
              </p>
              <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-100 text-left max-w-md mx-auto">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-gray-600">Your secret never leaves your browser</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-gray-600">Merchant ID = secret × 2 (deterministic)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-gray-600">Same seed always produces same merchant ID</span>
                  </div>
                </div>
              </div>
              <button
                onClick={createMerchant}
                disabled={loading}
                className="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors shadow-lg shadow-navy-900/20 cursor-pointer"
              >
                {loading ? (
                  <>Generating...</>
                ) : (
                  <>
                    Generate Merchant Key
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Save Secret Key */}
          {step === 3 && merchant && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">Save your secret seed</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                This is the <strong className="text-amber-600">only time</strong> you'll see your merchant seed. If you lose it, you lose access to your merchant identity forever.
              </p>
              <div className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-200 max-w-lg mx-auto">
                <p className="text-xs text-amber-800 font-medium mb-2 uppercase tracking-wide">Your Merchant ID</p>
                <p className="text-sm font-mono bg-white rounded-lg p-3 border border-amber-200 break-all text-navy-900">
                  {merchant.merchant_id}
                </p>
                <p className="text-xs text-amber-800 font-medium mb-2 mt-4 uppercase tracking-wide">Secret Seed (SAVE THIS)</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono bg-white rounded-lg p-3 border border-amber-200 break-all flex-1 text-navy-900">
                    {merchant.seed}
                  </p>
                  <button
                    onClick={copySeed}
                    className="px-3 py-3 rounded-lg bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {seedCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setStep(4)}
                className="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20 cursor-pointer"
              >
                I've Saved My Secret — Next
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 4: Contract */}
          {step === 4 && merchant && (
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">Initialize the privacy contract</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                Deploy your verification key to the Stellar testnet contract. This enables on-chain proof verification.
              </p>
              <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-100 max-w-md mx-auto text-left">
                <p className="text-sm text-gray-500 mb-3">Contract ID:</p>
                <p className="text-xs font-mono bg-white rounded-lg p-3 border border-gray-200 break-all text-navy-900">
                  CA23SNSLINP3SFVUUCRWNHDNKWYQ23UFURUOTZDZMNSOKM2O63V2MP2Y
                </p>
              </div>
              {contractStatus !== 'idle' && (
                <div className={`mt-4 p-4 rounded-xl max-w-md mx-auto text-sm ${contractStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {contractMsg}
                </div>
              )}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {contractStatus !== 'success' && (
                  <button
                    onClick={initContract}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors shadow-lg shadow-navy-900/20 cursor-pointer"
                  >
                    {loading ? 'Initializing...' : 'Initialize Contract'}
                  </button>
                )}
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Skip — I'll do this later
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">You're all set!</h2>
              <p className="mt-3 text-gray-600 max-w-md mx-auto">
                Your merchant identity is ready. Here's what you can do next:
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                <Link
                  to="/dashboard"
                  className="p-4 rounded-xl bg-white border border-gray-100 hover:border-navy-200 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-navy-900">📊 View Dashboard</p>
                  <p className="text-xs text-gray-500 mt-1">Analytics, transactions, and reports</p>
                </Link>
                <Link
                  to="/settings"
                  className="p-4 rounded-xl bg-white border border-gray-100 hover:border-navy-200 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-navy-900">⚙️ Merchant Settings</p>
                  <p className="text-xs text-gray-500 mt-1">View your merchant ID and keys</p>
                </Link>
                <Link
                  to="/developers"
                  className="p-4 rounded-xl bg-white border border-gray-100 hover:border-navy-200 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-navy-900">📖 Developer Docs</p>
                  <p className="text-xs text-gray-500 mt-1">API reference and integration guide</p>
                </Link>
                <a
                  href="https://github.com/kelly-musk/Aframpwallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white border border-gray-100 hover:border-navy-200 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-semibold text-navy-900">🐙 View on GitHub</p>
                  <p className="text-xs text-gray-500 mt-1">Open source codebase</p>
                </a>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 inline-flex items-center px-8 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
              >
                Go to Dashboard
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
