import type { ReactNode } from "react";

export interface Note {
  text: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  username: string;
  password: string;
  role: 'مدير' | 'مستخدم';
}

export interface Employee {
  name: string;
  national_id: string;
  phone: string;
  governorate: string;
  city: string;
  area: string;
  is_frozen?: boolean;
}

export interface Beneficiary {
  code: string;
  name: string;
  national_id: string;
  join_date: string;
  phone: string;
  alternative_phone?: string;
  governorate: string;
  city: string;
  area: string;
  detailed_address: string;
  job: string;
  family_members: number;
  marital_status: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل';
  spouse_name?: string;
  employee_national_id: string;
  is_blacklisted?: boolean;
  notes?: Note[];
  researcher_receipt_date?: string;
  research_submission_date?: string;
  research_result?: 'مقبول' | 'مرفوض';
}

export interface AssistanceType {
  id: number;
  name: string;
}

export type OperationStatus = 'مقبوله' | 'مرفوضه' | 'معلقة';
export type DisbursementStatus = 'تم الصرف' | 'جاري التنفيذ';

export interface Operation {
  id: number;
  code: string;
  beneficiary_national_id: string;
  assistance_id: number;
  amount: number;
  date: string; // Operation creation date
  committee_number?: string;
  committee_decision_description?: string;
  spending_entity: string;
  details?: string;
  status: OperationStatus;
  acceptance_date?: string;
  pending_date?: string;
  disbursement_status?: DisbursementStatus;
  disbursement_date?: string;
}

export interface Task {
  id: number;
  userId: number;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  users: User[];
  employees: Employee[];
  beneficiaries: Beneficiary[];
  assistanceTypes: AssistanceType[];
  operations: Operation[];
  tasks: Task[];
  organizationName?: string;
  organizationLogo?: string;
}

// Add a simple interface for children props
export interface ChildrenProps {
  children: ReactNode;
}
