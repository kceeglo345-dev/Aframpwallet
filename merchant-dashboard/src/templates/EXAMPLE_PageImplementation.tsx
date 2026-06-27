/**
 * EXAMPLE: How to Use the PageTemplate
 * ────────────────────────────────────
 *
 * This file shows practical examples of using PageTemplate and its companion
 * components (PageCard, StatsGrid, EmptyState, ConfirmationModal).
 *
 * Copy this pattern when creating new pages for the Aframp dashboard.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTemplate, { PageCard, StatsGrid, EmptyState, ConfirmationModal, type StatItem } from './PageTemplate';
import { MerchantAPI } from '../services/api';

/**
 * Example 1: Simple Page with Loading & Error States
 * ────────────────────────────────────────────────
 * This demonstrates the most basic usage with loading and error handling.
 */
export function ExampleSimplePage() {
  const { isLoading, error } = useQuery({
    queryKey: ['example-data'],
    queryFn: () => MerchantAPI.getDashboardStats(),
  });

  return (
    <PageTemplate
      title="Example Simple Page"
      subtitle="This page demonstrates basic template usage with data fetching"
      icon="📄"
      isLoading={isLoading}
      error={error}
    >
      <PageCard title="Your Content Here">
        <p className="text-gray-600">
          Replace this content with your own. The template handles loading and error states automatically.
        </p>
      </PageCard>
    </PageTemplate>
  );
}

/**
 * Example 2: Page with Stats Dashboard
 * ────────────────────────────────────
 * Shows how to display key metrics using StatsGrid.
 */
export function ExampleStatsPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => MerchantAPI.getDashboardStats(),
  });

  const statItems: StatItem[] = stats
    ? [
        {
          label: 'Total Volume',
          value: typeof stats.total_volume_usd === 'string' ? stats.total_volume_usd : `$${Number(stats.total_volume_usd).toFixed(2)}`,
          icon: '💰',
          color: 'blue' as const,
          trend: { value: 12, isPositive: true },
        },
        {
          label: 'Transactions',
          value: stats.transaction_count,
          icon: '📊',
          color: 'green' as const,
          trend: { value: 8, isPositive: true },
        },
        {
          label: 'Average Transaction',
          value: typeof stats.average_transaction === 'string' ? stats.average_transaction : `$${Number(stats.average_transaction).toFixed(2)}`,
          icon: '📈',
          color: 'purple' as const,
        },
        {
          label: 'Active Days',
          value: stats.daily_volume.length,
          icon: '📅',
          color: 'orange' as const,
        },
      ]
    : [];

  return (
    <PageTemplate
      title="Analytics Dashboard"
      subtitle="Monitor your payment metrics"
      icon="📊"
      isLoading={isLoading}
      error={error}
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Analytics' },
      ]}
    >
      <StatsGrid stats={statItems} />

      <PageCard title="Recent Activity" subtitle="Last 5 transactions">
        {stats && stats.recent_payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-600">Customer</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recent_payments.slice(0, 5).map((payment) => (
                  <tr key={payment.tx_hash} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(payment.datetime).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{payment.amount_usd}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.customer_id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
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
            icon="📭"
            title="No transactions yet"
            description="Start accepting payments to see them here"
          />
        )}
      </PageCard>
    </PageTemplate>
  );
}

/**
 * Example 3: Page with Actions and Modals
 * ──────────────────────────────────────
 * Demonstrates header actions and confirmation modals.
 */
export function ExampleActionsPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowConfirmModal(false);
      alert('Item deleted successfully');
    } finally {
      setIsDeleting(false);
    }
  };

  const actions = (
    <div className="flex space-x-3">
      <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
        Export
      </button>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
      >
        Delete
      </button>
    </div>
  );

  return (
    <PageTemplate
      title="Settings"
      subtitle="Manage your merchant configuration"
      icon="⚙️"
      actions={actions}
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Settings' },
      ]}
    >
      <PageCard title="Merchant Information">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Merchant ID</p>
            <p className="mt-1 font-medium text-gray-900">demo_001</p>
          </div>
          <div>
            <p className="text-gray-500">Network</p>
            <p className="mt-1 font-medium text-gray-900">Stellar Testnet</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="mt-1 font-medium text-green-600">Active ✓</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="mt-1 font-medium text-gray-900">Jan 15, 2024</p>
          </div>
        </div>
      </PageCard>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Delete Merchant Account"
        description="This action cannot be undone. All transaction history and configurations will be permanently deleted."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </PageTemplate>
  );
}

/**
 * Example 4: Page with Multiple Sections
 * ───────────────────────────────────────
 * Shows how to organize complex pages with multiple card sections.
 */
export function ExampleComplexPage() {
  return (
    <PageTemplate
      title="Privacy Settings"
      subtitle="Configure how your payment data is handled"
      icon="🔒"
    >
      <div className="space-y-6">
        <PageCard title="Privacy Preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Zero-Knowledge Proofs</p>
                <p className="text-sm text-gray-500 mt-1">Always hide payment amounts on-chain</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Nullifier Tracking</p>
                <p className="text-sm text-gray-500 mt-1">Prevent double-spending (required)</p>
              </div>
              <input type="checkbox" defaultChecked disabled className="w-4 h-4" />
            </div>
          </div>
        </PageCard>

        <PageCard title="Compliance & Disclosure">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selective disclosure allows you to share transaction details with auditors when needed.
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors">
                Generate Audit Key
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                View Previous Keys
              </button>
            </div>
          </div>
        </PageCard>

        <PageCard title="Data Export">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Download your transaction history or configuration.</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors">
                📥 Export Transactions
              </button>
              <button className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors">
                🔑 Export Keys
              </button>
            </div>
          </div>
        </PageCard>
      </div>
    </PageTemplate>
  );
}

/**
 * Integration Tips
 * ────────────────
 * 1. Import PageTemplate in your new page: `import PageTemplate, { PageCard, StatsGrid } from '@/templates/PageTemplate'`
 * 2. Wrap your content with PageTemplate
 * 3. Use PageCard for card sections with titles and headers
 * 4. Use StatsGrid for displaying metrics
 * 5. Use EmptyState for when there's no data
 * 6. Use ConfirmationModal for destructive actions
 * 7. Let the template handle isLoading and error states automatically
 * 8. Add breadcrumb prop for multi-level navigation
 * 9. Use the actions prop for header buttons
 * 10. Keep component styling consistent using the provided sub-components
 */
