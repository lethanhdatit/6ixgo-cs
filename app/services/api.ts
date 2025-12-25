import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getConfig, getTimezoneOffset } from '../config/env';
import { DEFAULT_LOCALE_CODE } from '../constants';
import { StoredAuthSession } from '../types';

// In-memory access token cache to avoid repeated localStorage reads
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const getAccessToken = (): string | null => {
  // Prefer in-memory token
  if (accessToken) return accessToken;

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('6ixgo_auth');
    if (!stored) return null;
    const parsed: StoredAuthSession = JSON.parse(stored);
    return parsed.accessToken || null;
  } catch (error) {
    console.error('Failed to read access token from storage', error);
    return null;
  }
};

// API Error response format from backend
export interface ApiErrorDetail {
  code: string;
  description: string;
}

export interface ApiErrorResponse {
  message: string;
  data?: ApiErrorDetail[];
  ts: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
  
  constructor(message: string, status: number, code?: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Extract user-friendly error message from API response
const extractErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
  const response = error.response;
  
  if (response?.data) {
    // Try to get description from data array first (more user-friendly)
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data.map(d => d.description).join('. ');
    }
    // Fall back to message field
    if (response.data.message) {
      // Remove technical trace info if present
      const message = response.data.message;
      const traceIndex = message.indexOf(', Non-Production trace:');
      return traceIndex > -1 ? message.substring(0, traceIndex) : message;
    }
  }
  
  // Default error messages based on status
  switch (response?.status) {
    case 400: return 'Invalid request. Please check your input.';
    case 401: return 'Session expired. Please login again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 500: return 'Server error. Please try again later.';
    default: return error.message || 'An unexpected error occurred.';
  }
};

// Create axios instances for different API services
const createApiInstance = (getBaseUrl: () => string): AxiosInstance => {
  const instance = axios.create({
    withCredentials: true, // Required for cookie-based auth
  });

  // Request interceptor - add common headers
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Set base URL dynamically
      config.baseURL = getBaseUrl();
      
      // Add common headers
      const envConfig = getConfig();
      config.headers['X-Locale-Code'] = DEFAULT_LOCALE_CODE;
      config.headers['X-TimeZone-Offset'] = getTimezoneOffset().toString();
      config.headers['Content-Type'] = 'application/json';
      // Origin header for CORS - mapped to environment
      config.headers['X-Origin'] = envConfig.originUrl;

      // Bearer token for authenticated requests
      const token = getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      const status = error.response?.status || 0;
      const errorMessage = extractErrorMessage(error);
      const errorCode = error.response?.data?.data?.[0]?.code;
      const errorDetails = error.response?.data?.data;
      
      // Create custom API error
      const apiError = new ApiError(errorMessage, status, errorCode, errorDetails);
      
      if (status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('6ixgo_auth');
          // Detect basePath from current URL
          const basePath = window.location.pathname.startsWith('/6ixgo-cs') ? '/6ixgo-cs' : '';
          const loginPath = `${basePath}/login`;
          // Don't redirect if already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = loginPath;
          }
        }
      }
      
      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Resource API instance
export const resourceApi = createApiInstance(() => getConfig().resourceApiUrl);

// Admin API instance
export const adminApi = createApiInstance(() => getConfig().adminApiUrl);

// Identity API instance (for auth)
export const identityApi = createApiInstance(() => getConfig().identityApiUrl);

export default { resourceApi, adminApi, identityApi };
