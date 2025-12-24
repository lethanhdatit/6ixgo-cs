'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService, ApiError, setAccessToken } from '../services';
import { AuthState, LoginRequest, StoredAuthSession } from '../types';
import { message } from 'antd';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = '6ixgo_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  // Persist auth session
  const persistSession = (session: StoredAuthSession) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setAccessToken(session.accessToken);
  };

  // Clear auth session
  const clearSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
    setAccessToken(null);
  };

  // Check initial auth state
  useEffect(() => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) {
        setState({ isAuthenticated: false, isLoading: false, error: undefined });
        return;
      }

      const session: StoredAuthSession = JSON.parse(stored);
      setAccessToken(session.accessToken);
      setState({
        isAuthenticated: Boolean(session.accessToken),
        isLoading: false,
        accessToken: session.accessToken,
        userName: session.userName,
        userRoles: session.userRoles,
        error: undefined,
      });
    } catch (error) {
      console.error('Failed to parse stored auth session', error);
      clearSession();
      setState({ isAuthenticated: false, isLoading: false, error: undefined });
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await authService.login(credentials);
      const payload = response.data;

      const session: StoredAuthSession = {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        userName: payload.userName,
        userRoles: payload.userRoles,
        accessTokenExpiration: payload.accessTokenExpiration,
        refreshTokenExpiration: payload.refreshTokenExpiration,
      };

      persistSession(session);

      setState({
        isAuthenticated: true,
        isLoading: false,
        accessToken: payload.accessToken,
        userName: payload.userName,
        userRoles: payload.userRoles,
        error: undefined,
      });
      
      message.success('Login successful!');
      return true;
    } catch (error) {
      // Extract user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Network Error') || error.message.includes('CORS')) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      
      message.error(errorMessage);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      message.success('Logged out successfully');
    } catch {
      // Continue with local logout even if API fails
      message.info('Logged out locally');
    } finally {
      clearSession();
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
