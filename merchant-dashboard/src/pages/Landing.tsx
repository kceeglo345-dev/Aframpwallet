import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and product name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-black text-sm">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Aframp</h1>
                <p className="text-xs text-gray-400">Privacy Layer for Merchants</p>
              </div>
            </div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#how" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                How It Works
              </a>
              <a href="#merchants" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                For Merchants
              </a>
              <a href="https://github.com/kelly-musk/Aframpwallet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                GitHub
              </a>
            </div>

            {/* CTA Button */}
            <Link
              to="/dashboard"
              className="px-6 py-2 rounded-lg bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                Aframp is Privacy
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  for Stellar
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Zero-knowledge proofs wrap your Stellar payments. The blockchain sees only a validity proof and nullifier—nothing else. Your revenue, customers, and business relationships stay hidden.
              </p>

              {/* Live badge */}
              <div className="flex items-center gap-2 mb-10 text-sm text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Now live on Stellar Testnet</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 text-center"
                >
                  Connect Wallet
                </Link>
                <a
                  href="https://github.com/kelly-musk/Aframpwallet#quick-start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-lg border border-gray-700 text-white font-bold hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all text-center"
                >
                  Read Docs
                </a>
              </div>

              {/* Available on */}
              <div className="mt-10">
                <p className="text-xs text-gray-500 mb-3">Available on</p>
                <div className="flex gap-4">
                  <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    Stellar Network
                  </a>
                  <a href="https://github.com/kelly-musk/Aframpwallet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Right side - Visual mockup area */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-0 border border-emerald-500/30 rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <p className="text-gray-300 font-semibold">Zero-Knowledge</p>
                    <p className="text-gray-400 text-sm mt-2">Payments on Stellar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Quick Overview */}
      <section className="relative py-20 border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔐', title: 'Privately Hold and Transact Crypto', desc: 'Fully encrypted and private transactions by default.' },
              { icon: '✓', title: 'Privacy Made Easy', desc: 'Explore private transactions with a familiar crypto interface.' },
              { icon: '⚡', title: 'Cutting-edge Encryption', desc: 'Revolutionary Zero-Knowledge Proof encryption operating locally.' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-gray-800 hover:border-emerald-500/50 transition-all">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">OUR SOLUTION</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Unparalleled Merchant Privacy</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Private transactions with zero-knowledge proofs. Safeguard your digital assets and business relationships like never before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔐', title: 'Complete Privacy', desc: 'Payment amounts, customer identities, and merchant relationships stay hidden.' },
              { icon: '✓', title: 'Fraud-Proof', desc: 'Groth16 ZK proofs ensure payment validity. Double-spending prevented via nullifiers.' },
              { icon: '⚖️', title: 'Regulatory Ready', desc: 'Selective disclosure viewing keys for compliance audits when needed.' },
              { icon: '⚡', title: 'Instant Settlement', desc: '3-5 second settlements on Stellar with near-zero fees.' },
              { icon: '🔑', title: 'No Trust Assumptions', desc: 'Merchant runs proving system. Your secret never leaves your control.' },
              { icon: '🔓', title: 'Open Source', desc: 'Fully auditable. Built with arkworks Groth16 on BN254 curve.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-24 border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">WHY CHOOSE US</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Switch to ZK Privacy?</h2>
            <p className="text-gray-400 text-lg">
              Stellar scalability and Zcash privacy, all in one network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: 'Privacy by Default', desc: 'Hidden transactions are the norm, not an add-on.' },
              { title: 'Merchant Control', desc: 'You decide what data to reveal and when.' },
              { title: 'Regulatory Path', desc: 'Selective disclosure satisfies compliance requirements.' },
              { title: 'No Intermediaries', desc: 'Direct settlement without trusted third parties.' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-gray-800 hover:border-emerald-500/50 transition-all">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Want to learn more about the technology?</p>
            <a href="https://github.com/kelly-musk/Aframpwallet#how-it-works" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Learn more about ZK architecture →
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">TECHNICAL FLOW</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">4-constraint ZK proof system protecting your payments</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { num: '1', title: 'Merchant Secret', desc: '32-byte seed generates unique identity' },
              { num: '2', title: 'Build Proof', desc: '4 constraints protect transaction data' },
              { num: '3', title: 'Verify', desc: 'Soroban contract checks BN254 pairing' },
              { num: '4', title: 'Settle', desc: 'Only proof and nullifier recorded on-chain' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="p-6 rounded-lg border border-gray-800 bg-black">
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-sm">
                    {step.num}
                  </div>
                  <h3 className="font-bold mt-2 mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 w-4 justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
            <h3 className="font-bold text-lg mb-4">Circuit Constraints</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
              <div>
                <p className="text-emerald-400 font-mono mb-2">merchant_id = secret × 2</p>
                <p className="text-xs">Merchant identity derived from seed</p>
              </div>
              <div>
                <p className="text-emerald-400 font-mono mb-2">nullifier = secret + amount</p>
                <p className="text-xs">Unique per payment, prevents double-spend</p>
              </div>
              <div>
                <p className="text-emerald-400 font-mono mb-2">commitment = secret × amount × customer</p>
                <p className="text-xs">Binds payment to customer</p>
              </div>
              <div>
                <p className="text-emerald-400 font-mono mb-2">amount × inv(amount) = 1</p>
                <p className="text-xs">Ensures non-zero amount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Merchants */}
      <section id="merchants" className="relative py-24 border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">REAL WORLD USE CASES</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for Real Merchants</h2>
            <p className="text-gray-400 text-lg">Industries where payment privacy is a requirement</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏢', title: 'B2B Payments', desc: 'Hide revenue and terms from competitors' },
              { icon: '⚕️', title: 'Healthcare', desc: 'GDPR-compliant patient payment privacy' },
              { icon: '⚖️', title: 'Legal Services', desc: 'Confidential client financial records' },
              { icon: '💎', title: 'Luxury Retail', desc: 'Protect customer identities and purchase history' },
            ].map((use, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-gray-800 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5">
                <div className="text-4xl mb-3">{use.icon}</div>
                <h3 className="font-bold mb-2">{use.title}</h3>
                <p className="text-gray-400 text-sm">{use.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Tools / Tech Stack */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">EXPERT TOOLS</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Enterprise-Grade Stack</h2>
            <p className="text-gray-400 text-lg">Built with proven cryptography and Stellar infrastructure</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Groth16 Proofs', desc: 'BN254 elliptic curve proving system' },
              { name: 'Soroban Contracts', desc: 'Stellar Protocol 25+ verification layer' },
              { name: 'arkworks 0.4', desc: 'High-performance ZK framework in Rust' },
              { name: 'React 19', desc: 'Modern merchant dashboard interface' },
              { name: 'Stellar Testnet', desc: 'Live testing and deployment' },
              { name: 'Open Source', desc: 'MIT licensed, full transparency' }
            ].map((tech, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-800 hover:border-emerald-500/30 transition-all">
                <h3 className="font-bold text-emerald-400 mb-1">{tech.name}</h3>
                <p className="text-gray-400 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready for Private Payments?</h2>
          <p className="text-gray-400 text-lg mb-12">
            Deploy your privacy layer on Stellar testnet. Control your data, protect your merchants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
            >
              Connect Wallet
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://github.com/kelly-musk/Aframpwallet"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg border border-gray-700 text-white font-bold hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-gray-400 text-sm">© 2024 Aframp. Zero-knowledge privacy for Stellar merchants.</p>
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/kelly-musk/Aframpwallet#quick-start" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                Quick Start
              </a>
              <a href="https://github.com/kelly-musk/Aframpwallet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                GitHub
              </a>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                Built on Stellar
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
