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