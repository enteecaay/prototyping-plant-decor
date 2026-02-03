'use client';

import React from 'react';
import { Result, Button } from 'antd';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '50px' }}>
        <Result
          status="403"
          title="Not Authenticated"
          subTitle="Please log in to access this page."
          extra={
            <Link href="/auth/login">
              <Button type="primary">Go to Login</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div style={{ padding: '50px' }}>
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this page."
          extra={
            <Link href="/">
              <Button type="primary">Go Home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
