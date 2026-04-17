export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  createdAt: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  address?: string;
  gender?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  doctorId: number;
  medications: string;
  instructions?: string;
  prescribedAt: string;
  doctor?: Doctor;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  duration: string;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  patientId: number;
  issueDate: string;
  dueDate: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'CANCELLED';
  notes?: string;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}