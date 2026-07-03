import { useQuery } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: MerchantAPI.getDashboardStats,
  });

  const stats = [
    { label: 'Total Volume', value: statsData?.total_volume_usd || '$12,432.00', change: '+12.5%', positive: true, icon: '💰' },
    { label: 'Transactions', value: String(statsData?.transaction_count ?? '847'), change: '+8.2%', positive: true, icon: '📊' },
    { label: 'Active Customers', value: '128', change: '+3.1%', positive: true, icon: '👥' },
    { label: 'Avg. Transaction', value: statsData?.average_transaction || '$14.68', change: '-2.4%', positive: false, icon: '📈' },
  ];

  const quickActions = [
    { label: 'New Distribution', desc: 'Send tokens to multiple recipients', href: '/distribution', icon: '📤' },
    { label: 'Create Stream', desc: 'Set up continuous payment', href: '/pay', icon: '⚡' },
    { label: 'Offramp to Fiat', desc: 'Convert crypto to local currency', href: '/compliance', icon: '🏦' },
    { label: 'View History', desc: 'Check transaction records', href: '/transactions', icon: '📋' },
  ];

  const recentActivity = [
    { action: 'Payment received', amount: '$42.00', time: '2 min ago', status: 'confirmed', customer: '0x4f...8a2c' },
    { action: 'Payment received', amount: '$156.00', time: '15 min ago', status: 'confirmed', customer: '0x9b...3e1d' },
    { action: 'Viewing key generated', amount: '', time: '1 hour ago', status: 'info', customer: '' },
    { action: 'Compliance report exported', amount: '', time: '3 hours ago', status: 'info', customer: '' },
    { action: 'Payment received', amount: '$89.50', time: '5 hours ago', status: 'confirmed', customer: '0x2c...7f4a' },
    { action: 'Payment received', amount: '$234.00', time: '8 hours ago', status: 'confirmed', customer: '0x8d...1b9e' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111118] border border-white/8 rounded-2xl p-5 hover:border-[#2ed42b]/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</span>
              <span className="text-base">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${stat.positive ? 'text-[#2ed42b]' : 'text-red-400'}`}>
                {stat.positive ? '↑' : '↓'} {stat.change}
              </span>
              <span className="text-xs text-gray-600">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group flex flex-col gap-2 p-4 rounded-xl bg-[#0d0d14] border border-white/5 hover:border-[#2ed42b]/25 hover:bg-[#2ed42b]/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{action.icon}</span>
                <svg className="w-4 h-4 text-gray-700 group-hover:text-[#2ed42b] transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#111118] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link to="/transactions" className="text-xs text-[#2ed42b] hover:text-[#22b020] font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0d0d14] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'confirmed' ? 'bg-[#2ed42b]' : 'bg-gray-600'}`} />
                  <div>
                    <span className="text-sm text-gray-300">{item.action}</span>
                    {item.customer && (
                      <span className="text-xs text-gray-600 ml-2 font-mono">{item.customer}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.amount && (
                    <span className="text-sm font-semibold text-white">{item.amount}</span>
                  )}
                  <span className="text-xs text-gray-600">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Status */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Privacy Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#2ed42b]/8 border border-[#2ed42b]/15">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#2ed42b]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-sm text-[#2ed42b] font-medium">ZK Proofs Active</span>
              </div>
              <span className="text-xs text-[#2ed42b]">100%</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Proofs Generated', value: '847', total: '1000' },
                { label: 'Nullifiers Used', value: '847', total: '847' },
                { label: 'Viewing Keys', value: '3', total: '5' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{item.value}/{item.total}</span>
                  </div>
                  <div className="h-1.5 bg-[#0d0d14] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2ed42b] to-[#2ed42b] rounded-full"
                      style={{ width: `${(parseInt(item.value) / parseInt(item.total)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Contract</span>
                <span className="text-gray-400 font-mono">CA23...MP2Y</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">Network</span>
                <span className="text-gray-400">Stellar Testnet</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">Settlement</span>
                <span className="text-[#2ed42b]">3-5s avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
