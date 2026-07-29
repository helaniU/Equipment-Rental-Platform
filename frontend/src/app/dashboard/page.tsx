'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, CalendarCheck, DollarSign, PackageCheck } from 'lucide-react';

interface Metrics {
  totalCustomers: number;
  activeReservations: number;
  totalRevenue: number;
  totalStockCount: number;
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        setMetrics(res.data);
      } catch {
        console.warn('Unable to load real-time metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const statCards = [
    { title: 'Total Customers', value: metrics?.totalCustomers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Reservations', value: metrics?.activeReservations ?? 0, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Revenue', value: `$${metrics?.totalRevenue?.toFixed(2) ?? '0.00'}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Stock Units Available', value: metrics?.totalStockCount ?? 0, icon: PackageCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
                  {loading ? '...' : card.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to Equipment Management</h3>
        <p className="text-sm text-gray-600">
          Use the left sidebar menu to navigate through equipment catalog management, reservations, stock adjustments, and checkout processing.
        </p>
      </div>
    </div>
  );
}