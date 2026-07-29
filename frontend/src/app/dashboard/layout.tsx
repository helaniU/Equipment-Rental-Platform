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
  user?.roleName || 
  'CUSTOMER';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Equipment Catalog', href: '/dashboard/equipment', icon: Package, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Reservations', href: '/dashboard/reservations', icon: Calendar, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
    { name: 'Inventory & Stock', href: '/dashboard/inventory', icon: Boxes, roles: ['ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR'] },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['ADMIN', 'STAFF', 'CUSTOMER', 'WAREHOUSE_OPERATOR'] },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-lg font-bold text-blue-400">Rental Manager</h1>
            <p className="text-xs text-gray-400 mt-1">Enterprise Gear Platform</p>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] bg-slate-800 text-blue-400 rounded border border-slate-700 font-semibold">
                {roleName}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}