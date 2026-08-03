'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  DollarSign, 
  Users, 
  CalendarCheck, 
  Boxes, 
  TrendingUp, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface DashboardMetrics {
  totalCustomers: number;
  activeReservations: number;
  totalRevenue: number;
  totalStockCount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStaffOrAdmin = ['ADMIN', 'STAFF'].includes(roleName || '');

  useEffect(() => {
    if (isStaffOrAdmin) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [roleName]);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/dashboard/metrics');
      setMetrics(res.data);
    } catch {
      console.warn('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.fullName || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          {isStaffOrAdmin 
            ? 'Here is an overview of platform activity and operational performance.' 
            : 'Manage your rental equipment reservations and explore available catalog items.'}
        </p>
      </div>

      {/* ADMIN & STAFF METRICS OVERVIEW */}
      {isStaffOrAdmin && metrics && (
        <>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Key Operational Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-emerald-600 font-medium">Accumulated paid income</p>
            </div>

            {/* Active Bookings Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Rentals</span>
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.activeReservations}</div>
              <p className="text-xs text-blue-600 font-medium">Currently active bookings</p>
            </div>

            {/* Total Customers Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customers</span>
                <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</div>
              <p className="text-xs text-purple-600 font-medium">Registered clients</p>
            </div>

            {/* Inventory Stock Count Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment Stock</span>
                <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalStockCount}</div>
              <p className="text-xs text-amber-600 font-medium">Total items across inventory</p>
            </div>
          </div>
        </>
      )}

      {/* CUSTOMER QUICK ACTIONS / WELCOME CARD */}
      {!isStaffOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Explore Equipment Catalog</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Browse available gear, check real-time availability, and request bookings for your upcoming projects.
            </p>
            <a 
              href="/dashboard/equipment" 
              className="inline-block text-xs font-semibold text-blue-600 hover:underline pt-1"
            >
              Go to Equipment Catalog →
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Your Reservations</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              View your pending requests, complete payments for approved items, and check active rentals.
            </p>
            <a 
              href="/dashboard/reservations" 
              className="inline-block text-xs font-semibold text-emerald-600 hover:underline pt-1"
            >
              View My Bookings →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}