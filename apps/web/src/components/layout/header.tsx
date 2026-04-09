'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User, Settings, CheckCheck, BookOpen, Users as UsersIcon, X, Menu } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{ courses: any[]; users: any[] }>({ courses: [], users: [] });
  const [showSearch, setShowSearch] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    api.get('/notifications?limit=5').then(res => {
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setShowSearch(false);
      setSearchResults({ courses: [], users: [] });
      return;
    }
    setShowSearch(true);
    setSearching(true);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const [coursesRes, usersRes] = await Promise.allSettled([
          api.get(`/courses?search=${encodeURIComponent(query)}&limit=5&status=PUBLISHED`),
          api.get(`/users?search=${encodeURIComponent(query)}&limit=5`),
        ]);
        setSearchResults({
          courses: coursesRes.status === 'fulfilled' ? coursesRes.value.data?.data || [] : [],
          users: usersRes.status === 'fulfilled' ? usersRes.value.data?.data || [] : [],
        });
      } catch {} finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const navigateTo = (path: string) => {
    setShowSearch(false);
    setSearchQuery('');
    router.push(path);
  };

  const markAllRead = () => {
    api.post('/notifications/mark-all-read').then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }).catch(() => {});
  };

  const hasResults = searchResults.courses.length > 0 || searchResults.users.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        )}
      {/* Search */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="بحث في الدورات والمستخدمين..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.trim() && setShowSearch(true)}
          className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pr-10 pl-8 text-sm text-right placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          dir="rtl"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}

        {showSearch && (
          <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            {searching ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">جاري البحث...</div>
            ) : !hasResults ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">لا توجد نتائج</div>
            ) : (
              <>
                {searchResults.courses.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">الدورات</p>
                    {searchResults.courses.map(c => (
                      <button key={c.id} onClick={() => navigateTo(`/courses/${c.id}`)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-right">
                        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{c.titleAr}</p>
                          <p className="text-xs text-gray-400">{c.instructor?.nameAr}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">��لمستخدمين</p>
                    {searchResults.users.map(u => (
                      <button key={u.id} onClick={() => navigateTo('/users')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-right">
                        <UsersIcon className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{u.nameAr}</p>
                          <p className="text-xs text-gray-400" dir="ltr">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

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
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد إش��ارات</p>
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
                onSelect={() => router.push('/settings')}
              >
                <User className="h-4 w-4" />
                <span>الملف الش��صي</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100"
                onSelect={() => router.push('/settings')}
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
