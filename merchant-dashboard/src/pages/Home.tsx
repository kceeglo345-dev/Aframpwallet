import { Link } from 'react-router-dom';

const benefits = [
  {
    title: 'Complete Privacy',
    desc: 'Payment amounts, customer identities, and merchant relationships are cryptographically hidden. Only the merchant can verify transactions using their secret key.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Fraud-Proof',
    desc: 'Zero-knowledge proofs ensure payment validity without revealing sensitive data. Double-spending is prevented via on-chain nullifiers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Regulatory Ready',
    desc: 'Selective disclosure via viewing keys lets you share transaction details with auditors and regulators when needed — without compromising overall privacy.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: 'Instant Settlement',
    desc: 'Built on Stellar — transactions settle in 3-5 seconds with near-zero fees. No slow block confirmations, no expensive gas.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'No Trust Assumptions',
    desc: 'Merchant runs their own proving system. No third-party relayers or oracles. The merchant\'s secret never leaves their control.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Open Source',
    desc: 'Fully auditable codebase. Built with arkworks Groth16 on BN254 — the same proving system used by major privacy protocols.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: '01',
    title: 'Generate Merchant Key',
    desc: 'Create your merchant identity. A cryptographically secure seed generates your proving key, verification key, and merchant ID.',
  },
  {
    step: '02',
    title: 'Deploy Privacy Contract',
    desc: 'Deploy the Groth16 verifier contract to Stellar testnet. Your verification key is stored on-chain, enabling public verification of private payments.',
  },
  {
    step: '03',
    title: 'Customer Pays Privately',
    desc: 'Customer\'s POS client generates a zero-knowledge proof containing the payment amount, merchant ID, and a unique nullifier — all without revealing any of them.',
  },
  {
    step: '04',
    title: 'Verify & Settle',
    desc: 'Submit the proof to the Stellar contract. The contract verifies the proof cryptographically, checks for double-spending, and settles the payment — all while keeping details private.',
  },
];

const useCases = [
  {
    title: 'High-Value B2B Payments',
    desc: 'Enterprise transactions where revealing counterparty revenue or payment terms would harm competitive position.',
  },
  {
    title: 'Healthcare & Legal',
    desc: 'Payments for sensitive services where patient-client confidentiality extends to financial transactions.',
  },
  {
    title: 'Luxury & Discreet Retail',
    desc: 'High-net-worth individuals making purchases where payment amounts must remain confidential.',
  },
  {
    title: 'Cross-Border Trade',
    desc: 'International merchants who need private settlement without exposing trade volumes to competitors.',
  },
];

export default function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50 via-white to-gold-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-navy-100/40 to-gold-100/30 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-navy-100 text-navy-800 text-xs font-medium mb-6">
              Now live on Stellar Testnet
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-950 leading-tight tracking-tight">
              Private Payments on{' '}
              <span className="bg-gradient-to-r from-navy-600 to-gold-500 bg-clip-text text-transparent">
                Stellar
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A zero-knowledge privacy layer for merchants. Hide payment amounts, customer identities, and business relationships — while maintaining full verifiability and regulatory compliance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/onboard"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="https://github.com/kelly-musk/Aframpwallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
                Blockchain transparency is a feature — until it's your transaction
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed">
                Every payment on Stellar — amount, sender, receiver — is visible to the entire network. For merchants, this means competitors can track your revenue, customers expose their spending habits, and sensitive business relationships are public record.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Aframp wraps Stellar payments in zero-knowledge proofs. The blockchain sees only a validity proof and a unique nullifier. The amount, customer identity, and merchant ID remain cryptographically hidden — verifiable only by the merchant.
              </p>
              <div className="mt-8 flex items-center space-x-4 text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-navy-100 border-2 border-white flex items-center justify-center text-xs font-medium text-navy-700">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-gray-500">Trusted by early adopters on Stellar testnet</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Without Aframp</p>
                      <p className="text-sm text-gray-500 mt-1">Amount, sender, receiver visible to everyone. Competitors see your volume. Customers have no privacy.</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">With Aframp</p>
                        <p className="text-sm text-gray-500 mt-1">On-chain proof only. Amounts, customer IDs, and business relationships stay private. Merchant controls all data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950">How It Works</h2>
            <p className="mt-4 text-gray-600">Four steps from setup to settlement. No trusted setup ceremonies, no complex infrastructure.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-bold text-navy-200 mb-4">{s.step}</div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950">Why Aframp</h2>
            <p className="mt-4 text-gray-600">Privacy without compromises. Built for merchants who need confidentiality and compliance.</p>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-navy-200 hover:shadow-lg hover:shadow-navy-50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-700 flex items-center justify-center mb-4 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                  {b.icon}
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-24 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Built for Real Merchants</h2>
            <p className="mt-4 text-gray-400">Use cases where payment privacy is not a luxury — it's a requirement.</p>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="p-6 rounded-xl bg-navy-900/50 border border-navy-800 hover:border-navy-700 transition-colors">
                <h3 className="text-base font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
              Ready for private Stellar payments?
            </h2>
            <p className="mt-4 text-gray-600">
              Deploy your own privacy layer on Stellar testnet in minutes. Full control, no intermediaries, complete privacy.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/onboard"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/developers"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
