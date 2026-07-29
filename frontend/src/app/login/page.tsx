'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Equipment Rental Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage equipment and bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rental.com"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 text-sm"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 text-sm"
                suppressHydrationWarning
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 text-sm disabled:opacity-50"
            suppressHydrationWarning
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Role Fill Buttons for Presentation/Testing */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Quick Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@rental.com')}
              className="p-2 border rounded bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-gray-700 font-medium text-left transition"
              suppressHydrationWarning
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('staff@rental.com')}
              className="p-2 border rounded bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-gray-700 font-medium text-left transition"
              suppressHydrationWarning
            >
              👔 Staff
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('warehouse@rental.com')}
              className="p-2 border rounded bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-gray-700 font-medium text-left transition"
              suppressHydrationWarning
            >
              📦 Warehouse
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer@rental.com')}
              className="p-2 border rounded bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-gray-700 font-medium text-left transition"
              suppressHydrationWarning
            >
              👤 Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}