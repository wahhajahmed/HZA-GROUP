'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import AdminOrderAlert from '@/components/admin/AdminOrderAlert';
import { BrandLogo } from '@/components/shared/BrandLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden relative min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center lg:hidden">
              <BrandLogo size="sm" variant="light" href="/dashboard" />
            </div>
            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-slate-400">HZA Group Admin Portal</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Actions / Profile could go here */}
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold border border-indigo-200">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <AdminOrderAlert />
    </div>
  );
}

