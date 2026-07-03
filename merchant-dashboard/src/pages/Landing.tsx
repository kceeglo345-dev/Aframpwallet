import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
const aframpLogo = '/Screenshot_from_2026-07-03_03-28-36 copy.png';

const navItems = ['Solutions', 'Developers', 'Pricing', 'Company'];

const partnerLogos = [
  { name: 'ChainLink', abbr: 'CLK' },
  { name: 'Kuda', abbr: 'KUDA' },
  { name: 'Flutterwave', abbr: 'FLW' },
  { name: 'Paga', abbr: 'PAGA' },
  { name: 'Polygon', abbr: 'MATIC' },
];

const featureCards = [
  {
    title: 'Instant Settlements',
    description: 'Experience lightning-fast transaction settlements directly to local bank accounts and mobile money wallets across 12 countries.',
    icon: (
      <svg className="w-6 h-6 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Secure Infrastructure',
    description: 'Enterprise-grade security protocols, multi-sig wallets, and regular audits ensuring your funds and user data are always protected.',
    icon: (
      <svg className="w-6 h-6 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Low Fees',
    description: 'Competitive exchange rates and industry-low transaction fees to maximize your revenue and provide better value to your users.',
    icon: (
      <svg className="w-6 h-6 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375" />
      </svg>
    ),
  },
];

const walletActivities = [
  { title: 'USDC Received', time: 'Today, 10:23 AM', amount: '+500.00', positive: true },
  { title: 'Utility Bill', time: 'Yesterday, 4:15 PM', amount: '-45.20', positive: false },
];

const countries = [
  { name: 'Nigeria', code: 'NG', progress: 85 },
  { name: 'Kenya', code: 'KE', progress: 72 },
  { name: 'South Africa', code: 'ZA', progress: 68 },
  { name: 'Ghana', code: 'GH', progress: 55 },
];

const footerGroups = [
  { title: 'Product', links: ['On-Ramp', 'Off-Ramp', 'Bill Payments'] },
  { title: 'Developers', links: ['Documentation', 'API Reference', 'Status'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers'] },
  { title: 'Legal', links: ['Privacy', 'Terms'] },
];

export default function Landing() {
  return (
    <main className="w-full bg-[#102216]">
      {/* Header */}
      <header className="w-full border-b border-[#326744] bg-[#102216f2] backdrop-blur-[6px]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-6 py-3 sm:px-8 lg:px-16 xl:px-24 2xl:px-40">
          <a href="#" className="inline-flex shrink-0 items-center gap-2">
            <img src={aframpLogo} alt="AFRAMP logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold leading-[25px] tracking-[-0.30px] text-white whitespace-nowrap">
              AFRAMP
            </span>
          </a>
          <nav className="hidden flex-1 justify-center md:flex" aria-label="Primary">
            <ul className="flex items-center gap-9">
              {navItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-sm font-medium leading-[21px] text-white transition-opacity hover:opacity-80"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="inline-flex shrink-0 items-center gap-3">
            <Link to="/dashboard">
              <Button
                type="button"
                variant="outline"
                className="h-10 min-w-[84px] rounded-lg border-[#326744] bg-transparent px-5 py-0 text-sm font-bold tracking-[0.21px] text-white hover:bg-white/5 hover:text-white"
              >
                Log In
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                type="button"
                className="h-10 min-w-[84px] rounded-lg bg-[#13ec5b] px-4 py-0 shadow-[0px_0px_15px_#13ec5b4c] text-sm font-bold tracking-[0.21px] text-[#102216] hover:bg-[#13ec5b]/90"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full px-6 pb-24 pt-16 md:px-10 lg:px-20 xl:px-28 2xl:px-40">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start">
          <div className="flex w-full flex-col items-center justify-center gap-12 py-16 lg:flex-row lg:items-start lg:gap-10 lg:py-24">
            {/* Left Content */}
            <motion.header
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex w-full max-w-[480px] flex-col items-start gap-6 lg:pr-10"
            >
              <Badge className="h-auto rounded-full border border-solid border-[#326744] bg-[#19332280] px-3 py-1 hover:bg-[#19332280]">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#13ec5b]" />
                <span className="text-xs font-medium leading-4 text-[#13ec5b]">
                  Live in 12 African Countries
                </span>
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
                The Gateway to
                <br />
                <span className="text-[#13ec5b]">African Blockchain</span>
                <br />
                Payments
              </h1>
              <p className="max-w-[415px] text-lg font-normal leading-[29.2px] text-[#92c9a4]">
                Seamless fiat-to-crypto onramp/offramp and bill payments using stablecoins. Empowering the next generation of African finance with secure, instant settlements.
              </p>
              <div className="flex w-full flex-wrap items-start gap-3 pt-4">
                <Button className="h-12 min-w-[140px] rounded-lg bg-[#13ec5b] px-6 py-0 shadow-[0px_0px_20px_#13ec5b66] hover:bg-[#13ec5b]/90">
                  <span className="text-base font-bold tracking-[0.24px] text-[#102216]">
                    Get Started Now
                  </span>
                  <svg className="ml-2 w-4 h-4 text-[#102216]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 min-w-[140px] rounded-lg border-[#326744] bg-[#193322] px-6 py-0 text-white hover:bg-[#21402b] hover:text-white"
                >
                  <span className="text-base font-bold tracking-[0.24px]">
                    Contact Sales
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#102216] bg-[#193322] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#92c9a4]">{String.fromCharCode(65 + i)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-normal leading-5 text-[#92c9a4]">
                  Trusted by 10,000+ businesses
                </p>
              </div>
            </motion.header>

            {/* Right Content - Wallet Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex w-full max-w-[440px] flex-col items-start"
            >
              <div className="absolute -left-1 -top-1 h-[calc(100%+8px)] w-[calc(100%+8px)] rounded-2xl bg-[linear-gradient(90deg,rgba(19,236,91,1)_0%,rgba(13,148,136,1)_100%)] opacity-20 blur-sm" />
              <Card className="relative h-[330px] w-full overflow-hidden rounded-2xl border border-solid border-[#326744] bg-[#193322] shadow-[0px_25px_50px_-12px_#00000040]">
                <CardContent className="relative h-full p-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#193322] via-[#102216] to-[#193322]" />
                  <div className="absolute left-px top-px flex h-[calc(100%-2px)] w-[calc(100%-2px)] items-center justify-center p-8">
                    <Card className="-rotate-2 border border-solid border-[#326744] bg-[#102216e6] shadow-none backdrop-blur-md">
                      <CardContent className="relative flex flex-1 flex-col items-start gap-6 p-5">
                        <div className="absolute left-0 top-0 h-full w-full rounded-xl bg-[#ffffff01] shadow-[0px_25px_50px_-12px_#00000040]" />
                        <div className="relative flex w-full items-center justify-between">
                          <div className="flex flex-col items-start">
                            <p className="text-xs font-normal leading-4 text-[#92c9a4]">
                              Total Balance
                            </p>
                            <p className="text-2xl font-bold leading-8 text-white">
                              $24,592.00
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#13ec5b]/10 border border-[#13ec5b]/20">
                            <svg className="w-5 h-5 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 013 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>
                          </div>
                        </div>
                        <div className="relative flex w-full items-start justify-center gap-2">
                          <Button className="h-auto w-[161px] rounded-lg bg-[#13ec5b] px-0 py-[8.5px] hover:bg-[#13ec5b]/90">
                            <span className="text-sm font-bold leading-5 text-[#102216]">
                              Deposit
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto w-[163px] rounded-lg border-[#326744] bg-[#193322] px-0 py-2 text-white hover:bg-[#21402b] hover:text-white"
                          >
                            <span className="text-sm font-bold leading-5">
                              Withdraw
                            </span>
                          </Button>
                        </div>
                        <div className="relative flex w-full flex-col items-start gap-3">
                          {walletActivities.map((activity) => (
                            <div
                              key={activity.title}
                              className="flex w-full items-center justify-between rounded-lg bg-[#19332280] p-3"
                            >
                              <div className="inline-flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#326744]/30">
                                  {activity.positive ? (
                                    <svg className="w-4 h-4 text-[#13ec5b]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l6 6m-6-6l-6 6" />
                                    </svg>
                                  )}
                                </div>
                                <div className="inline-flex flex-col items-start">
                                  <p className="text-sm font-medium leading-5 text-white">
                                    {activity.title}
                                  </p>
                                  <p className="text-xs font-normal leading-4 text-[#92c9a4]">
                                    {activity.time}
                                  </p>
                                </div>
                              </div>
                              <p className={`text-sm font-bold leading-5 ${activity.positive ? 'text-[#13ec5b]' : 'text-white'}`}>
                                {activity.amount}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Partners Section */}
          <section className="flex w-full flex-col items-start gap-8 border-y border-[#32674480] px-0 py-12">
            <div className="flex w-full flex-col items-center">
              <h2 className="text-center text-sm font-bold leading-5 tracking-[0.70px] text-[#92c9a4]">
                TRUSTED BY LEADING PARTNERS ACROSS AFRICA
              </h2>
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:gap-16">
              {partnerLogos.map((partner) => (
                <button
                  key={partner.name}
                  type="button"
                  className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#326744]/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{partner.abbr}</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {partner.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="flex w-full flex-col items-start gap-10 px-0 pb-32 pt-24 lg:pb-48">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center px-0 lg:px-24"
            >
              <div className="flex w-full max-w-screen-md flex-col items-center">
                <p className="text-center text-sm font-bold leading-5 tracking-[0.70px] text-[#13ec5b]">
                  WHY CHOOSE AFRAMP?
                </p>
                <h2 className="mt-6 text-center text-3xl font-bold leading-tight text-white md:text-4xl md:leading-10">
                  Infrastructure built for scale,
                  <br className="hidden md:block" />
                  security, and speed.
                </h2>
                <p className="mt-7 text-center text-lg font-normal leading-[29.2px] text-[#92c9a4]">
                  Our platform provides the robust infrastructure you need to scale your blockchain business in Africa, handling complexities so you can focus on growth.
                </p>
              </div>
            </motion.div>
            <div className="flex w-full flex-col items-start pt-8">
              <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
                {featureCards.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full rounded-2xl border border-solid border-[#326744] bg-[#193322] hover:border-[#13ec5b]/30 transition-colors">
                      <CardContent className="flex h-full flex-col items-start gap-4 p-6">
                        <div className="flex h-14 w-12 items-center justify-center rounded-xl bg-[#13ec5b]/10 border border-[#13ec5b]/20">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold leading-[25px] text-white">
                          {feature.title}
                        </h3>
                        <p className="text-base font-normal leading-[26px] text-[#92c9a4]">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative flex w-full flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl border border-solid border-[#326744] bg-[linear-gradient(163deg,rgba(25,51,34,1)_0%,rgba(16,34,22,1)_100%)] p-8 md:p-12 lg:flex-row lg:p-16">
            <div className="absolute right-[-79px] top-[-79px] h-80 w-80 rounded-full bg-[#13ec5b1a] blur-[32px]" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-1 flex-col items-start gap-6"
            >
              <div className="flex w-full flex-col items-start">
                <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl md:leading-10">
                  Ready to revolutionize
                  <br />
                  payments?
                </h2>
              </div>
              <div className="flex w-full max-w-lg flex-col items-start">
                <p className="text-lg font-normal leading-7 text-[#92c9a4]">
                  Join hundreds of businesses using AFRAMP to power their crypto-to-fiat transactions. Start building today.
                </p>
              </div>
              <div className="flex w-full flex-col items-start gap-4 pt-2">
                <Link to="/dashboard">
                  <Button className="h-12 min-w-[140px] rounded-lg bg-[#13ec5b] px-6 py-0 hover:bg-[#13ec5b]/90">
                    <span className="text-base font-bold tracking-[0.24px] text-[#102216]">
                      Create Account
                    </span>
                  </Button>
                </Link>
                <Link to="/features">
                  <Button
                    variant="outline"
                    className="h-12 min-w-[140px] rounded-lg border-[#326744] bg-transparent px-6 py-0 text-white hover:bg-[#193322] hover:text-white"
                  >
                    <span className="text-base font-bold tracking-[0.24px]">
                      Read Documentation
                    </span>
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex w-full max-w-md flex-1 flex-col items-start"
            >
              <Card className="w-full rounded-2xl border border-solid border-[#326744] bg-[#19332280]">
                <CardContent className="p-6">
                  <div className="relative h-[300px] w-full">
                    <div className="relative flex h-full w-full flex-col gap-4">
                      <p className="text-sm font-bold text-[#13ec5b]">Coverage Map</p>
                      {countries.map((country) => (
                        <div
                          key={country.name}
                          className="flex flex-col items-start gap-2 rounded-xl border border-solid border-[#326744] bg-[#102216] p-4"
                        >
                          <div className="absolute left-0 top-0 h-full w-full rounded-xl bg-[#ffffff01] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
                          <div className="relative flex w-full items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-normal leading-4 text-[#92c9a4]">
                              {country.name}
                            </span>
                            <span className="ml-auto text-xs font-bold text-white">{country.progress}%</span>
                          </div>
                          <div className="relative h-2 w-full rounded-full bg-[#326744]">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full bg-[#13ec5b]"
                              style={{ width: `${country.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#326744] bg-[#102216]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-10 sm:px-8 lg:px-20 xl:px-24 2xl:px-40">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
            <section className="flex max-w-sm flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={aframpLogo}
                  alt="AFRAMP logo"
                  className="h-6 w-6 rounded object-cover"
                />
                <h2 className="text-lg font-bold leading-7 text-white">
                  AFRAMP
                </h2>
              </div>
              <p className="text-sm font-normal leading-5 text-[#92c9a4]">
                Empowering African businesses with seamless crypto payment infrastructure.
              </p>
              <div className="flex items-center gap-3">
                <button className="h-8 w-8 rounded-lg bg-[#326744]/30 flex items-center justify-center hover:bg-[#326744]/50 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button className="h-8 w-8 rounded-lg bg-[#326744]/30 flex items-center justify-center hover:bg-[#326744]/50 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.354.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.354 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.618-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>
              </div>
            </section>
            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 sm:gap-x-12 lg:gap-x-16"
            >
              {footerGroups.map((group) => (
                <div
                  key={group.title}
                  className="flex flex-col items-start gap-4"
                >
                  <h3 className="text-base font-bold leading-6 text-white">
                    {group.title}
                  </h3>
                  <ul className="flex flex-col items-start gap-3">
                    {group.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          className="h-auto p-0 text-left text-sm font-normal leading-5 text-[#92c9a4] transition-colors hover:text-white"
                        >
                          {link.includes('API Reference') ? (
                            <>
                              API
                              <br />
                              Reference
                            </>
                          ) : (
                            link
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-[#326744] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-normal leading-5 text-[#92c9a4]">
              &copy; 2023 AFRAMP Technologies. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
              <p className="text-sm font-normal leading-5 text-[#92c9a4]">
                Systems Operational
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
