'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = typeof user.role === 'object' ? user.role.name : user.role;
        if (!allowedRoles.includes(userRole)) {
          router.push('/unauthorized'); // or redirect to main dashboard
        }
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}