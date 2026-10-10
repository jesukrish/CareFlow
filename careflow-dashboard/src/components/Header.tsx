import React from 'react';
import { Activity, RefreshCw, User, LogOut } from 'lucide-react';
import { DepartmentName } from '../types';

interface HeaderProps {
  selectedDept: DepartmentName;
  onDeptChange: (dept: DepartmentName) => void;
  targetDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  loading: boolean;
  userEmail: string | null;
  onLogout: () => void;
}

const DEPARTMENTS: DepartmentName[] = [
  'General Medicine',
  'Emergency',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Intensive Care Unit (ICU)',
  'Neurology'
];

export const Header: React.FC<HeaderProps> = ({
  selectedDept,
  onDeptChange,
  targetDate,
  onDateChange,
  onRefresh,
  loading,
  userEmail,
  onLogout
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-sky-500 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CareFlow AI</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hospital Operations &amp; Intelligent Capacity Planning
              </p>
            </div>
          </div>

          {/* Operational Controls: Department & Target Date */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 space-x-2">
              <label htmlFor="dept-select" className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Dept:
              </label>
              <select
                id="dept-select"
                value={selectedDept}
                onChange={(e) => onDeptChange(e.target.value as DepartmentName)}
                className="bg-transparent text-sm text-slate-100 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-800 text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 space-x-2">
              <label htmlFor="date-input" className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Forecast Date:
              </label>
              <input
                id="date-input"
                type="date"
                value={targetDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm text-slate-100 font-medium focus:outline-none cursor-pointer"
              />
            </div>

            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh intelligence and occupancy"
              className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>

          {/* User Profile & Logout */}
          {userEmail && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                  {userEmail}
                </span>
                <span className="text-[10px] text-slate-400">
                  Staff Administrator
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
                <User className="h-4 w-4" />
              </div>
              <button
                onClick={onLogout}
                title="Sign out of CareFlow"
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-rose-950/70 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-800/80 rounded-md transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
