'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import AdminOrderAlert from '@/components/admin/AdminOrderAlert';
import { BrandLogo } from '@/components/shared/BrandLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <BrandLogo size="sm" variant="light" href="/dashboard" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <AdminOrderAlert />
    </div>
  );
}

