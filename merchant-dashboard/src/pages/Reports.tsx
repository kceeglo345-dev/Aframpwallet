import { useState } from 'react';

export default function Reports() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [, setSelectedReport] = useState<string | null>(null);

  const reportStats = [
    { label: 'Total Reports', value: '24', change: '+12%', positive: true, icon: '📊' },
    { label: 'Generated Today', value: '5', change: '+2', positive: true, icon: '📈' },
    { label: 'Pending', value: '3', change: '', positive: true, icon: '⏳' },
    { label: 'Failed', value: '1', change: '-1', positive: false, icon: '❌' },
  ];

  const recentReports = [
    { id: '1', name: 'Monthly Revenue Report', date: '2024-06-27', size: '2.4 MB', status: 'ready' },
    { id: '2', name: 'Compliance Summary', date: '2024-06-26', size: '1.8 MB', status: 'ready' },
    { id: '3', name: 'Transaction Analysis', date: '2024-06-25', size: 'Processing...', status: 'processing' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Distribution</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage detailed business reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2ed42b] hover:bg-[#22b020] transition-colors text-sm font-bold text-black cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportStats.map((stat) => (
          <div key={stat.label} className="bg-[#111118] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</span>
              <span className="text-base">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.change && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`text-xs font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.positive ? '↑' : '↓'} {stat.change}
                </span>
                <span className="text-xs text-gray-600">vs last week</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report List */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Recent Reports</h2>
        {recentReports.length > 0 ? (
          <div className="space-y-2">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0d0d14] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2ed42b]/10 border border-[#2ed42b]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2ed42b]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{report.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{report.date} · {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {report.status === 'ready' ? (
                    <>
                      <button className="text-xs font-medium text-[#2ed42b] hover:text-[#22b020] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2ed42b]/10 cursor-pointer">
                        Download
                      </button>
                      <button
                        onClick={() => { setSelectedReport(report.id); setShowDeleteConfirm(true); }}
                        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      Processing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#0d0d14] border border-white/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No reports generated yet</h3>
            <p className="text-xs text-gray-500">Create your first report to get started</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Report Settings</h2>
        <div className="space-y-3">
          {[
            { label: 'Include transaction details', desc: 'Show individual payment records', checked: true },
            { label: 'Include compliance information', desc: 'Add viewing key audit trail', checked: true },
            { label: 'Email notifications', desc: 'Get notified when reports are ready', checked: false },
          ].map((setting) => (
            <label key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d14] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
              <div>
                <p className="text-sm font-medium text-white">{setting.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
              </div>
              <div className={`relative w-10 h-6 rounded-full transition-colors ${setting.checked ? 'bg-[#2ed42b]' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${setting.checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 rounded-xl bg-[#2ed42b] text-black text-sm font-bold hover:bg-[#22b020] transition-colors cursor-pointer">
          Save Preferences
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white text-center mb-2">Delete Report?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone. The report will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedReport(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-400 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
