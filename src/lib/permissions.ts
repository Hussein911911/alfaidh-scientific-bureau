// نظام الصلاحيات - Role-Based Access Control (RBAC)

import { UserRole } from './auth';

export const PERMISSIONS = {
  MEDICINE_VIEW: 'medicine:view',
  MEDICINE_CREATE: 'medicine:create',
  MEDICINE_UPDATE: 'medicine:update',
  MEDICINE_DELETE: 'medicine:delete',
  MEDICINE_REVIEW: 'medicine:review',
  MEDICINE_PRINT: 'medicine:print',

  STOCK_VIEW: 'stock:view',
  STOCK_MANAGE: 'stock:manage',

  SALE_VIEW: 'sale:view',
  SALE_CREATE: 'sale:create',
  SALE_UPDATE: 'sale:update',
  SALE_CANCEL: 'sale:cancel',
  SALE_PRINT: 'sale:print',

  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_UPDATE: 'purchase:update',
  PURCHASE_RECEIVE: 'purchase:receive',

  ACCOUNTING_VIEW: 'accounting:view',
  ACCOUNTING_MANAGE: 'accounting:manage',
  DEBT_MANAGE: 'debt:manage',
  REPORT_VIEW: 'report:view',
  REPORT_FINANCIAL: 'report:financial',

  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  TRIP_VIEW: 'trip:view',
  TRIP_CREATE: 'trip:create',
  TRIP_MANAGE: 'trip:manage',
  DELIVERY_UPDATE: 'delivery:update',

  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS) as Permission[],

  ACCOUNTANT: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.SALE_PRINT,
    PERMISSIONS.PURCHASE_VIEW,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ACCOUNTING_MANAGE,
    PERMISSIONS.DEBT_MANAGE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_FINANCIAL,
  ],

  SALES_MANAGER: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.MEDICINE_CREATE,
    PERMISSIONS.MEDICINE_UPDATE,
    PERMISSIONS.MEDICINE_PRINT,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_MANAGE,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.SALE_CREATE,
    PERMISSIONS.SALE_UPDATE,
    PERMISSIONS.SALE_CANCEL,
    PERMISSIONS.SALE_PRINT,
    PERMISSIONS.PURCHASE_VIEW,
    PERMISSIONS.PURCHASE_CREATE,
    PERMISSIONS.PURCHASE_UPDATE,
    PERMISSIONS.PURCHASE_RECEIVE,
    PERMISSIONS.REPORT_VIEW,
  ],

  ASSISTANT: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.MEDICINE_CREATE,
    PERMISSIONS.MEDICINE_UPDATE,
    PERMISSIONS.MEDICINE_PRINT,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.SALE_CREATE,
    PERMISSIONS.SALE_PRINT,
  ],

  STOREKEEPER: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.MEDICINE_UPDATE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_MANAGE,
    PERMISSIONS.PURCHASE_VIEW,
    PERMISSIONS.PURCHASE_RECEIVE,
    PERMISSIONS.REPORT_VIEW,
  ],

  SCIENTIFIC_REVIEWER: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.MEDICINE_UPDATE,
    PERMISSIONS.MEDICINE_REVIEW,
    PERMISSIONS.MEDICINE_PRINT,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],

  DRIVER: [
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.TRIP_VIEW,
    PERMISSIONS.DELIVERY_UPDATE,
  ],

  TRIP_COORDINATOR: [
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.TRIP_VIEW,
    PERMISSIONS.TRIP_CREATE,
    PERMISSIONS.TRIP_MANAGE,
    PERMISSIONS.DELIVERY_UPDATE,
  ],

  VIEWER: [
    PERMISSIONS.MEDICINE_VIEW,
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export const ROLE_NAMES_AR: Record<UserRole, string> = {
  ADMIN: 'المدير العام',
  ACCOUNTANT: 'المحاسب',
  SALES_MANAGER: 'مدير المبيعات والمشتريات',
  ASSISTANT: 'مساعد الصيدلية',
  STOREKEEPER: 'المخزّن',
  SCIENTIFIC_REVIEWER: 'المراجع العلمي',
  DRIVER: 'السائق',
  TRIP_COORDINATOR: 'مسؤول الرحلات',
  VIEWER: 'المتصفح',
};
