import axios from 'axios';
import {
  ForecastResponse,
  CapacityResponse,
  TriageRequest,
  TriageResponse,
  SurgeAlert,
  BedOccupancy,
  Equipment,
  PatientVisit,
  ServiceHealthStatus
} from '../types';

const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const CareFlowApi = {
  // --- Forecast & Intelligence Service (8083) ---
  getForecast: async (department: string, date: string): Promise<ForecastResponse> => {
    const response = await api.get<ForecastResponse>('/api/analytics/forecast', {
      params: { department, date }
    });
    return response.data;
  },

  getCapacity: async (department: string, date: string): Promise<CapacityResponse> => {
    const response = await api.get<CapacityResponse>('/api/analytics/capacity', {
      params: { department, date }
    });
    return response.data;
  },

  submitTriage: async (payload: TriageRequest): Promise<TriageResponse> => {
    const response = await api.post<TriageResponse>('/api/analytics/triage', payload);
    return response.data;
  },

  getAlerts: async (department?: string): Promise<SurgeAlert[]> => {
    const response = await api.get<SurgeAlert[]>('/api/analytics/alerts', {
      params: department ? { department } : undefined
    });
    return response.data;
  },

  // --- Bed and Resource Service (8082) ---
  getBedOccupancy: async (department: string): Promise<BedOccupancy> => {
    const response = await api.get<BedOccupancy>('/api/beds/occupancy', {
      params: { department }
    });
    return response.data;
  },

  getBedAvailability: async (department: string, date: string): Promise<BedOccupancy> => {
    const response = await api.get<BedOccupancy>('/api/beds/availability', {
      params: { department, date }
    });
    return response.data;
  },

  getResources: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/api/resources');
    return response.data;
  },

  updateOccupancy: async (payload: { department: string; occupiedBeds: number; scheduledDischarges?: number }): Promise<BedOccupancy> => {
    const response = await api.post<BedOccupancy>('/api/beds/occupancy', payload);
    return response.data;
  },

  // --- Patient Service (8081) ---
  getVisits: async (): Promise<PatientVisit[]> => {
    const response = await api.get<PatientVisit[]>('/api/patients/visits');
    return response.data;
  },

  createVisit: async (payload: Partial<PatientVisit>): Promise<PatientVisit> => {
    const response = await api.post<PatientVisit>('/api/patients/visits', payload);
    return response.data;
  },

  getAdmissionHistory: async (department: string, from: string, to: string) => {
    const response = await api.get('/api/patients/admissions/history', {
      params: { department, from, to }
    });
    return response.data;
  },

  // --- Health Checks ---
  checkHealth: async (): Promise<ServiceHealthStatus> => {
    const results = await Promise.allSettled([
      axios.get('/actuator-patient/actuator/health', { timeout: 3000 }),
      axios.get('/actuator-bed/actuator/health', { timeout: 3000 }),
      axios.get('/actuator-forecast/actuator/health', { timeout: 3000 })
    ]);

    return {
      patientService: results[0].status === 'fulfilled' && (results[0].value.data?.status === 'UP' || results[0].value.status === 200),
      bedService: results[1].status === 'fulfilled' && (results[1].value.data?.status === 'UP' || results[1].value.status === 200),
      forecastService: results[2].status === 'fulfilled' && (results[2].value.data?.status === 'UP' || results[2].value.status === 200),
      lastChecked: new Date().toLocaleTimeString()
    };
  }
};
