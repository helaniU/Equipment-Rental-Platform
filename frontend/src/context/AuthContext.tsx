'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;        
  role?: string | { id?: string; name: string };
  roleName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      const decoded = decodeJwt(accessToken);
      const userObj: User = {
        id: decoded?.sub || decoded?.id || '',
        email: decoded?.email || email,
        fullName: decoded?.fullName || email,
        role: typeof decoded?.role === 'string' ? { name: decoded.role } : decoded?.role || { name: 'USER' },
      };

      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(accessToken);
      setUser(userObj);

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string, phone?: string) => {
    try {
      await api.post('/auth/register', { fullName, email, password, phone });
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
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
    <AuthContext.Provider value={{ user, token, login, register, forgotPassword, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};