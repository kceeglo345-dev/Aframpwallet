import { useState } from 'react';
import PageTemplate, { PageCard, StatsGrid, ConfirmationModal, EmptyState, type StatItem } from '../templates/PageTemplate';

export default function Reports() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const reportStats: StatItem[] = [
    {
      label: 'Total Reports',
      value: '24',
      icon: '📊',
      trend: { value: 12, isPositive: true },
      color: 'blue',
    },
    {
      label: 'Generated Today',
      value: '5',
      icon: '📈',
      color: 'green',
    },
    {
      label: 'Pending',
      value: '3',
      icon: '⏳',
      color: 'orange',
    },
    {
      label: 'Failed',
      value: '1',
      icon: '❌',
      color: 'red',
    },
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Revenue Report',
      date: '2024-06-27',
      size: '2.4 MB',
      status: 'ready',
    },
    {
      id: '2',
      name: 'Compliance Summary',
      date: '2024-06-26',
      size: '1.8 MB',
      status: 'ready',
    },
    {
      id: '3',
      name: 'Transaction Analysis',
      date: '2024-06-25',
      size: 'Processing...',
      status: 'processing',
    },
  ];

  const handleDeleteReport = () => {
    setShowDeleteConfirm(false);
    console.log('Report deleted');
  };

  return (
    <PageTemplate
      title="Reports"
      subtitle="Generate and download detailed business reports"
      actions={
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
          Generate Report
        </button>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <StatsGrid stats={reportStats} />

        {/* Report List */}
        <PageCard title="Recent Reports" subtitle="Your generated reports are listed below">
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📄</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{report.size}</span>
                    {report.status === 'ready' && (
                      <>
                        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">Download</button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {report.status === 'processing' && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📊"
              title="No reports generated yet"
              description="Create your first report to get started with insights about your business"
              action={{
                label: 'Generate Report',
                onClick: () => console.log('Generate report clicked'),
              }}
            />
          )}
        </PageCard>

        {/* Configuration */}
        <PageCard title="Report Settings" subtitle="Customize your default report preferences">
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-900">Include transaction details</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-900">Include compliance information</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-900">Send email notifications when reports are ready</span>
            </label>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
              Save Preferences
            </button>
          </div>
        </PageCard>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Report?"
        description="This action cannot be undone. The report will be permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        onConfirm={handleDeleteReport}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </PageTemplate>
  );
}
