'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Boxes,
  CreditCard,
  Users,
  Settings,
  LogOut,
  User as UserIcon,
  Bell
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extracts role whether backend sends string ('ADMIN') or object ({ name: 'ADMIN' })
  const roleName =
    (typeof user?.role === 'object' ? user?.role?.name : user?.role) ||
    (user as any)?.roleName ||
    'CUSTOMER';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Equipment Catalog', href: '/dashboard/equipment', icon: Package, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Reservations', href: '/dashboard/reservations', icon: Calendar, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Inventory & Stock', href: '/dashboard/inventory', icon: Boxes, roles: ['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'] },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand */}
          <div className="px-6 py-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-widest uppercase">Rental Manager</h1>
                <p className="text-[10px] text-slate-500 font-medium">Enterprise Gear Platform</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems
              .filter((item) => item.roles.includes(roleName))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] bg-blue-600/20 text-blue-400 rounded-md border border-blue-500/20 font-bold uppercase tracking-wide">
                {roleName}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top Header ── */}
        <header className="bg-white border-b border-gray-200 px-8 py-0 flex items-center justify-between h-16 shadow-xs sticky top-0 z-30">
          {/* Left: Page Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              {React.createElement(
                navItems.find((item) => item.href === pathname)?.icon || LayoutDashboard,
                { className: 'w-4 h-4 text-white' }
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
                </h1>
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Children ── */}
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}