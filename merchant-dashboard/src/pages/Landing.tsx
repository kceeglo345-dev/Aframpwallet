import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Now Live on Stellar Testnet</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              <span className="block">Private Payments</span>
              <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                On Stellar
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Zero-knowledge proofs meet merchant privacy. Hide payment amounts, customer identities, and business relationships while maintaining full verifiability and regulatory compliance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center"
              >
                Launch Console
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="https://github.com/kelly-musk/Aframpwallet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl border border-gray-700 text-white font-bold hover:border-emerald-500 hover:text-emerald-400 transition-all"
              >
                View on GitHub
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">3-5s</div>
                <p className="text-xs text-gray-500 mt-1">Settlement Time</p>
              </div>
              <div className="w-px h-12 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">~0</div>
                <p className="text-xs text-gray-500 mt-1">Transaction Fees</p>
              </div>
              <div className="w-px h-12 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">100%</div>
                <p className="text-xs text-gray-500 mt-1">Verifiable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Aframp</h2>
            <p className="text-gray-400 text-lg">Privacy without compromises</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔐',
                title: 'Complete Privacy',
                desc: 'Payment amounts, customer identities, and merchant relationships stay cryptographically hidden.',
              },
              {
                icon: '✓',
                title: 'Fraud-Proof',
                desc: 'Zero-knowledge proofs ensure validity without revealing sensitive data. Double-spending prevented via on-chain nullifiers.',
              },
              {
                icon: '⚖️',
                title: 'Regulatory Ready',
                desc: 'Selective disclosure via viewing keys lets you share details with regulators when needed.',
              },
              {
                icon: '⚡',
                title: 'Instant Settlement',
                desc: 'Built on Stellar — 3-5 second settlements with near-zero fees. No expensive gas.',
              },
              {
                icon: '🔑',
                title: 'No Trust Assumptions',
                desc: 'Merchant runs their own proving system. Your secret never leaves your control.',
              },
              {
                icon: '🔓',
                title: 'Open Source',
                desc: 'Fully auditable codebase. Built with arkworks Groth16 on BN254.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all group hover:bg-black/50">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Four steps from setup to settlement</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Generate Merchant Key',
                desc: 'Create your merchant identity with cryptographically secure keys.',
              },
              {
                step: '02',
                title: 'Deploy Contract',
                desc: 'Deploy the Groth16 verifier to Stellar testnet.',
              },
              {
                step: '03',
                title: 'Customer Pays',
                desc: 'Generate zero-knowledge proof of payment.',
              },
              {
                step: '04',
                title: 'Verify & Settle',
                desc: 'Contract verifies proof and settles payment privately.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -top-10 left-0 text-6xl font-bold text-emerald-500/20">{item.step}</div>
                <h3 className="text-lg font-bold mb-3 relative z-10">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute -right-3 top-1/4 w-6 h-6 border-r-2 border-t-2 border-gray-700 transform rotate-45" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for Real Merchants</h2>
            <p className="text-gray-400 text-lg">Where payment privacy is a requirement</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'B2B Payments',
                desc: 'Hide revenue and terms from competitors.',
              },
              {
                title: 'Healthcare & Legal',
                desc: 'Sensitive services require financial privacy.',
              },
              {
                title: 'Luxury Retail',
                desc: 'High-value purchases with confidentiality.',
              },
              {
                title: 'Cross-Border Trade',
                desc: 'Private settlement without exposing volumes.',
              },
            ].map((useCase, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-emerald-500/50 transition-all">
                <h3 className="font-bold mb-2 text-white">{useCase.title}</h3>
                <p className="text-gray-400 text-sm">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready for Private Payments?</h2>
          <p className="text-gray-400 text-lg mb-10">
            Deploy your own privacy layer on Stellar testnet in minutes. Full control, no intermediaries.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
          >
            Get Started Free
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-400">© 2024 Aframp. Privacy meets Stellar.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Docs</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">GitHub</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
