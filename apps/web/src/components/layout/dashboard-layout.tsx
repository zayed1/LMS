'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ToastContainer } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-primary-lighter">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile unless mobileOpen */}
      <div className={cn("md:block", mobileOpen ? "block" : "hidden")}>
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(prev => !prev)} />
      </div>

      {/* Main Content Area */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'md:mr-16' : 'md:mr-64')}>
        {/* Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Breadcrumb />
          <div className="animate-page">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
