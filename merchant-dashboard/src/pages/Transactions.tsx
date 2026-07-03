import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import { formatDate, truncateHash } from '../utils/format';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: MerchantAPI.getDashboardStats,
  });

  const allPayments = stats?.recent_payments || [];
  const filteredPayments = allPayments.filter((p) => {
    const matchesSearch =
      p.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tx_hash.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allPayments.length,
    completed: allPayments.filter(p => p.status === 'completed').length,
    pending: allPayments.filter(p => p.status === 'pending').length,
    failed: allPayments.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all your private payments</p>
        </div>
        <button
          onClick={() => MerchantAPI.exportTransactions()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 transition-colors text-sm font-semibold text-white cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2">
        {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
              statusFilter === status
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'bg-[#111118] text-gray-500 border border-white/8 hover:text-gray-300'
            }`}
          >
            {status} <span className="ml-1 opacity-60">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search by customer ID or transaction hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#111118] border border-white/8 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-500/30 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading transactions...</div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0d0d14] border-b border-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((payment) => (
                  <tr key={payment.tx_hash + payment.timestamp} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{truncateHash(payment.tx_hash || 'pending')}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(payment.datetime)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{payment.amount_usd}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{payment.customer_id.slice(0, 16)}...</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : payment.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payment.status === 'completed' ? 'bg-green-400' :
                          payment.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0d0d14] border border-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No transactions found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search filters' : 'You don\'t have any transactions yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
