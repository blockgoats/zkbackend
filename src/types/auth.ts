export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  did?: string;
  created_at: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  token: string;
  did?: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
  didProof?: {
    proof: Record<string, unknown>;
    publicSignals: string[];
  };
}

export interface JWTPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}