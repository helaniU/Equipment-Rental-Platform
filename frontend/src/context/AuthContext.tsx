'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: {
    name: string;
  } | string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT token payload without external libraries
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (typeof parsedUser.role === 'string') {
            parsedUser.role = { name: parsedUser.role };
          }
          setUser(parsedUser);
        } catch {
          localStorage.removeItem('user');
        }
      } else {
        // Fallback: Extract user info directly from decoded JWT
        const decoded = decodeJwt(storedToken);
        if (decoded) {
          const userObj: User = {
            id: decoded.sub || decoded.id || '',
            email: decoded.email || '',
            fullName: decoded.fullName || decoded.email || 'User',
            role: typeof decoded.role === 'string' ? { name: decoded.role } : decoded.role || { name: 'USER' },
          };
          setUser(userObj);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, refreshToken } = response.data;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // 1. Save tokens to localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // 2. Extract user info from decoded JWT token
      const decoded = decodeJwt(accessToken);
      const userObj: User = {
        id: decoded?.sub || decoded?.id || '',
        email: decoded?.email || email,
        fullName: decoded?.fullName || email,
        role: typeof decoded?.role === 'string' ? { name: decoded.role } : decoded?.role || { name: 'USER' },
      };

      // 3. Save user info to state and localStorage
      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(accessToken);
      setUser(userObj);

      // 4. Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw error so the UI form can display error messages
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};