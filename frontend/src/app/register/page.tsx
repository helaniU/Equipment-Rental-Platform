'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password, phone);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ════════════════════════════════════
          LEFT PANEL — image + brand text
         ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col bg-slate-900 relative overflow-hidden">

        {/* Full-panel image */}
        <div className="absolute inset-0">
          <Image
            src="/auth-panel.png"
            alt="Equipment Rental Platform"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Dark gradient only at the bottom for text legibility */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />

        {/* Top brand */}
        <div className="relative z-10 px-10 pt-9 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">RENTAL MANAGER</span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">PRO</span>
        </div>

        {/* Bottom text */}
        <div className="relative z-10 mt-auto px-10 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">Join the Platform</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-snug mb-2">
            Start Managing Your<br />Rentals Today
          </h2>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            Create your free account and get instant access to equipment booking, inventory &amp; analytics.
          </p>
          <div className="space-y-1.5">
            {['✓  Free customer account setup', '✓  Browse & reserve equipment instantly', '✓  Secure online payments', '✓  Real-time booking status'].map((item) => (
              <p key={item} className="text-sm text-slate-300 font-medium">{item}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          RIGHT PANEL — Register Form
         ════════════════════════════════════ */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-[480px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg px-8 py-9 space-y-6">

            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 lg:hidden mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 font-bold">Rental Manager</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1 text-center">Register as a customer to start renting equipment</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-gray-900 text-sm bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm disabled:opacity-50 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-[11px] text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}