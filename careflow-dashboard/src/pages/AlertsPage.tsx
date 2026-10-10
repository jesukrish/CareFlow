import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  BellRing, 
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';
import { SurgeAlert, DepartmentName } from '../types';

interface AlertsPageProps {
  alerts: SurgeAlert[];
  selectedDept: DepartmentName;
  onRefresh: () => void;
  loading: boolean;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  selectedDept,
  onRefresh,
  loading
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [filterByDept, setFilterByDept] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterByDept && alert.department !== selectedDept) return false;
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    return true;
  });

  const severityBadges: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
    WARNING: 'bg-amber-100 text-amber-800 border-amber-200',
    INFO: 'bg-sky-100 text-sky-800 border-sky-200'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Surge Alerts &amp; Operational Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold breaches, staffing shortages, and surge protocols recorded in PostgreSQL.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md font-medium shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Severity:</span>
          <div className="flex items-center space-x-1">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterByDept}
              onChange={(e) => setFilterByDept(e.target.checked)}
              className="rounded text-sky-600 focus:ring-0"
            />
            <span className="text-slate-700 font-medium">Show only for {selectedDept}</span>
          </label>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-700 text-sm">No Active Alerts In Current Filter</h3>
            <p className="text-xs text-slate-400 mt-1">
              All departments are operating within standard clinical capacity thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-start justify-between space-x-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-lg mt-0.5 ${
                  alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                  alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{alert.alertType}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBadges[alert.severity] || 'bg-slate-100'}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Dept: <strong className="text-slate-700">{alert.department}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 font-mono whitespace-nowrap">
                {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Recent'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
