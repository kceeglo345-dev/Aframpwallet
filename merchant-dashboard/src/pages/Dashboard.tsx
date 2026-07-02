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
import PageTemplate, { PageCard } from '../templates/PageTemplate';
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

  return (
    <PageTemplate
      title="Dashboard"
      subtitle="Overview of your payment activity and performance"
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Volume" value={stats.total_volume_usd} icon="💰" color="blue" />
          <StatsCard title="Transactions" value={stats.transaction_count.toString()} icon="📊" color="green" />
          <StatsCard title="Average" value={stats.average_transaction} icon="📈" color="purple" />
          <StatsCard title="Active Days" value={stats.daily_volume.length.toString()} icon="📅" color="orange" />
        </div>

        <PageCard title="Daily Volume" subtitle="Payment volume over the last 30 days">
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </PageCard>

        <PageCard
          title="Recent Transactions"
          headerAction={
            <NavLink to="/transactions" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View All →
            </NavLink>
          }
        >
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
                {stats.recent_payments.slice(0, 5).map((payment) => (
                  <tr key={payment.tx_hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(payment.datetime)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.amount_usd}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.customer_id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      </div>
    </PageTemplate>
  );
}
