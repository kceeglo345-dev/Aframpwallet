import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MerchantAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import { formatDate } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardStats {
  total_volume: number;
  total_volume_usd: string;
  transaction_count: number;
  average_transaction: string;
  balance: string;
  daily_volume: { date: string; volume: number; count: number }[];
  recent_payments: {
    tx_hash: string;
    amount: number;
    amount_usd: string;
    customer_id: string;
    timestamp: number;
    datetime: string;
    status: string;
  }[];
}

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: MerchantAPI.getDashboardStats as () => Promise<DashboardStats>,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading dashboard data
      </div>
    );
  }

  if (!stats) return null;

  const chartData = {
    labels: stats.daily_volume.length > 0
      ? stats.daily_volume.map((d) => d.date)
      : ['No data'],
    datasets: [
      {
        label: 'Daily Volume (USD)',
        data: stats.daily_volume.length > 0
          ? stats.daily_volume.map((d) => d.volume / 100)
          : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  const privateBalanceNote = (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start space-x-3">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <div>
        <p className="font-medium">Private Balance</p>
        <p className="text-amber-700 text-xs mt-1">Your balance is computed from decrypted payment notes. On-chain balance shows <strong>$0.00</strong> — only you can see the real amount.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Private Balance" value={stats.balance} icon="🔑" color="amber" />
        <StatsCard title="Total Volume" value={stats.total_volume_usd} icon="💰" color="blue" />
        <StatsCard title="Transactions" value={stats.transaction_count.toString()} icon="📊" color="green" />
        <StatsCard title="Average" value={stats.average_transaction} icon="📈" color="purple" />
      </div>

      {privateBalanceNote}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Volume</h2>
        <div className="h-64">
          {stats.daily_volume.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <p className="text-sm">Submit a payment to see volume data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <NavLink to="/transactions" className="text-blue-500 hover:text-blue-600 text-sm">
            View All →
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recent_payments.length > 0 ? (
                stats.recent_payments.slice(0, 5).map((payment, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(payment.datetime)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.amount_usd}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">{payment.customer_id.slice(0, 20)}...</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                    No payments yet. Submit a payment to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
