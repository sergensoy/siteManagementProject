export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export interface LoginCredentials {
  identifier: string; // email veya username
  password: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
  role: UserRole;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  department?: string;
  position?: string;
}
