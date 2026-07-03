import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function Dashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: MerchantAPI.getDashboardStats,
  });

  const [chartRange, setChartRange] = useState<'30 Days' | '7 Days' | '24 Hours'>('30 Days');

  const statsCards = [
    {
      title: "Total Balance (NGN)",
      value: "₦45,230,000",
      trend: "+12.5%",
      trendTextColor: "text-green-400",
      trendBgColor: "bg-[#14532d4c]",
      positive: true,
    },
    {
      title: "Stablecoin Balance (USDC)",
      value: statsData?.total_volume_usd || "$28,400.50",
      trend: "+5.2%",
      trendTextColor: "text-green-400",
      trendBgColor: "bg-[#14532d4c]",
      positive: true,
    },
    {
      title: "Pending Payouts",
      value: "$1,200.00",
      trend: "-2.1%",
      trendTextColor: "text-orange-400",
      trendBgColor: "bg-[#7c2d124c]",
      positive: false,
    },
  ];

  const activities = [
    {
      transactionId: "#TRX-8821",
      type: "Deposit (USDC)",
      date: "Oct 24, 2023 at 4:30 PM",
      status: "Completed",
      statusClassName: "bg-[#14532d4c] text-green-400",
      amount: "+ $4,500.00",
    },
    {
      transactionId: "#TRX-8820",
      type: "Payout (NGN)",
      date: "Oct 24, 2023 at 2:15 PM",
      status: "Processing",
      statusClassName: "bg-[#713f124c] text-yellow-400",
      amount: "- ₦1,250,000",
    },
    {
      transactionId: "#TRX-8819",
      type: "Bill Payment",
      date: "Oct 23, 2023 at 10:45 AM",
      status: "Completed",
      statusClassName: "bg-[#14532d4c] text-green-400",
      amount: "- $350.00",
    },
    {
      transactionId: "#TRX-8818",
      type: "Deposit (USDC)",
      date: "Oct 22, 2023 at 6:20 PM",
      status: "Completed",
      statusClassName: "bg-[#14532d4c] text-green-400",
      amount: "+ $12,000.00",
    },
    {
      transactionId: "#TRX-8817",
      type: "Payout (NGN)",
      date: "Oct 22, 2023 at 9:00 AM",
      status: "Failed",
      statusClassName: "bg-[#7f1d1d4c] text-red-400",
      amount: "- ₦500,000",
    },
  ];

  const chartLabels = ["Oct 1", "Oct 5", "Oct 10", "Oct 15", "Oct 20", "Oct 25", "Oct 30"];

  return (
    <main className="flex min-h-screen w-full flex-col items-start gap-8 p-6 md:p-8">
      {/* Header */}
      <header className="flex w-full items-start justify-between gap-6 bg-transparent max-md:flex-col max-md:items-start">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-3xl font-normal leading-9 tracking-[-0.75px] text-white">
            Dashboard Overview
          </h1>
          <p className="text-base leading-6 text-[#13ec5bb2]">
            Welcome back, Global Ventures Ltd.
          </p>
        </div>
        <nav className="flex items-start gap-3 max-sm:w-full max-sm:flex-col">
          <Button
            type="button"
            variant="outline"
            className="h-auto gap-2 rounded-lg border border-slate-700 bg-[#182e21] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d3527] hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Export Report
          </Button>
          <Button
            type="button"
            className="h-auto gap-2 rounded-lg bg-[#13ec5b] px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-[#13ec5b]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Transaction
          </Button>
        </nav>
      </header>

      {/* Stats Cards */}
      <section className="relative flex w-full flex-1 items-start justify-center gap-6 max-md:grid max-md:grid-cols-1">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="relative flex flex-1 grow self-stretch overflow-hidden rounded-2xl border border-slate-800 bg-[#182e21] shadow-[0px_1px_2px_#0000000d]"
          >
            <CardContent className="flex w-full flex-1 flex-col justify-between p-6">
              <header className="flex flex-col items-start gap-2">
                <h3 className="text-base font-medium leading-6 text-slate-400">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold leading-9 tracking-[-0.75px] text-white">
                  {card.value}
                </p>
              </header>
              <footer className="pt-4">
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center rounded-full px-2 py-1 ${card.trendBgColor}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.positive ? "M12 19.5v-15m0 0l-6 6m6-6l6 6" : "M12 4.5v15m0 0l6-6m-6 6l-6-6"} />
                    </svg>
                    <span className={`relative ml-1 flex h-4 items-center whitespace-nowrap text-xs font-bold ${card.trendTextColor}`}>
                      {card.trend}
                    </span>
                  </div>
                  <p className="text-xs font-normal leading-4 text-slate-400">
                    vs last month
                  </p>
                </div>
              </footer>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Chart Section */}
      <section className="w-full self-stretch">
        <Card className="w-full self-stretch rounded-2xl border border-slate-800 bg-[#182e21] shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="flex w-full flex-col gap-6 px-6 pt-6 pb-0">
            <header className="flex w-full items-start justify-between gap-4">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-lg font-bold leading-7 text-white">
                  Transaction Volume
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold leading-8 text-white">
                    $142,050
                  </p>
                  <p className="pl-2 text-sm font-medium leading-5 text-[#13ec5b]">
                    +8.5% this month
                  </p>
                </div>
              </div>
              <div className="inline-flex items-start rounded-lg bg-black/20 p-1">
                {(['30 Days', '7 Days', '24 Hours'] as const).map((option) => {
                  const isActive = chartRange === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setChartRange(option)}
                      className={`h-auto rounded px-3 py-1 text-center text-xs font-normal leading-4 transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white shadow-[0px_1px_2px_#0000000d]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </header>
            <div className="flex h-[264px] w-full flex-col items-start gap-2">
              <div className="h-60 w-full self-stretch relative">
                {/* Chart visualization */}
                <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#13ec5b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#13ec5b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,200 C50,180 100,150 150,160 C200,170 250,120 300,100 C350,80 400,90 450,70 C500,50 550,60 600,40 C650,20 700,30 800,50 L800,240 L0,240 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,200 C50,180 100,150 150,160 C200,170 250,120 300,100 C350,80 400,90 450,70 C500,50 550,60 600,40 C650,20 700,30 800,50"
                    fill="none"
                    stroke="#13ec5b"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex w-full items-start justify-between pl-2 pr-2">
                {chartLabels.map((label) => (
                  <span
                    key={label}
                    className="text-xs font-normal leading-4 text-slate-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="w-full">
        <Card className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#182e21] text-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-0">
            <header className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
              <h2 className="text-lg font-bold leading-7 text-white">
                Recent Activity
              </h2>
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-normal leading-5 text-[#13ec5b] no-underline hover:text-[#13ec5b]"
              >
                View All
              </Button>
            </header>
            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-5 min-w-[800px] border-b border-slate-800 bg-white/5">
                {['TRANSACTION ID', 'TYPE', 'DATE', 'STATUS', 'AMOUNT'].map((label, i) => (
                  <div
                    key={label}
                    className={`px-6 py-4 text-xs font-normal leading-4 tracking-[0.60px] text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                {activities.map((activity, index) => (
                  <article
                    key={activity.transactionId}
                    className={`grid grid-cols-5 min-w-[800px] items-center ${index !== 0 ? 'border-t border-slate-800' : ''}`}
                  >
                    <div className="px-6 py-4">
                      <p className="text-base font-medium leading-[22px] text-white">
                        {activity.transactionId}
                      </p>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-sm font-normal leading-5 text-slate-300">
                        {activity.type}
                      </p>
                    </div>
                    <div className="px-6 py-4">
                      <time className="text-sm font-normal leading-5 text-slate-400">
                        {activity.date}
                      </time>
                    </div>
                    <div className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium leading-4 border-0 ${activity.statusClassName}`}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="px-6 py-4 text-right">
                      <p className="text-base font-bold leading-[22px] text-white">
                        {activity.amount}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardContent className="flex items-center justify-center px-0 pb-0 pt-2">
          <footer className="w-full">
            <p className="text-center text-xs leading-4 text-slate-400">
              © 2024 AFRAMP. All rights reserved.{' '}
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-slate-500"
              >
                Terms
              </button>{' '}
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-slate-500"
              >
                Privacy
              </button>
            </p>
          </footer>
        </CardContent>
      </Card>
    </main>
  );
}
