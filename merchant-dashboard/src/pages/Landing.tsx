import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Zero-Knowledge Proofs',
    desc: 'Every payment is verified using Groth16 ZK proofs on Stellar. Amounts, customer IDs, and merchant relationships stay cryptographically hidden.',
    cta: 'How it works',
    href: '/developers',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Client-Side WASM Prover',
    desc: 'ZK proofs are generated entirely in the browser via WebAssembly. Your merchant secret never leaves the device — no server relay, no trusted third party.',
    cta: 'Try the demo',
    href: '/pay',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    title: 'Viewing Keys',
    desc: 'Generate cryptographic viewing keys to selectively share transaction details with auditors, accountants, or regulators — without compromising your master secret.',
    cta: 'Learn more',
    href: '/compliance',
  },
]

const pillars = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Private by Default',
    desc: 'Payment amounts and customer data are encrypted end-to-end. Only the merchant can decrypt using their secret viewing key.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Fully Auditable',
    desc: 'Optional viewing keys let you share encrypted transaction data with auditors and regulators while maintaining overall privacy guarantees.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Built on Stellar',
    desc: 'Leverages Stellar for fast (3-5s), low-cost settlement. No gas fees, no congestion — just instant, private transactions.',
  },
]

const faqs = [
  {
    q: 'How does Aframp protect payment privacy?',
    a: 'Aframp uses Groth16 zero-knowledge proofs on the BN254 curve. When a customer makes a payment, their client generates a ZK proof that encodes the payment amount, merchant ID, and a unique nullifier — all without revealing any of these values. The proof is verified on-chain by a Soroban smart contract, and only the merchant can decrypt the actual payment data using their secret viewing key.',
  },
  {
    q: 'What is a viewing key and how do I use it?',
    a: 'A viewing key is a cryptographic key derived from your merchant secret that can selectively decrypt payment data. You can generate multiple viewing keys to share with auditors, accountants, or compliance officers — each key provides access to specific subsets of transaction data without exposing your master merchant secret.',
  },
  {
    q: 'Is Aframp production ready?',
    a: 'Aframp is currently deployed on Stellar Testnet for testing and integration. The protocol uses standard cryptographic primitives (Groth16 on BN254) that are widely used in production privacy systems. We recommend thorough testing before mainnet deployment.',
  },
  {
    q: 'How do I integrate Aframp with my POS system?',
    a: 'Integration is straightforward. Deploy the Soroban verifier contract, generate your merchant keys, and add the Aframp SDK to your POS client. Your customers scan a QR code on their phone, enter the amount, and the payment proof is generated in-browser via WASM — no server-side changes required.',
  },
  {
    q: 'What makes Aframp different from other privacy solutions?',
    a: 'Unlike general-purpose privacy protocols, Aframp is purpose-built for merchant payments. It operates client-side (no relayer), leverages Stellar\'s fast settlement (3-5 seconds), and includes compliance features like viewing keys and audit-ready reporting out of the box.',
  },
]

const trustBadges = [
  { name: 'Stellar' },
  { name: 'Soroban' },
  { name: 'WebAssembly' },
  { name: 'Groth16' },
  { name: 'BN254' },
  { name: 'Rust' },
  { name: 'React' },
  { name: 'Tailwind CSS' },
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [heroRef, heroIn] = useInView()
  const [featuresRef, featuresIn] = useInView()
  const [pillarsRef, pillarsIn] = useInView()
  const [faqRef, faqIn] = useInView()
  const [ctaRef, ctaIn] = useInView()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-[#0a0a0f] text-white min-h-screen overflow-x-hidden">
      {/* ── Fixed Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Aframp</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Console</Link>
              <Link to="/developers" className="text-sm text-gray-400 hover:text-white transition-colors">Developers</Link>
              <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
            </div>

            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-400 transition-all hover:shadow-lg hover:shadow-green-500/25"
            >
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative pt-36 pb-28 md:pt-44 md:pb-36 overflow-hidden"
      >
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent animate-fade-in" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-green-500/10 rounded-full blur-3xl animate-glow-pulse" />

        {/* Floating decorative elements */}
        <div className="absolute top-1/3 right-[10%] w-24 h-24 rounded-full bg-green-500/5 blur-2xl animate-float hidden lg:block" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-[8%] w-32 h-32 rounded-full bg-green-400/5 blur-3xl animate-float hidden lg:block" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Now Live on Stellar Testnet
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-white">Zero-Knowledge Privacy</span>
              <br />
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                for Stellar Payments
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Aframp is a zero-knowledge privacy layer for merchants on Stellar. 
              Hide payment amounts, protect customer identities, and keep business 
              relationships confidential — while maintaining verifiability and compliance.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-400 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Launch Console
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="https://github.com/kelly-musk/Aframpwallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-all hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </div>

            {/* Marquee Trust Badges */}
            <div className="mt-20 overflow-hidden">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Built with</p>
              <div className="relative">
                <div className="flex marquee-track">
                  {[...trustBadges, ...trustBadges].map((badge, i) => (
                    <span
                      key={i}
                      className="text-sm font-medium text-gray-600 whitespace-nowrap"
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        ref={featuresRef}
        className="py-24 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-2xl mx-auto transition-all duration-700 ${
            featuresIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need for private payments
            </h2>
            <p className="mt-4 text-gray-400">
              A complete privacy stack for merchants — from in-browser proof generation to compliance reporting.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-500/30 transition-all duration-500 ${
                  featuresIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${i * 150}ms`,
                  transitionProperty: 'opacity, transform, border-color',
                  transitionDuration: '0.5s',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-5 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{f.desc}</p>
                <Link
                  to={f.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300 transition-colors group/link"
                >
                  {f.cta}
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Pillars ── */}
      <section
        ref={pillarsRef}
        className="py-24 border-t border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className={`text-center transition-all duration-700 ${
                  pillarsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-5 hover:scale-110 hover:bg-green-500/20 transition-all duration-300">
                  {p.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        ref={faqRef}
        className="py-24 border-t border-gray-800/50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            faqIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border border-gray-800 overflow-hidden transition-all duration-500 hover:border-gray-700 ${
                  faqIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-white hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  {faq.q}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                      openFaq === i ? 'rotate-180 text-green-400' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef}
        className="py-24 border-t border-gray-800/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/3 via-transparent to-green-500/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
            ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Ready for private payments on Stellar?
            </h2>
            <p className="mt-4 text-gray-400">
              Launch your merchant console, deploy the privacy contract, and start accepting private payments in minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-400 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/developers"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-all hover:-translate-y-0.5"
              >
                Read Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Aframp</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Aframp. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/kelly-musk/Aframpwallet" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
