
export type TrainingType = 'INCOMING' | 'OUTGOING';

export interface BaseTrainingRecord {
  id: string;
  name: string;
  specialty: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  type: TrainingType;
  createdAt: string;
}

export interface IncomingRecord extends BaseTrainingRecord {
  type: 'INCOMING';
  hospital: string;
  hospitalLevel: string;
  province: string;
  city: string;
  department: string;
}

export interface OutgoingRecord extends BaseTrainingRecord {
  type: 'OUTGOING';
  department: string;
  institution: string;
  level: string;
  certificate?: {
    name: string;
    data: string; // Base64
    type: string; // mime type
  };
}

export type TrainingRecord = IncomingRecord | OutgoingRecord;

export interface FilterState {
  type: TrainingType | 'ALL';
  year: string;
  department: string;
  specialty: string;
  searchTerm: string;
  // 扩展筛选字段
  hospital?: string;
  hospitalLevel?: string;
  province?: string;
  city?: string;
  institution?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
}
