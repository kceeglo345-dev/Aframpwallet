import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
const aframpLogo = '/Screenshot_from_2026-07-03_03-28-36 copy.png';

const navigationItems = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About Us', href: '#about-us' },
  { label: 'Contact', href: '#contact' },
];

const featureRows = [
  {
    eyebrow: 'INSTANT LIQUIDITY',
    title: 'Seamless Onramp & Offramp',
    description:
      'Convert between local fiat currencies and crypto instantly. We provide the fastest rails for moving money in and out of the digital economy across Africa, ensuring you never miss a market opportunity.',
    bullets: ['Zero-hidden fee structure', 'Settlement in under 5 minutes', 'High liquidity pools'],
    imageFirst: true,
    glow: 'bg-[linear-gradient(90deg,rgba(19,236,91,1)_0%,rgba(22,163,74,1)_100%)]',
  },
  {
    eyebrow: 'STABILITY FIRST',
    title: 'Stablecoin Settlements',
    description:
      'Protect your business from currency volatility. Settle transactions in USDC, USDT, or localized stablecoins to ensure consistent value transfer across borders without the headache of fluctuating exchange rates.',
    tags: ['USDC', 'USDT', 'cNGN'],
    imageFirst: false,
    glow: 'bg-[linear-gradient(90deg,rgba(22,163,74,1)_0%,rgba(19,236,91,1)_100%)]',
  },
  {
    eyebrow: 'ENTERPRISE SCALE',
    title: 'Bulk Bill Payments',
    description:
      'Pay thousands of bills, vendors, or salaries simultaneously with a single API call. Our automated bulk payment system handles the complexity, ensuring every recipient gets paid on time, every time.',
    stats: [
      { value: '5000+', label: 'TXNS PER BATCH' },
      { value: '99.9%', label: 'UPTIME SLA' },
    ],
    imageFirst: true,
    glow: 'bg-[linear-gradient(90deg,rgba(19,236,91,1)_0%,rgba(16,185,129,1)_100%)]',
  },
];

const currencies = [
  { code: 'NGN', country: 'Nigeria', description: 'Direct bank transfers and mobile money integration for Naira.' },
  { code: 'KES', country: 'Kenya', description: 'Seamless integration with M-Pesa and local banking rails.' },
  { code: 'GHS', country: 'Ghana', description: 'Fast processing for Cedi via mobile money networks.' },
  { code: 'ZAR', country: 'South Africa', description: 'Instant EFT and card payments support for Rand.' },
];

const footerSections = [
  { title: 'Product', links: ['Features', 'Pricing', 'API Docs'] },
  { title: 'Company', links: ['About Us', 'Careers', 'Blog'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] },
];

function FeatureVisual({ glow }: { glow: string }) {
  return (
    <div className="relative w-full">
      <div className={`pointer-events-none absolute -inset-1 rounded-xl blur-sm opacity-25 ${glow}`} />
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-solid border-[#23482f] bg-[#1a3322] sm:h-80 md:h-96">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a3322]/80 via-[#1a3322]/40 to-[#1a3322]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${glow.slice(-4)}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#13ec5b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${glow.slice(-4)})`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#13ec5b]/10 border border-[#13ec5b]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <main className="w-full bg-[#102216]">
      {/* ── Top Navigation ── */}
      <header className="relative z-20 w-full border-b border-[#23482f] bg-[#102216f2] backdrop-blur-sm">
        <div className="flex w-full items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-10">
          <a href="#" className="inline-flex shrink-0 items-center gap-3" aria-label="AFRAMP home">
            <img src={aframpLogo} alt="AFRAMP logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="whitespace-nowrap text-xl font-bold leading-[25px] tracking-[-0.30px] text-white">
              AFRAMP
            </span>
          </a>
          <div className="flex flex-1 items-center justify-end gap-4 lg:gap-8">
            <nav aria-label="Primary navigation" className="hidden md:block">
              <ul className="flex items-center gap-6 lg:gap-9">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="inline-flex items-center whitespace-nowrap text-sm font-medium leading-[21px] text-slate-300 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="inline-flex items-center gap-2">
              <Link to="/dashboard">
                <Button
                  type="button"
                  className="h-10 min-w-[84px] rounded-lg bg-[#13ec5b] px-4 py-0 text-sm font-bold leading-[21px] tracking-[0.21px] text-[#112217] hover:bg-[#13ec5b]/90"
                >
                  Sign Up
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-w-[84px] rounded-lg border-[#23482f] bg-transparent px-[21.75px] py-0 text-sm font-bold leading-[21px] tracking-[0.21px] text-white hover:bg-white/5 hover:text-white"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Platform Overview & Solutions ── */}
      <section className="relative w-full bg-[#001a0a]">
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-16 px-4 py-20 sm:px-8 lg:px-10 lg:py-24">
          {/* Hero header */}
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex w-full max-w-4xl flex-col items-center text-center"
          >
            <Badge className="mb-8 inline-flex h-auto items-center gap-2 rounded-full border border-[#13ec5b4c] bg-[#13ec5b1a] px-4 py-2 text-[#13ec5b] hover:bg-[#13ec5b1a]">
              <span className="h-2 w-2 rounded-full bg-[#13ec5b]" />
              <span className="text-sm font-medium leading-5">Now Live in 12 Countries</span>
            </Badge>
            <h2 className="text-center text-4xl font-normal leading-tight tracking-[-0.90px] text-white sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[60px]">
              The Financial Infrastructure
              <br />
              for <span className="text-[#13ec5b]">Modern Africa</span>
            </h2>
            <p className="mt-6 max-w-2xl text-center text-base font-normal leading-7 text-slate-300 sm:text-lg sm:leading-[29.2px]">
              Connecting African businesses to the global economy through seamless blockchain payments. Experience instant settlements, low fees, and complete transparency.
            </p>
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button className="h-auto min-w-40 rounded-lg bg-[#13ec5b] px-8 py-3 text-base font-bold text-[#112217] hover:bg-[#13ec5b]/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/developers">
                <Button
                  variant="outline"
                  className="h-auto min-w-40 rounded-lg border-[#23482f] bg-transparent px-6 py-3 text-base font-bold text-white hover:bg-[#1a3322] hover:text-white"
                >
                  View Documentation
                </Button>
              </Link>
            </nav>
          </motion.header>

          {/* Feature rows */}
          <div id="features" className="flex w-full flex-col gap-16">
            {featureRows.map((feature) => (
              <motion.section
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-24"
              >
                <div className={feature.imageFirst ? 'order-1' : 'order-2 lg:order-2'}>
                  {feature.imageFirst ? (
                    <FeatureVisual glow={feature.glow} />
                  ) : (
                    <article className="order-1 flex flex-col">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13ec5b]/10 border border-[#13ec5b]/20">
                          <svg className="w-6 h-6 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold leading-5 tracking-[0.70px] text-[#13ec5b]">
                          {feature.eyebrow}
                        </p>
                      </div>
                      <h3 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-10">
                        {feature.title}
                      </h3>
                      <p className="max-w-xl text-base font-normal leading-7 text-slate-300 sm:text-lg sm:leading-[29.2px]">
                        {feature.description}
                      </p>
                      {feature.tags && (
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                          {feature.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="h-auto rounded border border-[#23482f] bg-[#1a3322] px-4 py-2 text-base font-medium leading-6 text-slate-300 hover:bg-[#1a3322]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </article>
                  )}
                </div>

                <article
                  className={
                    feature.imageFirst ? 'order-2 flex flex-col' : 'order-1 lg:order-1'
                  }
                >
                  {!feature.imageFirst ? (
                    <FeatureVisual glow={feature.glow} />
                  ) : (
                    <>
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13ec5b]/10 border border-[#13ec5b]/20">
                          <svg className="w-6 h-6 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold leading-5 tracking-[0.70px] text-[#13ec5b]">
                          {feature.eyebrow}
                        </p>
                      </div>
                      <h3 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-10">
                        {feature.title}
                      </h3>
                      <p className="max-w-xl text-base font-normal leading-7 text-slate-300 sm:text-lg sm:leading-[29.2px]">
                        {feature.description}
                      </p>
                      {feature.bullets && (
                        <ul className="mt-8 flex flex-col gap-3">
                          {feature.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#13ec5b]/15 border border-[#13ec5b]/30 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                              <span className="text-base font-normal leading-6 text-slate-300">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {feature.stats && (
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {feature.stats.map((stat) => (
                            <Card key={stat.label} className="rounded-lg border border-[#23482f] bg-[#1a3322] shadow-none">
                              <CardContent className="flex h-full flex-col items-start gap-1 p-4">
                                <div className="text-2xl font-bold leading-8 text-[#13ec5b]">{stat.value}</div>
                                <div className="text-xs font-normal leading-4 tracking-[0.30px] text-slate-400">{stat.label}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </article>
              </motion.section>
            ))}
          </div>

          {/* Currency support section */}
          <section className="flex w-full flex-col items-center gap-16 pt-4">
            <header className="flex w-full max-w-2xl flex-col items-center text-center">
              <div className="mb-4 h-[88px] w-16 flex items-center justify-center">
                <svg className="w-16 h-16 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.82 3.07.817 4.243 0L21 15M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-10">
                Local Currency Support
              </h3>
              <p className="mt-4 text-base font-normal leading-7 text-slate-300 sm:text-lg">
                We speak your language—and your currency. Native support for major African currencies means you can operate locally while thinking globally.
              </p>
            </header>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {currencies.map((currency, i) => (
                <motion.div
                  key={currency.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="rounded-xl border border-[#23482f] bg-[#193322] shadow-[0px_1px_2px_#0000000d] hover:border-[#13ec5b]/30 transition-colors">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="pb-2">
                        <div className="h-40 w-full rounded-lg bg-gradient-to-br from-[#1a3322] to-[#102216] border border-[#23482f] flex items-center justify-center">
                          <span className="text-3xl font-bold text-[#13ec5b]/40">{currency.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-xl font-bold leading-7 text-white">{currency.code}</h4>
                        <Badge className="h-auto rounded bg-[#13ec5b1a] px-2 py-1 text-xs font-bold leading-4 text-[#13ec5b] hover:bg-[#13ec5b1a]">
                          {currency.country}
                        </Badge>
                      </div>
                      <p className="text-sm font-normal leading-5 text-slate-400">{currency.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA section */}
        <section className="border-t border-[#23482f] bg-[#102216]">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
            <h3 className="text-3xl font-bold leading-tight tracking-[-0.90px] text-white sm:text-4xl sm:leading-10">
              Ready to transform your payments?
            </h3>
            <p className="max-w-xl text-base font-normal leading-7 text-slate-300 sm:text-lg">
              Join thousands of businesses across the continent using AFRAMP to scale faster and cheaper.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/dashboard">
                <Button className="h-auto min-w-[180px] rounded-lg bg-[#13ec5b] px-6 py-3 text-base font-bold text-[#112217] hover:bg-[#13ec5b]/90">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="h-auto min-w-[180px] rounded-lg border-[#23482f] bg-transparent px-8 py-3 text-base font-bold text-white hover:bg-[#1a3322] hover:text-white"
                >
                  Contact Sales
                </Button>
              </Link>
            </nav>
            <p className="text-sm font-normal leading-5 text-slate-400">No credit card required for sandbox access.</p>
          </div>
        </section>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-[#23482f] bg-[#112217] px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-12">
          <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start">
            <section className="flex max-w-xs flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src={aframpLogo} alt="AFRAMP logo" className="h-6 w-6 rounded object-cover" />
                <h2 className="text-lg font-bold leading-7 text-white">AFRAMP</h2>
              </div>
              <p className="text-sm font-normal leading-5 text-slate-400">
                Powering the next generation of African
                <br />
                payments with blockchain technology.
              </p>
            </section>
            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 sm:gap-x-16"
            >
              {footerSections.map((section) => (
                <div key={section.title} className="flex flex-col items-start gap-3">
                  <h3 className="text-sm font-bold leading-5 text-white">{section.title}</h3>
                  <div className="flex flex-col items-start gap-3">
                    {section.links.map((link) => (
                      <button
                        key={link}
                        className="text-left text-sm font-normal leading-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="flex w-full flex-col gap-8">
            <Separator className="bg-[#23482f]" />
            <p className="text-center text-sm font-normal leading-5 text-slate-400">
              &copy; 2024 AFRAMP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
