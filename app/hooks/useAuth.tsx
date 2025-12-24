'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService, ApiError } from '../services';
import { AuthState, LoginRequest } from '../types';
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

  // Check initial auth state
  useEffect(() => {
    const checkInitialAuth = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_KEY);
        setState({
          isAuthenticated: stored === 'true',
          isLoading: false,
          error: undefined,
        });
      }
    };
    checkInitialAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      await authService.login(credentials);
      
      // Store auth state
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'true');
      }
      
      setState({
        isAuthenticated: true,
        isLoading: false,
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
      }
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
