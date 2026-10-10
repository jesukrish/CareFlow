import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bed, 
  Stethoscope, 
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ alertCount }) => {
  const navItems = [
    {
      to: '/',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      description: 'KPIs, Projected Occupancy, AI Summary'
    },
    {
      to: '/forecast',
      label: 'Demand Forecast',
      icon: TrendingUp,
      description: 'Statistical Baseline & Trend Analysis'
    },
    {
      to: '/beds',
      label: 'Bed & Resources',
      icon: Bed,
      description: 'Occupancy, Discharges & Equipment'
    },
    {
      to: '/triage',
      label: 'Patient Triage Engine',
      icon: Stethoscope,
      description: 'Rule-based Clinical Prioritization'
    },
    {
      to: '/alerts',
      label: 'Reports & Alerts',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : undefined,
      description: 'Surge Warning & Capacity Thresholds'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
            Operations Console
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
