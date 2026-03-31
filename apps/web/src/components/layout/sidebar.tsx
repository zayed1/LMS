'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  Search,
  Award,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { label: 'المستخدمين', href: '/users', icon: Users },
  { label: 'الأقسام', href: '/departments', icon: Building2 },
  { label: 'الدورات', href: '/courses', icon: GraduationCap },
  { label: 'دوراتي', href: '/my-courses', icon: BookOpen },
  { label: 'كتالوج الدورات', href: '/catalog', icon: Search },
  { label: 'شهاداتي', href: '/certificates', icon: Award },
  { label: 'التقارير', href: '/reports', icon: BarChart3 },
  { label: 'الإعدادات', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 z-40 flex h-screen flex-col bg-primary text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        {!collapsed && (
          <h1 className="text-xl font-bold">GCDC</h1>
        )}
        {collapsed && (
          <span className="text-lg font-bold">G</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-12 items-center justify-center border-t border-white/10 text-white/70 transition-colors hover:text-white"
      >
        {collapsed ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>
    </aside>
  );
}
