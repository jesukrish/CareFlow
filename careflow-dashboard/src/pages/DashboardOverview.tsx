import React from 'react';
import { 
  Bed, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  Activity,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { CapacityResponse, ForecastResponse, BedOccupancy, SurgeAlert } from '../types';

interface DashboardOverviewProps {
  department: string;
  targetDate: string;
  forecast: ForecastResponse | null;
  capacity: CapacityResponse | null;
  occupancy: BedOccupancy | null;
  alerts: SurgeAlert[];
  loading: boolean;
  error: string | null;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  department,
  targetDate,
  forecast,
  capacity,
  occupancy,
  alerts,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Activity className="h-8 w-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Retrieving real-time telemetry and capacity metrics for {department}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 my-4 text-rose-800">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-base">Service Communication Notice</h3>
            <p className="text-sm mt-1 text-rose-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalBeds = occupancy?.totalBeds || capacity?.totalCapacity || 0;
  const currentOcc = occupancy?.occupiedBeds || capacity?.currentOccupancy || 0;
  const availableBeds = occupancy?.availableBeds ?? Math.max(0, totalBeds - currentOcc);
  const occRate = occupancy?.occupancyRate || (totalBeds > 0 ? (currentOcc / totalBeds) * 100 : 0);
  const predicted = forecast?.predictedAdmissions ?? capacity?.predictedAdmissions ?? 0;
  const discharges = occupancy?.scheduledDischarges ?? capacity?.expectedDischarges ?? 0;
  const projectedOcc = capacity?.projectedOccupancy ?? (currentOcc + predicted - discharges);
  const projectedRate = totalBeds > 0 ? (projectedOcc / totalBeds) * 100 : 0;
  const shortage = capacity?.bedShortage ?? (projectedOcc > totalBeds ? projectedOcc - totalBeds : 0);
  const riskLevel = capacity?.surgeRiskLevel || (projectedRate >= 95 ? 'CRITICAL' : projectedRate >= 85 ? 'HIGH' : projectedRate >= 70 ? 'MODERATE' : 'LOW');

  const riskBadgeStyles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  // Chart data strictly from real backend observations
  const historicalObs = forecast?.historicalObservations || [];
  const chartData = [
    ...historicalObs,
    {
      date: `${targetDate} (Forecast)`,
      admissions: predicted,
      isForecast: true
    }
  ];

  const factorsList = capacity?.factors || forecast?.contributingFactors || [];
  const operationalActionsList = capacity?.operationalActions || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Operations &amp; Capacity Overview</span>
            <span className="text-sm font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
              {department}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time occupancy tracking, 24h predictive horizon, and automated staffing models.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0 text-xs text-slate-600 font-mono">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Horizon Date: <strong className="text-slate-800">{targetDate}</strong></span>
        </div>
      </div>

      {/* Critical Surge Warning Banner if Shortage Detected */}
      {shortage > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                CRITICAL CAPACITY WARNING: Projected Shortage of {shortage} Bed{shortage > 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-rose-700 mt-1">
                Projected demand ({projectedOcc} beds) exceeds total physical bed capacity ({totalBeds} beds).
                Immediate operational diversion or accelerated discharge authorization recommended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Current Occupancy */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Occupancy</span>
            <div className="p-1.5 bg-slate-100 rounded text-slate-600">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{currentOcc}</span>
            <span className="text-xs text-slate-500">/ {totalBeds} beds</span>
          </div>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Utilization</span>
              <span className="font-semibold">{occRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${occRate > 90 ? 'bg-rose-500' : occRate > 75 ? 'bg-amber-500' : 'bg-sky-500'}`}
                style={{ width: `${Math.min(occRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Predicted Admissions */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Forecasted Admissions</span>
            <div className="p-1.5 bg-sky-50 rounded text-sky-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-sky-700">+{predicted}</span>
            <span className="text-xs text-slate-500">admissions</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Method:</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
              {forecast?.baselineMethod || 'Weighted Moving Avg'}
            </span>
          </div>
        </div>

        {/* KPI 3: Available Beds & Discharges */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Capacity</span>
            <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-700">{availableBeds}</span>
            <span className="text-xs text-slate-500">open beds</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Scheduled Discharges:</span>
            <span className="font-semibold text-emerald-600">+{discharges}</span>
          </div>
        </div>

        {/* KPI 4: Surge Risk Index */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surge Risk Level</span>
            <div className="p-1.5 bg-rose-50 rounded text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-xl font-extrabold px-2 py-0.5 rounded border ${riskBadgeStyles[riskLevel]}`}>
              {riskLevel}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Projected Rate:</span>
            <span className="font-semibold text-slate-800">{projectedRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Mathematical Consistency Formula Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-3.5 shadow-sm text-xs flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-200">Mathematical Capacity Model:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-slate-300">
          <span>Current ({currentOcc})</span>
          <span className="text-sky-400">+</span>
          <span>Forecast (+{predicted})</span>
          <span className="text-emerald-400">-</span>
          <span>Discharges (-{discharges})</span>
          <span className="text-slate-400">=</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold border border-slate-700">
            Projected Occupancy: {projectedOcc} Beds
          </span>
          <span className="text-slate-400">|</span>
          <span className={`${shortage > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
            {shortage > 0 ? `Shortage: -${shortage} Beds` : `Buffer: +${Math.max(0, totalBeds - projectedOcc)} Beds`}
          </span>
        </div>
      </div>

      {/* Main Grid: Chart & Operational Actions (2 cols left, 1 col right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Historical vs Forecast Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Historical Admissions vs. Target Forecast</h2>
                <p className="text-xs text-slate-500">
                  Moving average baseline combined with weekday seasonal distribution.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" />
                  <span className="text-slate-600">Historical</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600 inline-block" />
                  <span className="text-slate-600">Forecast</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '6px', 
                        border: 'none', 
                        color: '#fff',
                        fontSize: '12px' 
                      }} 
                    />
                    <Bar 
                      dataKey="admissions" 
                      name="Admissions" 
                      fill="#38bdf8" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="admissions" 
                      name="Trend" 
                      stroke="#0284c7" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#0284c7' }} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No historical records available for {department}.
                </div>
              )}
            </div>
          </div>

          {/* Actionable Capacity & Staffing Recommendations */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-sky-600" />
                <span>Operational Actions &amp; Staffing Schedule</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                Workload Ratio: {capacity?.staffingRecommendation?.patientNurseRatio || '1:4'}
              </span>
            </div>

            {/* Staffing adjustment numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-500 block">Required Nurses:</span>
                <span className="font-bold text-slate-800 text-base">
                  {capacity?.staffingRecommendation?.recommendedStaff || Math.ceil(projectedOcc / 4)} staff
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Duty Physicians:</span>
                <span className="font-bold text-slate-800 text-base">
                  {Math.ceil(projectedOcc / 15)} on shift
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">Adjustment:</span>
                <span className="font-semibold text-sky-800">
                  {capacity?.staffingRecommendation?.rationale || 'Standard shift allocation based on 1:4 ratio'}
                </span>
              </div>
            </div>

            {/* Specific Protocol Actions */}
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                Operational Protocols:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {operationalActionsList.length > 0 ? (
                  operationalActionsList.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">Standard ward operational procedures in effect.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Contributing Factors & Active Alerts */}
        <div className="space-y-6">
          {/* Contributing Factors Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Contributing Factors &amp; Data Provenance
            </h3>
            {factorsList.length > 0 ? (
              <div className="space-y-2.5">
                {factorsList.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{factor.factor}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        factor.impact === 'HIGH' || factor.impact === 'NEGATIVE' 
                          ? 'bg-rose-100 text-rose-800' 
                          : factor.impact === 'POSITIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{factor.detail || factor.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No contributing factors reported for current horizon.</p>
            )}
          </div>

          {/* Active Surge Alerts Quick Widget */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Department Alerts</span>
              </h3>
              <span className="text-[11px] text-slate-400">{alerts.length} total</span>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active surge alerts reported.</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="text-xs p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="flex justify-between font-semibold">
                      <span>{alert.alertType}</span>
                      <span className="text-[10px] text-amber-700">{alert.severity}</span>
                    </div>
                    <p className="text-[11px] mt-0.5 text-amber-800">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
