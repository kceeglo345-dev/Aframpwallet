import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import aframpLogo from '../assets/3_3.png'

const faqs = [
  {
    q: 'How do I get started with Aframp?',
    a: 'Create your merchant identity using the onboarding flow. We generate a cryptographic seed that derives your proving key, verification key, and merchant ID. No trusted setup ceremony required — everything is deterministic from your seed.',
  },
  {
    q: 'What tokens does Aframp support?',
    a: 'Aframp currently supports USDC and XLM on Stellar Testnet. Mainnet support for additional Stellar assets is on the roadmap. The ZK circuit works with any numeric payment amount.',
  },
  {
    q: 'How do ZK proofs protect my payments?',
    a: 'Groth16 proofs on BN254 encode the payment amount, customer identity, and merchant ID into a cryptographic commitment. The Stellar contract only sees the proof and a nullifier — never the underlying data. Only your viewing key can decrypt the actual amounts.',
  },
  {
    q: 'What are the fees for using Aframp?',
    a: 'Aframp charges 0.1% per verified payment. Stellar network fees are near-zero (~0.00001 XLM per transaction). ZK proof generation is free and runs client-side in your browser.',
  },
  {
    q: 'How do I track my private payments?',
    a: 'All payments are encrypted with your AES-256-GCM viewing key and stored off-chain. Your merchant dashboard decrypts them in real-time. You can also generate audit-specific viewing keys for regulators without exposing your master secret.',
  },
  {
    q: 'How does the Payment Stream work?',
    a: 'The Payment Stream demo generates a Groth16 ZK proof entirely in your browser using a compiled WASM module. Your customer secret is generated via crypto.getRandomValues() and never leaves the device. The proof is then relayed to the Soroban contract for on-chain verification.',
  },
  {
    q: 'Can I convert my crypto to fiat?',
    a: 'Yes — the Offramp section lets you export compliance reports and viewing keys to facilitate fiat conversion with compliant partners across major networks including Stellar.',
  },
]

const features = [
  {
    title: 'ZK Distributions',
    desc: 'Send private payments to multiple recipients in one transaction. Zero-knowledge proofs hide amounts while the contract verifies validity. Equal or weighted splits with nullifier-based double-spend protection.',
    cta: 'Create Distribution',
    href: '/distribution',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: 'Payment Stream',
    desc: 'Automate continuous private crypto payouts, subscriptions, and salaries. Set up once, run forever. All amounts stay hidden on-chain via Groth16 proofs generated client-side.',
    cta: 'Create Stream',
    href: '/pay',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Fiat Offramp',
    desc: 'Convert private crypto payments to fiat securely. Export compliance reports with selective disclosure using viewing keys — share only what regulators need, nothing more.',
    cta: 'Cash Out Now',
    href: '/compliance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: 'Privacy Crowdfunding',
    desc: 'Run fundraising campaigns where donor amounts stay private. Connect with contributors who value discretion. Cryptographic commitments prove total funding without revealing individual amounts.',
    cta: 'Start Campaign',
    href: '/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: 'AirDrops',
    desc: 'Distribute tokens privately to your community. Our ZK-optimized airdrop tool supports customizable distribution rules and automated eligibility verification — efficient and confidential.',
    cta: 'Start Airdrop',
    href: '/distribution',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
]

const partnerBadges = [
  'Stellar', 'Soroban', 'Groth16', 'BN254', 'WASM', 'React', 'Rust', 'Tailwind',
]

const pillars = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    label: 'Efficient',
    desc: 'Streamline your payment workflows, reduce overhead, and allocate more resources to growth — not transfers.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: 'Transparent & Trustworthy',
    desc: 'On-chain ZK proofs and nullifier audit trails keep your payments verifiable without exposing sensitive data.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    label: 'No Limits',
    desc: 'Unlock limitless private payment potential with Aframp\'s scalable ZK architecture on Stellar\'s fast, low-cost network.',
  },
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-[#0a0a0f] text-white min-h-screen overflow-x-hidden font-sans">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={aframpLogo} alt="Aframp" className="h-8 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Console</Link>
            <Link to="/developers" className="text-sm text-gray-400 hover:text-white transition-colors">Developers</Link>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition-all"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-green-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight">
              Private Payments on
              <br />
              <span className="text-green-400">Stellar</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Your one stop{' '}
              <span className="text-white font-medium">zero-knowledge privacy</span>{' '}
              solution for{' '}
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-green-500/15 border border-green-500/25 rounded-full text-green-400 text-sm font-medium">
                Merchants
              </span>
            </p>
          </motion.div>

          {/* Hero visual — abstract ZK network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="mt-14 mx-auto max-w-2xl relative"
          >
            <div className="relative bg-gradient-to-b from-gray-900/80 to-gray-950 border border-white/8 rounded-2xl p-8 overflow-hidden">
              {/* Animated grid */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              <div className="relative flex items-center justify-between gap-6">
                {/* Customer */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Customer</span>
                  <div className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">WASM Prover</div>
                </div>

                {/* Arrow + proof */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs font-mono text-green-400 bg-gray-900 px-2 py-1 rounded border border-green-500/20 whitespace-nowrap"
                    >
                      ZK Proof
                    </motion.div>
                    <div className="flex-1 h-px bg-gradient-to-l from-green-500/50 to-transparent" />
                  </div>
                  <span className="text-xs text-gray-600">amount hidden on-chain</span>
                </div>

                {/* Contract */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Soroban</span>
                  <div className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">BN254 Verify</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Proof Time', value: '~2.1s' },
                  { label: 'Settlement', value: '3-5s' },
                  { label: 'Privacy', value: '100%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900/60 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Partner marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 overflow-hidden"
          >
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
              <div className="flex marquee-track gap-12 py-1">
                {[...partnerBadges, ...partnerBadges].map((name, i) => (
                  <span key={i} className="text-sm text-gray-600 font-medium whitespace-nowrap hover:text-gray-400 transition-colors cursor-default">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Privacy-First Payments, <span className="text-green-400">Made Easy</span>
            </h2>
            <p className="mt-3 text-gray-400 max-w-xl">
              Aframp simplifies ZK-native payments: private distributions, payment streaming, fiat offramping, and airdrop payouts — all cryptographically hidden and gas-efficient.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group relative bg-[#111118] border border-white/8 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                    {f.icon}
                  </div>
                  <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{f.desc}</p>
                <Link
                  to={f.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  {f.cta}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Send Payments Section ── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Send payments in<br />
                <span className="text-green-400">crypto currencies</span>
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Unlock the full potential of zero-knowledge payments with Aframp's efficient, private, and cryptographically-verified solutions.
              </p>

              <div className="mt-8 space-y-5">
                {pillars.map((p) => (
                  <div key={p.label} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0 mt-0.5">
                      {p.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-400">{p.label}</p>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative"
            >
              {/* Payment flow card */}
              <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-white">Private Payment Flow</span>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Live Demo</span>
                </div>

                {[
                  { step: '01', label: 'Generate customer secret', detail: 'crypto.getRandomValues()', status: 'done' },
                  { step: '02', label: 'Compute ZK proof in browser', detail: 'Groth16 · BN254 · WASM', status: 'done' },
                  { step: '03', label: 'Submit proof to Soroban', detail: 'nullifier + commitment', status: 'active' },
                  { step: '04', label: 'Contract verifies pairing', detail: 'e(A,B) = e(α,β)...', status: 'pending' },
                ].map((item) => (
                  <div key={item.step} className={`flex items-start gap-4 p-3 rounded-xl mb-2 ${item.status === 'active' ? 'bg-green-500/8 border border-green-500/20' : ''}`}>
                    <span className={`text-xs font-mono font-bold pt-0.5 ${item.status === 'done' ? 'text-green-400' : item.status === 'active' ? 'text-green-300' : 'text-gray-600'}`}>
                      {item.status === 'done' ? '✓' : item.step}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${item.status === 'pending' ? 'text-gray-600' : 'text-white'}`}>{item.label}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}

                <Link
                  to="/pay"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-400 transition-colors rounded-xl text-sm font-semibold text-white"
                >
                  Try Payment Demo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30">
                Client-Side ZK
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-gray-400">Get the answers you need to navigate our platform with confidence.</p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Getting Started', 'Security & Privacy', 'Transactions', 'Compliance'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-400 hover:border-green-500/30 hover:text-green-400 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#111118] border border-white/8 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:bg-white/3 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.svg
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`w-4 h-4 flex-shrink-0 ml-4 ${openFaq === i ? 'text-green-400' : 'text-gray-600'}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5">
                        <div className="pt-3">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={aframpLogo} alt="Aframp" className="h-7 w-auto object-contain" />
              <span className="text-xs text-gray-600 ml-2">CONTACT US</span>
              <a href="mailto:admin@aframp.finance" className="text-xs text-gray-500 hover:text-white transition-colors">admin@aframp.finance</a>
            </div>
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} — Copyright</p>
            <div className="flex items-center gap-5">
              <a href="https://github.com/kelly-musk/Aframpwallet" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">X</a>
              <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Telegram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
