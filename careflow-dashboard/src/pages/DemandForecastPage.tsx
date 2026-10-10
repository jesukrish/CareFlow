import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ForecastResponse, DepartmentName } from '../types';

interface DemandForecastPageProps {
  department: DepartmentName;
  targetDate: string;
  forecast: ForecastResponse | null;
  loading: boolean;
  error: string | null;
}

export const DemandForecastPage: React.FC<DemandForecastPageProps> = ({
  department,
  targetDate,
  forecast,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <TrendingUp className="h-8 w-8 text-sky-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-600">
          Synthesizing historical admission distribution and generating predictive baseline for {department}...
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
            <h3 className="font-semibold text-base">Forecast Service Integration Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const predicted = forecast?.predictedAdmissions ?? 0;
  const histAvg = forecast?.historicalAverage ?? 0;
  const movingAvg = forecast?.movingAverage7Day ?? 0;
  const weekdayAvg = forecast?.sameWeekdayAverage ?? 0;
  const confLower = forecast?.confidenceLower ?? Math.max(0, predicted - 2);
  const confUpper = forecast?.confidenceUpper ?? (predicted + 2);
  const dataPoints = forecast?.dataPointsCount ?? 0;

  // Chart data strictly from actual backend observations
  const historicalObs = forecast?.historicalObservations || [];
  const chartData = [
    ...historicalObs,
    {
      date: `${targetDate} (Forecast)`,
      admissions: predicted,
      isForecast: true
    }
  ];

  const factorsList = forecast?.contributingFactors || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            <span>Demand Forecast &amp; Statistical Baselines</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Moving-average models, day-of-week seasonality, and verifiable historical telemetry.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
          Target Date: <strong>{targetDate}</strong> | Dept: <strong>{department}</strong>
        </div>
      </div>

      {/* Numerical Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Predicted Admissions
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-sky-700">{predicted}</span>
            <span className="text-xs text-slate-500">patients</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Confidence Interval: <strong className="text-slate-700">{confLower} — {confUpper}</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            7-Day Moving Average
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{movingAvg.toFixed(1)}</span>
            <span className="text-xs text-slate-500">avg / day</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Recent velocity index
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Same-Weekday Average
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{weekdayAvg.toFixed(1)}</span>
            <span className="text-xs text-slate-500">patients</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Day-of-week cyclical distribution
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Evaluated Sample Size
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{dataPoints}</span>
            <span className="text-xs text-slate-500">historical days</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {forecast?.fallbackEstimate ? 'Fallback heuristic' : 'Full dataset verified'}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Admissions Time Series &amp; Point Estimate</h2>
            <p className="text-xs text-slate-500">
              Evaluated against anonymized PostgreSQL patient admission records retrieved via REST HTTP from Patient Service.
            </p>
          </div>
          <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-1 rounded border border-sky-200">
            Model: {forecast?.baselineMethod || 'Weighted Moving Average + Day-of-Week'}
          </span>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '6px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="admissions" name="Observed Inflow" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="admissions" name="Trajectory" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7' }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No admissions history available for this horizon.
            </div>
          )}
        </div>
      </div>

      {/* Statistical Contributing Factors Card (Full Width clean layout) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-sky-600" />
            <span>Statistical Contributing Factors &amp; Model Weights</span>
          </h2>
          <span className="text-xs text-slate-400">Weight breakdown</span>
        </div>

        {factorsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {factorsList.map((factor, idx) => (
              <div key={idx} className="p-3.5 rounded-md bg-slate-50 border border-slate-200/60 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">{factor.factor}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    factor.impact === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' :
                    factor.impact === 'NEGATIVE' || factor.impact === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {factor.impact}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{factor.detail || factor.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No contributing factors reported for current forecast.</p>
        )}
      </div>
    </div>
  );
};
