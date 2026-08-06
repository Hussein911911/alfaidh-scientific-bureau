'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/auth';
import { hasPermission, Permission, ROLE_NAMES_AR } from '@/lib/permissions';
import {
  Pill, LayoutDashboard, Database, ShoppingCart, Truck, Wallet, Users,
  MapPin, FlaskConical, ClipboardCheck, Settings, Shield, BarChart3,
  PackageSearch, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  permissions?: Permission[];
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  {
    href: '/dashboard/medicines',
    label: 'الأدوية',
    icon: Database,
    permission: 'medicine:view',
  },
  {
    href: '/dashboard/sales',
    label: 'المبيعات',
    icon: ShoppingCart,
    permission: 'sale:view',
  },
  {
    href: '/dashboard/purchases',
    label: 'المشتريات',
    icon: Truck,
    permission: 'purchase:view',
  },
  {
    href: '/dashboard/inventory',
    label: 'المخزون',
    icon: PackageSearch,
    permission: 'stock:view',
  },
  {
    href: '/dashboard/accounting',
    label: 'المحاسبة',
    icon: Wallet,
    permission: 'accounting:view',
  },
  {
    href: '/dashboard/debts',
    label: 'الديون',
    icon: FileText,
    permission: 'debt:manage',
  },
  {
    href: '/dashboard/reports',
    label: 'التقارير',
    icon: BarChart3,
    permission: 'report:view',
  },
  {
    href: '/dashboard/trips',
    label: 'الرحلات',
    icon: MapPin,
    permission: 'trip:view',
  },
  {
    href: '/dashboard/scientific',
    label: 'المراجعة العلمية',
    icon: FlaskConical,
    permission: 'medicine:review',
  },
  {
    href: '/dashboard/users',
    label: 'المستخدمون',
    icon: Users,
    permission: 'user:view',
  },
  {
    href: '/dashboard/audit',
    label: 'سجل النشاط',
    icon: ClipboardCheck,
    permission: 'settings:manage',
  },
  {
    href: '/dashboard/settings',
    label: 'الإعدادات',
    icon: Settings,
    permission: 'settings:manage',
  },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const visibleItems = MENU_ITEMS.filter((item) => {
    if (!item.permission && !item.permissions) return true;
    if (item.permission) return hasPermission(role, item.permission);
    if (item.permissions) return item.permissions.some((p) => hasPermission(role, p));
    return false;
  });

  return (
    <aside className="hidden lg:flex w-72 bg-white border-l border-slate-200 flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-medical-900 text-sm">الفيض الدوائي</h1>
            <p className="text-xs text-slate-500">العلمي</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className="px-3 py-2 bg-gradient-to-l from-medical-50 to-pharma-50 border border-medical-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-medical-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">دورك الحالي</p>
              <p className="text-sm font-bold text-medical-800 truncate">{ROLE_NAMES_AR[role]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-gradient-to-l from-medical-500 to-medical-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-medical-700'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-medical-500')} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">v1.0 © 2026</p>
      </div>
    </aside>
  );
}
