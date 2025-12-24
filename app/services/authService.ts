import { identityApi } from './api';
import { LoginRequest, ApiResponse } from '../types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<ApiResponse<unknown>> => {
    const response = await identityApi.post<ApiResponse<unknown>>('/account/signin', {
      data: credentials,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<unknown>> => {
    const response = await identityApi.post<ApiResponse<unknown>>('/account/logout');
    return response.data;
  },

  // Check if user is authenticated (by trying to access a protected resource)
  checkAuth: async (): Promise<boolean> => {
    try {
      // Try to fetch a minimal protected resource
      // If we get 401, the interceptor will handle it
      await identityApi.get('/account/profile');
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
