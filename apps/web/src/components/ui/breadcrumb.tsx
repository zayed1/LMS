'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'لوحة التحكم',
  users: 'المستخدمين',
  departments: 'الأقسام',
  courses: 'الدورات',
  'my-courses': 'دوراتي',
  catalog: 'كتالوج الدورات',
  certificates: 'شهاداتي',
  reports: 'التقارير',
  settings: 'الإعدادات',
  new: 'جديد',
  learn: 'التعلم',
};

export function Breadcrumb() {
  const pathname = usePathname();
  if (!pathname || pathname === '/dashboard') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = routeLabels[seg] || (seg.length > 20 ? seg.slice(0, 8) + '...' : seg);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-400 mb-4">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          {crumb.isLast ? (
            <span className="text-gray-700 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
