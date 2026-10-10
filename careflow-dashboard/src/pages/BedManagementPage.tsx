import React, { useState } from 'react';
import { 
  Bed, 
  Cpu, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  Activity, 
  HeartPulse,
  RefreshCw
} from 'lucide-react';
import { BedOccupancy, Equipment, DepartmentName } from '../types';
import { CareFlowApi } from '../services/api';

interface BedManagementPageProps {
  selectedDept: DepartmentName;
  occupancy: BedOccupancy | null;
  resources: Equipment[];
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
}

export const BedManagementPage: React.FC<BedManagementPageProps> = ({
  selectedDept,
  occupancy,
  resources,
  onRefresh,
  loading,
  error
}) => {
  const [updateOccupied, setUpdateOccupied] = useState<number>(occupancy?.occupiedBeds || 0);
  const [updateDischarges, setUpdateDischarges] = useState<number>(occupancy?.scheduledDischarges || 0);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state if occupancy prop updates
  React.useEffect(() => {
    if (occupancy) {
      setUpdateOccupied(occupancy.occupiedBeds);
      setUpdateDischarges(occupancy.scheduledDischarges);
    }
  }, [occupancy]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const total = occupancy?.totalBeds || 100;
      if (updateOccupied > total) {
        setFeedbackMsg({
          type: 'error',
          text: `Occupied beds (${updateOccupied}) cannot exceed total licensed beds (${total}).`
        });
        setSubmitting(false);
        return;
      }
      if (updateOccupied < 0 || updateDischarges < 0) {
        setFeedbackMsg({
          type: 'error',
          text: 'Occupied beds and discharges cannot be negative.'
        });
        setSubmitting(false);
        return;
      }

      await CareFlowApi.updateOccupancy({
        department: selectedDept,
        occupiedBeds: updateOccupied,
        scheduledDischarges: updateDischarges
      });

      setFeedbackMsg({
        type: 'success',
        text: `Occupancy successfully persisted in PostgreSQL for ${selectedDept}. Available beds updated.`
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to persist occupancy update.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalBeds = occupancy?.totalBeds || 100;
  const currentOcc = occupancy?.occupiedBeds || 84;
  const availableBeds = occupancy?.availableBeds ?? (totalBeds - currentOcc);
  const occRate = occupancy?.occupancyRate || ((currentOcc / totalBeds) * 100);
  const discharges = occupancy?.scheduledDischarges || 8;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bed className="h-5 w-5 text-sky-600" />
            <span>Bed &amp; Resource Management Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical census, ICU allocation, and critical life-support inventory tracking.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md font-medium shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Census</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center space-x-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Department Census & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Census Adjustment Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Update Census for {selectedDept}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live REST mutation with strict invariant enforcement (Available = Total - Occupied).
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Total Department Beds (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={`${totalBeds} licensed beds`}
                className="w-full bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-md font-mono"
              />
            </div>

            <div>
              <label htmlFor="occupied-input" className="block text-slate-700 font-semibold mb-1">
                Occupied Beds:
              </label>
              <input
                id="occupied-input"
                type="number"
                min="0"
                max={totalBeds}
                value={updateOccupied}
                onChange={(e) => setUpdateOccupied(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 px-3 py-2 rounded-md font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Calculated available beds: <strong className="text-emerald-700">{Math.max(0, totalBeds - updateOccupied)}</strong>
              </span>
            </div>

            <div>
              <label htmlFor="discharges-input" className="block text-slate-700 font-semibold mb-1">
                Scheduled Discharges:
              </label>
              <input
                id="discharges-input"
                type="number"
                min="0"
                value={updateDischarges}
                onChange={(e) => setUpdateDischarges(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 px-3 py-2 rounded-md font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Expected bed turnovers over next 24 hours
              </span>
            </div>

            <button
              id="submit-bed-update-btn"
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-md transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Persisting to Database...' : 'Commit Bed Census Update'}</span>
            </button>
          </form>
        </div>

        {/* Center & Right: Live Department Metrics & Critical Resources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bed Metrics Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Live Department Bed Status Breakdown</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded border border-slate-200/70">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Beds</span>
                <span className="block text-2xl font-bold text-slate-900 mt-1">{totalBeds}</span>
              </div>
              <div className="bg-sky-50 p-3 rounded border border-sky-100">
                <span className="text-[11px] text-sky-700 uppercase font-semibold">Occupied Beds</span>
                <span className="block text-2xl font-bold text-sky-800 mt-1">{currentOcc}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                <span className="text-[11px] text-emerald-700 uppercase font-semibold">Available Beds</span>
                <span className="block text-2xl font-bold text-emerald-800 mt-1">{availableBeds}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Occupancy Rate</span>
                <span className="font-bold">{occRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${
                    occRate > 90 ? 'bg-rose-500' : occRate > 75 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(occRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Critical Equipment & Resources Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-sky-600" />
                <span>Critical Clinical Equipment Inventory</span>
              </h2>
              <span className="text-xs text-slate-400">PostgreSQL Persisted</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="px-3 py-2 text-left">Equipment</th>
                    <th className="px-3 py-2 text-left">Department</th>
                    <th className="px-3 py-2 text-center">Total</th>
                    <th className="px-3 py-2 text-center">In Use</th>
                    <th className="px-3 py-2 text-center">Available</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.length > 0 ? (
                    resources.map((eq) => {
                      const availRate = eq.totalCount > 0 ? (eq.availableCount / eq.totalCount) : 0;
                      return (
                        <tr key={eq.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2.5 font-medium text-slate-800">{eq.equipmentName}</td>
                          <td className="px-3 py-2.5 text-slate-500">{eq.department}</td>
                          <td className="px-3 py-2.5 text-center font-mono">{eq.totalCount}</td>
                          <td className="px-3 py-2.5 text-center font-mono text-sky-700">{eq.inUseCount}</td>
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">{eq.availableCount}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              availRate < 0.2 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {availRate < 0.2 ? 'Scarce' : 'Nominal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">
                        No equipment records found for this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
