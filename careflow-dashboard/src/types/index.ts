export type DepartmentName = 
  | 'General Medicine'
  | 'Emergency'
  | 'Cardiology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Intensive Care Unit (ICU)'
  | 'Neurology';

export interface PatientVisit {
  id?: number;
  patientIdentifier: string;
  department: string;
  visitDate: string;
  admissionDate?: string;
  dischargeDate?: string;
  triageCategory?: string;
  status?: string;
  age?: number;
  chiefComplaint?: string;
}

export interface BedOccupancy {
  department: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  scheduledDischarges: number;
  icuBeds?: number;
  occupiedIcuBeds?: number;
  availableIcuBeds?: number;
}

export interface Equipment {
  id: number;
  equipmentName: string;
  department: string;
  totalCount: number;
  availableCount: number;
  inUseCount: number;
  maintenanceCount: number;
}

export interface ContributingFactor {
  factor: string;
  impact: string;
  detail?: string;
  description?: string;
}

export interface HistoricalDataPoint {
  date: string;
  admissions: number;
  isForecast?: boolean;
}

export interface ForecastResponse {
  department: string;
  targetDate: string;
  predictedAdmissions: number;
  baselineMethod: string;
  historicalAverage: number;
  movingAverage7Day: number;
  sameWeekdayAverage: number;
  dataPointsCount: number;
  confidenceLower: number;
  confidenceUpper: number;
  fallbackEstimate: boolean;
  contributingFactors: ContributingFactor[];
  historicalObservations: HistoricalDataPoint[];
  generatedAt: string;
}

export interface StaffingRecommendation {
  recommendedNurses?: number;
  recommendedPhysicians?: number;
  patientNurseRatio?: string;
  adjustmentNote?: string;
  currentStaffEstimate?: number;
  recommendedStaff?: number;
  additionalStaffNeeded?: number;
  rationale?: string;
}

export interface CapacityResponse {
  department: string;
  targetDate: string;
  totalCapacity: number;
  currentOccupancy: number;
  predictedAdmissions: number;
  expectedDischarges: number;
  projectedOccupancy: number;
  availableCapacity: number;
  bedShortage: number;
  surgeRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  surgeRiskPercentage: number;
  staffingRecommendation: StaffingRecommendation;
  operationalActions: string[];
  geminiExplanation: string;
  explainableSummary: string;
  factors: ContributingFactor[];
}

export interface TriageRequest {
  patientIdentifier: string;
  age: number;
  department: string;
  chiefComplaint: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  painLevel: number;
  highRiskSymptoms: string[];
}

export interface TriageResponse {
  patientIdentifier?: string;
  priorityCategory: string;
  priorityLevel: number;
  priorityColor: string;
  rulesTriggered: string[];
  contributingFactors: Array<{ factor: string; description?: string; detail?: string; impact: string }>;
  explanation: string;
  disclaimer: string;
  geminiExplanation?: string;
}

export interface SurgeAlert {
  id: number;
  department: string;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  active: boolean;
  createdAt: string;
}

export interface ServiceHealthStatus {
  patientService: boolean;
  bedService: boolean;
  forecastService: boolean;
  lastChecked: string;
}
