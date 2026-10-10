import React, { useState } from 'react';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Clock, 
  Info,
  Send
} from 'lucide-react';
import { TriageRequest, TriageResponse, DepartmentName } from '../types';
import { CareFlowApi } from '../services/api';

interface PatientTriagePageProps {
  selectedDept: DepartmentName;
}

const COMMON_SYMPTOMS = [
  'Severe chest pain radiating to left arm',
  'Acute respiratory distress / stridor',
  'Altered mental status / unresponsiveness',
  'Uncontrolled hemorrhage',
  'Acute neurological deficit / facial droop',
  'High fever with rigors (>39.5°C)',
  'Moderate localized abdominal pain',
  'Mild sprain / limb contusion'
];

export const PatientTriagePage: React.FC<PatientTriagePageProps> = ({ selectedDept }) => {
  const [formData, setFormData] = useState<TriageRequest>({
    patientIdentifier: '',
    age: 0,
    department: selectedDept,
    chiefComplaint: '',
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 75,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    bodyTemperature: 37.0,
    painLevel: 0,
    highRiskSymptoms: []
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSymptomToggle = (symptom: string) => {
    setFormData((prev) => {
      const exists = prev.highRiskSymptoms.includes(symptom);
      return {
        ...prev,
        highRiskSymptoms: exists
          ? prev.highRiskSymptoms.filter((s) => s !== symptom)
          : [...prev.highRiskSymptoms, symptom]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const symptomsList = formData.highRiskSymptoms.map(s => {
        if (s.includes('chest pain')) return 'chest pain';
        if (s.includes('respiratory distress')) return 'severe breathing difficulty';
        if (s.includes('mental status')) return 'unresponsive';
        if (s.includes('hemorrhage')) return 'severe hemorrhage';
        if (s.includes('fever')) return 'high fever';
        return s.toLowerCase();
      });

      const payload = {
        department: selectedDept,
        chiefComplaint: formData.chiefComplaint,
        symptoms: symptomsList.length > 0 ? symptomsList : ['general malaise'],
        vitalSigns: {
          heartRate: Number(formData.heartRate),
          systolicBp: Number(formData.systolicBP),
          diastolicBp: Number(formData.diastolicBP),
          oxygenSaturation: Number(formData.oxygenSaturation),
          respiratoryRate: Number(formData.respiratoryRate),
          temperature: Number(formData.bodyTemperature)
        }
      };

      const response = await CareFlowApi.submitTriage(payload as any);
      setResult(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error communicating with Triage Rules Engine.');
    } finally {
      setLoading(false);
    }
  };

  const priorityStyles: Record<number, { bg: string; text: string; border: string; badge: string }> = {
    1: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-400', badge: 'bg-rose-600 text-white' },
    2: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-400', badge: 'bg-orange-600 text-white' },
    3: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-400', badge: 'bg-amber-600 text-white' },
    4: { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-400', badge: 'bg-sky-600 text-white' },
    5: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-400', badge: 'bg-emerald-600 text-white' }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-sky-600" />
            <span>Explainable Patient Triage Decision Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent clinical rule engine inspired by ESI (Emergency Severity Index) algorithms.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
          Target Dept: <strong>{selectedDept}</strong>
        </span>
      </div>

      {/* Prominent Mandatory Clinical Disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md text-xs text-amber-900">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 mr-2.5 shrink-0" />
          <div>
            <strong className="font-semibold">DEMONSTRATION &amp; DECISION-SUPPORT PROTOTYPE ONLY:</strong>
            <span className="ml-1 text-amber-800">
              This rule engine is an architectural demonstration of explainable heuristic ranking.
              It is NOT a certified medical diagnostic device. Urgent and life-threatening symptoms are never down-ranked.
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout: Assessment Form & Decision Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Patient Vitals &amp; Symptoms Assessment</span>
            <span className="text-xs text-slate-400 font-mono">ID: {formData.patientIdentifier}</span>
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Top row: ID, Age, Chief Complaint */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  value={formData.patientIdentifier}
                  onChange={(e) => setFormData({ ...formData, patientIdentifier: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pain Scale (1–10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.painLevel}
                  onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chief Complaint</label>
              <input
                type="text"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
              />
            </div>

            {/* Vital Signs Grid */}
            <div className="pt-2">
              <span className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Physiological Vitals
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Systolic BP</span>
                  <input
                    type="number"
                    value={formData.systolicBP}
                    onChange={(e) => setFormData({ ...formData, systolicBP: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 mt-1"
                  />
                  <span className="text-[9px] text-slate-400">mmHg</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Diastolic BP</span>
                  <input
                    type="number"
                    value={formData.diastolicBP}
                    onChange={(e) => setFormData({ ...formData, diastolicBP: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 mt-1"
                  />
                  <span className="text-[9px] text-slate-400">mmHg</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 mt-1"
                  />
                  <span className="text-[9px] text-slate-400">bpm</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Resp. Rate</span>
                  <input
                    type="number"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 mt-1"
                  />
                  <span className="text-[9px] text-slate-400">breaths/min</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">SpO2</span>
                  <input
                    type="number"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({ ...formData, oxygenSaturation: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 mt-1"
                  />
                  <span className="text-[9px] text-slate-400">% Saturation</span>
                </div>
              </div>
            </div>

            {/* High-Risk Clinical Triggers Checkboxes */}
            <div className="pt-2">
              <span className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Presenting High-Risk Symptoms &amp; Red Flags
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const isChecked = formData.highRiskSymptoms.includes(symptom);
                  return (
                    <label
                      key={symptom}
                      className={`flex items-start space-x-2 p-2 rounded border cursor-pointer text-[11px] transition ${
                        isChecked ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSymptomToggle(symptom)}
                        className="mt-0.5 rounded text-sky-600 focus:ring-0"
                      />
                      <span>{symptom}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              id="evaluate-triage-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-md transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Evaluating Rules Engine...' : 'Run Triage Decision Model'}</span>
            </button>
          </form>
        </div>

        {/* Right: Triage Classification & Rule Explainability (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Triage Classification Result</span>
              <span className="text-xs text-slate-400">Deterministic</span>
            </h2>

            {result ? (
              <div className="mt-4 space-y-4">
                {/* Priority Badge & Category */}
                <div className={`p-4 rounded-lg border ${priorityStyles[result.priorityLevel]?.bg || 'bg-slate-50'} ${priorityStyles[result.priorityLevel]?.border || 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${priorityStyles[result.priorityLevel]?.badge || 'bg-slate-800 text-white'}`}>
                      ESI Level {result.priorityLevel} — {result.priorityCategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {result.priorityLevel <= 2 ? 'URGENT ATTENTION' : 'STANDARD WORKFLOW'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {result.explanation}
                  </h3>
                  {result.disclaimer && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                      {result.disclaimer}
                    </p>
                  )}
                </div>

                {/* Rules Triggered Breakdown */}
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Rules Engine Execution Trace:
                  </span>
                  <div className="space-y-1.5">
                    {result.rulesTriggered.map((rule, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs bg-slate-50 p-2 rounded border border-slate-200/70">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" />
                        <span className="text-slate-700 font-mono text-[11px]">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contributing Clinical Factors */}
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Contributing Factors:
                  </span>
                  <div className="space-y-2">
                    {result.contributingFactors.map((factor, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{factor.factor}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{factor.impact}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{factor.description || factor.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  Evaluation Completed: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Activity className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs">
                  Fill in the clinical vitals and click "Run Triage Decision Model" to view the deterministic rule breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
