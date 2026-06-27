import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import PageTemplate, { PageCard, EmptyState } from '../templates/PageTemplate';
import { formatDate, truncateHash } from '../utils/format';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: MerchantAPI.getDashboardStats,
  });

  const filteredPayments = stats?.recent_payments.filter(
    (payment) =>
      payment.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tx_hash.includes(searchTerm)
  );

  const handleExport = () => {
    console.log('Export CSV functionality');
    // TODO: Implement CSV export
  };

  return (
    <PageTemplate
      title="Transactions"
      subtitle="View and manage all your payment transactions"
      isLoading={isLoading}
      error={error}
      actions={
        <button
          onClick={handleExport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition cursor-pointer"
        >
          Export CSV
        </button>
      }
    >
      <PageCard
        title="Transaction History"
        headerAction={
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        }
      >
        {filteredPayments && filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.tx_hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{truncateHash(payment.tx_hash)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(payment.datetime)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.amount_usd}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.customer_id}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transactions found"
            description={
              searchTerm
                ? 'Try adjusting your search filters'
                : 'You don&apos;t have any transactions yet'
            }
          />
        )}
      </PageCard>
    </PageTemplate>
  );
}
