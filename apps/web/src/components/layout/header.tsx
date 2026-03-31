'use client';

import * as React from 'react';
import { Bell, Search, LogOut, User, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');

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
        <button
          className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-gray-100">
              <Avatar.Root className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary">
                <Avatar.Image
                  src={user?.avatarUrl}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                />
                <Avatar.Fallback className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || 'م'}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || 'مستخدم'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || 'مشرف'}
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
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100">
                <User className="h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100">
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
