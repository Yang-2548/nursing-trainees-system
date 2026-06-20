
export type TrainingType = 'INCOMING' | 'OUTGOING';

export interface BaseTrainingRecord {
  id: string;
  name: string;
  title: string; // 职称
  workYears: number; // 工龄
  specialty: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  type: TrainingType;
  createdAt: string;
}

export interface TrainingCertificate {
  name: string;
  data: string; // Base64
  type: string; // mime type
}

export interface IncomingRecord extends BaseTrainingRecord {
  type: 'INCOMING';
  hospital: string;
  hospitalLevel: string;
  province: string;
  city: string;
  department: string;
  evidence?: TrainingCertificate;
  isSpecialistBase?: boolean; // 是否到专科护士基地进修
}

export interface OutgoingRecord extends BaseTrainingRecord {
  type: 'OUTGOING';
  department: string;
  institution: string;
  level: string;
  certificate?: TrainingCertificate; // 结业证
  // 专科护士认证专项
  isSpecialistCert?: boolean;
  certBody?: string;
  certSpecialty?: string;
  certDate?: string;
  certEvidence?: TrainingCertificate;
}

export type TrainingRecord = IncomingRecord | OutgoingRecord;

export interface FilterState {
  type: TrainingType | 'ALL';
  year: string;
  department: string;
  specialty: string;
  searchTerm: string;
  evidenceStatus?: 'ALL' | 'HAS' | 'NONE';
  hospital?: string;
  hospitalLevel?: string;
  province?: string;
  city?: string;
  institution?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
}
