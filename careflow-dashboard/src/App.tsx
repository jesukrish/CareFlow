import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './pages/DashboardOverview';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { BedManagementPage } from './pages/BedManagementPage';
import { PatientTriagePage } from './pages/PatientTriagePage';
import { AlertsPage } from './pages/AlertsPage';
import { LoginPage } from './pages/LoginPage';
import { 
  DepartmentName, 
  ForecastResponse, 
  CapacityResponse, 
  BedOccupancy, 
  Equipment, 
  SurgeAlert
} from './types';
import { CareFlowApi } from './services/api';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('careflow_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.email || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [selectedDept, setSelectedDept] = useState<DepartmentName>('General Medicine');
  const [targetDate, setTargetDate] = useState<string>('2026-10-11');
  
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null);
  const [occupancy, setOccupancy] = useState<BedOccupancy | null>(null);
  const [resources, setResources] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<SurgeAlert[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch telemetry and forecasts
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fData, cData, oData, rData, aData] = await Promise.allSettled([
        CareFlowApi.getForecast(selectedDept, targetDate),
        CareFlowApi.getCapacity(selectedDept, targetDate),
        CareFlowApi.getBedOccupancy(selectedDept),
        CareFlowApi.getResources(),
        CareFlowApi.getAlerts(selectedDept)
      ]);

      if (fData.status === 'fulfilled') setForecast(fData.value);
      if (cData.status === 'fulfilled') setCapacity(cData.value);
      if (oData.status === 'fulfilled') setOccupancy(oData.value);
      if (rData.status === 'fulfilled') setResources(rData.value);
      if (aData.status === 'fulfilled') setAlerts(aData.value);

      if (cData.status === 'rejected') {
        const errMessage = (cData.reason as any)?.message || 'Microservice communication notice.';
        setError(`Unable to retrieve capacity data for ${selectedDept}: ${errMessage}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with microservice cluster.');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, targetDate]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  const handleLogout = () => {
    localStorage.removeItem('careflow_user');
    setCurrentUser(null);
  };

  // If user is not authenticated, show professional Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(email) => setCurrentUser(email)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Header
          selectedDept={selectedDept}
          onDeptChange={setSelectedDept}
          targetDate={targetDate}
          onDateChange={setTargetDate}
          onRefresh={loadData}
          loading={loading}
          userEmail={currentUser}
          onLogout={handleLogout}
        />

        <div className="flex flex-1">
          <Sidebar alertCount={alerts.length} />

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardOverview
                    department={selectedDept}
                    targetDate={targetDate}
                    forecast={forecast}
                    capacity={capacity}
                    occupancy={occupancy}
                    alerts={alerts}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/forecast"
                element={
                  <DemandForecastPage
                    department={selectedDept}
                    targetDate={targetDate}
                    forecast={forecast}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/beds"
                element={
                  <BedManagementPage
                    selectedDept={selectedDept}
                    occupancy={occupancy}
                    resources={resources}
                    onRefresh={loadData}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/triage"
                element={<PatientTriagePage selectedDept={selectedDept} />}
              />
              <Route
                path="/alerts"
                element={
                  <AlertsPage
                    alerts={alerts}
                    selectedDept={selectedDept}
                    onRefresh={loadData}
                    loading={loading}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};
