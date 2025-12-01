export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum EmergencySeverity {
  HIGH = 'ALTA',
  MEDIUM = 'MÉDIA',
  LOW = 'BAIXA',
  UNKNOWN = 'DESCONHECIDO'
}

export interface TriageResult {
  severity: EmergencySeverity;
  advice: string;
  department: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface PatientProfile {
  fullName: string;
  dateOfBirth: string;
  allergies: string;
  medicalConditions: string;
  contact: EmergencyContact;
}

export interface VictimData {
  name: string;
  symptoms: string;
  conscious: boolean;
  profileData?: PatientProfile;
}

export type AppStep = 'HOME' | 'TRIAGE' | 'TRACKING' | 'PROFILE' | 'HISTORY';

export type UserRole = 'PATIENT' | 'RESPONDER' | null;

export interface RescueRequest {
  id: string;
  timestamp: number;
  victim: VictimData;
  location: Coordinates | null;
  triage: TriageResult | null;
  status: 'PENDING' | 'DISPATCHED' | 'ARRIVED' | 'COMPLETED';
  etaMinutes: number;
}