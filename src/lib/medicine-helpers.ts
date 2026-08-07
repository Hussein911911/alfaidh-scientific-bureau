// مساعدات للأدوية - تسميات عربية
export type MedicineForm =
  | 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT'
  | 'DROPS' | 'INHALER' | 'SUPPOSITORY' | 'POWDER' | 'SOLUTION' | 'SPRAY' | 'PATCH' | 'OTHER';

export type MedicineStatus =
  | 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK' | 'EXPIRED' | 'PENDING_REVIEW';

export const MedicineFormNamesAr: Record<MedicineForm, string> = {
  TABLET: 'أقراص',
  CAPSULE: 'كبسولات',
  SYRUP: 'شراب',
  INJECTION: 'حقن',
  CREAM: 'كريم',
  OINTMENT: 'مرهم',
  DROPS: 'قطرات',
  INHALER: 'بخاخ',
  SUPPOSITORY: 'تحاميل',
  POWDER: 'بودرة',
  SOLUTION: 'محلول',
  SPRAY: 'رذاذ',
  PATCH: 'لصقات',
  OTHER: 'أخرى',
};

export const MedicineStatusNamesAr: Record<MedicineStatus, string> = {
  ACTIVE: 'متوفر',
  DISCONTINUED: 'متوقف',
  OUT_OF_STOCK: 'نفذ',
  EXPIRED: 'منتهي',
  PENDING_REVIEW: 'قيد المراجعة',
};
