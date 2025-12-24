// Authentication types

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Payload returned from login API
export interface LoginData {
  userId: string;
  userName: string;
  userRoles: string;
  rememberMe: boolean;
  accessToken: string;
  accessTokenExpiration: string;
  accessTokenExp: string; // e.g. "00:30:00"
  refreshToken: string;
  refreshTokenExpiration: string;
  refreshTokenExp: string; // e.g. "30.00:00:00"
  audience: string;
}

export interface LoginResponse {
  message: string;
  data: LoginData;
  ts: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string;
  userName?: string;
  userRoles?: string;
  error?: string;
}

// Stored auth session for localStorage
export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  userName: string;
  userRoles: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}
