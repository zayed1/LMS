'use client';

import * as React from 'react';
import { Bell, Search, LogOut, User, Settings, CheckCheck } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export function Header() {
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    api.get('/notifications?limit=5').then(res => {
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const markAllRead = () => {
    api.post('/notifications/mark-all-read').then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }).catch(() => {});
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pr-10 pl-4 text-sm text-right placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          dir="rtl"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-80 rounded-md border border-gray-200 bg-white shadow-lg"
              sideOffset={8}
              align="end"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">الإشعارات</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                    <CheckCheck className="h-3 w-3" /> قراءة الكل
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد إشعارات</p>
                ) : (
                  notifications.map((n: any) => (
                    <DropdownMenu.Item key={n.id} className="flex gap-3 px-3 py-2.5 text-sm outline-none hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                      <div>
                        <p className="text-gray-800 font-medium text-xs">{n.titleAr}</p>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{n.messageAr}</p>
                        <p className="text-gray-300 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </DropdownMenu.Item>
                  ))
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-gray-100">
              <Avatar.Root className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary">
                <Avatar.Fallback className="text-sm font-medium text-white">
                  {user?.nameAr?.charAt(0) || user?.name?.charAt(0) || 'م'}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.nameAr || user?.name || 'مستخدم'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'SUPER_ADMIN' ? 'مدير النظام' : user?.role || 'مشرف'}
                </p>
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-md border border-gray-200 bg-white p-1.5 shadow-lg"
              sideOffset={8}
              align="end"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100"
                onSelect={() => window.location.href = '/settings'}
              >
                <User className="h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100"
                onSelect={() => window.location.href = '/settings'}
              >
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-danger outline-none transition-colors hover:bg-danger/10"
                onSelect={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
