export interface TokenPayload {
  userId: string;
  username: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  did?: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
  didProof?: Record<string, unknown>;
}

export interface AuthResponse {
  userId: string;
  username: string;
  token: string;
  did?: string;
}