export type Role = 'Admin' | 'User';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  fullName: string;
  email: string;
  role: Role;
  consultantId?: number | null;
  expiresAt: string;
}

export interface Me {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  fullName: string;
  role: Role;
  consultantId?: number | null;
}
