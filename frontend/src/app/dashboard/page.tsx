'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  PieChart as PieIcon, 
  Award,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  activeRentals: number;
  totalCustomers: number;
  totalEquipment: number;
  equipmentUtilization: number;
  reservationTrends: { month: string; reservations: number }[];
  mostRentedEquipment: { name: string; rentalsCount: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    activeRentals: 0,
    totalCustomers: 0,
    totalEquipment: 0,
    equipmentUtilization: 0,
    reservationTrends: [],
    mostRentedEquipment: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        console.log('Real Backend Dashboard Data:', res.data);
        
        setData({
          totalRevenue: Number(res.data?.totalRevenue) || 0,
          activeRentals: Number(res.data?.activeRentals) || 0,
          totalCustomers: Number(res.data?.totalCustomers) || 0,
          totalEquipment: Number(res.data?.totalEquipment) || 0,
          equipmentUtilization: Number(res.data?.equipmentUtilization) || 0,
          reservationTrends: Array.isArray(res.data?.reservationTrends) ? res.data.reservationTrends : [],
          mostRentedEquipment: Array.isArray(res.data?.mostRentedEquipment) ? res.data.mostRentedEquipment : [],
        });
      } catch (err) {
        console.error('Failed to fetch real stats from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Operational Overview & Analytics</h2>
        <p className="text-xs text-gray-500">Real-time metrics on equipment utilization, revenue, and trends</p>
      </div>

      {/* 1. TOP KEY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Revenue</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">${data.totalRevenue.toFixed(2)}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Accumulated income</span>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Active Rentals</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{data.activeRentals}</h3>
            <span className="text-[11px] text-blue-600 font-medium">Currently out with clients</span>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Customers</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{data.totalCustomers}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Registered user accounts</span>
          </div>
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Equipment Utilization</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{data.equipmentUtilization}%</h3>
            <span className="text-[11px] text-amber-600 font-medium">Active gear ratio</span>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <PieIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION (RESERVATION TRENDS & MOST RENTED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reservation Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Reservation Trends
              </h3>
              <p className="text-xs text-gray-400">Monthly booking volume history</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Real-time DB Data
            </span>
          </div>

          {data.reservationTrends.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs border border-dashed rounded-lg">
              <BarChart2 className="w-8 h-8 mb-2 stroke-1 text-gray-300" />
              <p>No reservation history recorded yet in database</p>
            </div>
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.reservationTrends}>
                  <defs>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="reservations"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Most Rented Equipment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Most Rented Equipment
            </h3>
            <p className="text-xs text-gray-400">Top demanded inventory items</p>
          </div>

          {data.mostRentedEquipment.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs border border-dashed rounded-lg">
              <Package className="w-8 h-8 mb-2 stroke-1 text-gray-300" />
              <p>No rental activity recorded yet</p>
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mostRentedEquipment} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="rentalsCount" radius={[0, 4, 4, 0]} barSize={16}>
                    {data.mostRentedEquipment.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}