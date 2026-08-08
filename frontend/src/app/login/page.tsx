'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, UserCheck, X, CheckCircle2, ArrowRight, Shield,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login, forgotPassword } = useAuth();
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to send reset instructions.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-screen flex">

      {/* ════════════════════════════════════
          LEFT PANEL — image + brand text
         ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col bg-slate-900 relative overflow-hidden">

        {/* Full-panel image — no text over it */}
        <div className="absolute inset-0">
          <Image
            src="/auth-panel.png"
            alt="Equipment Rental Platform"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Very subtle dark gradient only at the very bottom for the text area */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />

        {/* Top-left brand logo — sits clearly above the image */}
        <div className="relative z-10 px-10 pt-9 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">RENTAL MANAGER</span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">PRO</span>
        </div>

        {/* Bottom text — clearly below the image's main visual */}
        <div className="relative z-10 mt-auto px-10 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">Live Platform</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-snug mb-2">
            The Smarter Way to<br />Manage Equipment Rentals
          </h2>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            Bookings, inventory, payments &amp; analytics — all in one unified dashboard.
          </p>

          <div className="flex flex-wrap gap-2">
            {['Real-time Analytics', 'Secure Payments', 'Role-based Access', 'Inventory Tracking'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/10 border border-white/15 text-white text-[11px] font-medium rounded-full backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          RIGHT PANEL — Login Form
         ════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-[480px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg px-8 py-9 space-y-7">

            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 lg:hidden mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 font-bold">Rental Manager</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Welcome back!</h1>
              <p className="text-sm text-gray-500 mt-1c text-center">Sign in to access your equipment management portal</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@rental.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotOpen(true); setForgotSuccess(false); setForgotEmail(email); setForgotError(''); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm disabled:opacity-50 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                suppressHydrationWarning
              >
                {loading ? 'Authenticating...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Create one free
              </Link>
            </p>

            {/* Demo accounts */}
            <div className="pt-5 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Quick Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: '👑 Admin', email: 'admin@rental.com' },
                  { label: '👔 Staff', email: 'staff@rental.com' },
                  { label: '📦 Warehouse', email: 'warehouse@rental.com' },
                  { label: '👤 Customer', email: 'customer@rental.com' },
                ].map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => handleDemoLogin(d.email)}
                    className="p-2.5 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-700 font-medium text-left transition"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ Forgot Password Modal ════════ */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">🔑</div>
              <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
              <p className="text-xs text-gray-500 mt-1">Enter your account email and we&apos;ll send recovery instructions.</p>
            </div>
            {forgotSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-semibold text-emerald-800">Instructions Sent!</p>
                <p className="text-[11px] text-emerald-600">Check your inbox for reset details.</p>
                <button onClick={() => setIsForgotOpen(false)} className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                {forgotError && <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg border border-red-200">{forgotError}</div>}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button type="button" onClick={() => setIsForgotOpen(false)} className="w-1/2 py-2.5 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={forgotLoading} className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50">
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}