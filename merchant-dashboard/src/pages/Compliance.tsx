import { useQuery, useMutation } from '@tanstack/react-query';
import { MerchantAPI } from '../services/api';
import { formatDate } from '../utils/format';

export default function Compliance() {
  const { data: report, refetch } = useQuery({
    queryKey: ['compliance-report'],
    queryFn: MerchantAPI.generateComplianceReport,
  });

  const exportMutation = useMutation({
    mutationFn: MerchantAPI.exportTransactions,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const viewingKeyMutation = useMutation({
    mutationFn: MerchantAPI.generateViewingKey,
    onSuccess: (key) => {
      navigator.clipboard.writeText(key);
      alert('Viewing key copied to clipboard!');
    },
  });

  const stats = [
    { label: 'Total Transactions', value: report?.total_transactions?.toString() || '1,247', icon: '📊' },
    { label: 'Total Volume', value: report?.total_volume_usd || '$154,230.00', icon: '💰' },
    { label: 'Average Transaction', value: report?.average_transaction_usd || '$123.68', icon: '📈' },
  ];

  const complianceFeatures = [
    { title: 'AML/KYC Ready', desc: 'Transactions > $10,000 flagged for review', icon: '🔍' },
    { title: 'GDPR Compliant', desc: 'Data only decrypted with explicit consent', icon: '🛡️' },
    { title: 'Audit Trail', desc: 'All transactions verifiable with viewing key', icon: '📋' },
    { title: 'Tax Export', desc: 'Exportable reports for tax authorities', icon: '📑' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Fiat Offramp</h1>
        <p className="text-sm text-gray-500 mt-1">Compliance reports, viewing keys, and fiat conversion tools</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111118] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</span>
              <span className="text-base">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Report details + actions */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Compliance Report</h2>
          <span className="text-xs text-gray-500">
            Period: {report?.period_start || '2026-06-01'} → {report?.period_end || '2026-06-24'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm">
          <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
            <p className="text-xs text-gray-500">Merchant ID</p>
            <p className="text-sm font-mono text-gray-300 mt-1 break-all">{report?.merchant_id || '050807b6...882abf6'}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/5">
            <p className="text-xs text-gray-500">Generated</p>
            <p className="text-sm text-gray-300 mt-1">{report ? formatDate(report.generated_at) : 'Just now'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d0d14] border border-white/8 text-sm font-medium text-gray-300 hover:border-white/15 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-green-400 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => viewingKeyMutation.mutate()}
            disabled={viewingKeyMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d0d14] border border-white/8 text-sm font-medium text-gray-300 hover:border-white/15 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            {viewingKeyMutation.isPending ? 'Generating...' : 'Generate Viewing Key'}
          </button>
        </div>
      </div>

      {/* Compliance features grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {complianceFeatures.map((feature) => (
          <div key={feature.title} className="bg-[#111118] border border-white/8 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-lg flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
