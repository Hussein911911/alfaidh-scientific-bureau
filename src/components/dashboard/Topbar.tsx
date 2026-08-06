'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, User as UserIcon, Bell } from 'lucide-react';
import { ROLE_NAMES_AR } from '@/lib/permissions';
import { Sidebar } from './Sidebar';
import { UserRole } from '@/lib/auth';

interface TopbarUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export function Topbar({ user }: { user: TopbarUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-medical-900 truncate">
                مرحباً، {user.fullName}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {ROLE_NAMES_AR[user.role]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-400 to-pharma-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{user.fullName}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar role={user.role} />
          </div>
        </div>
      )}
    </>
  );
}
