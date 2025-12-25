'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { useAuth } from '../../hooks';
import { normalizePath } from '../../config/env';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Normalize pathname to remove basePath for comparison
  const normalizedPath = normalizePath(pathname);
  const isLoginPage = normalizedPath === '/login' || normalizedPath === '/login/';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      // Next.js router automatically handles basePath, so we just use '/login'
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
