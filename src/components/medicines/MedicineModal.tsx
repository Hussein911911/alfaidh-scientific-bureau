'use client';

import { useState } from 'react';
import { X, Loader2, Pill } from 'lucide-react';
import { MedicineFormNamesAr, type MedicineForm, type MedicineStatus } from '@/lib/medicine-helpers';

const FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SPRAY', 'PATCH', 'OTHER'] as const;
const STATUSES = ['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'EXPIRED', 'PENDING_REVIEW'] as const;

interface Medicine {
  id: string;
  tradeName: string;
  scientificName: string;
  barcode: string | null;
  form: MedicineForm;
  strength: string;
  packSize: string | null;
  costPrice: any;
  sellPrice: any;
  currentStock: number;
  minStock: number;
  expiryDate: string | null;
  status: MedicineStatus;
  description: string | null;
  dosage: string | null;
  indications: string | null;
  contraindications: string | null;
  sideEffects: string | null;
  drugInteractions: string | null;
  storage: string | null;
  pregnancyCategory: string | null;
  categoryId?: string | null;
  manufacturerId?: string | null;
}

export function MedicineModal({
  medicine,
  categories,
  manufacturers,
  currentUserId,
  onClose,
  onSave,
}: {
  medicine: Medicine | null;
  categories: { id: string; name: string }[];
  manufacturers: { id: string; name: string }[];
  currentUserId: string;
  onClose: () => void;
  onSave: (m: any) => void;
}) {
  const isEdit = !!medicine;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    tradeName: medicine?.tradeName || '',
    scientificName: medicine?.scientificName || '',
    barcode: medicine?.barcode || '',
    form: medicine?.form || 'TABLET',
    strength: medicine?.strength || '',
    packSize: medicine?.packSize || '',
    costPrice: medicine?.costPrice?.toString() || '0',
    sellPrice: medicine?.sellPrice?.toString() || '0',
    currentStock: medicine?.currentStock?.toString() || '0',
    minStock: medicine?.minStock?.toString() || '10',
    expiryDate: medicine?.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
    status: medicine?.status || 'ACTIVE',
    description: medicine?.description || '',
    dosage: medicine?.dosage || '',
    indications: medicine?.indications || '',
    contraindications: medicine?.contraindications || '',
    sideEffects: medicine?.sideEffects || '',
    drugInteractions: medicine?.drugInteractions || '',
    storage: medicine?.storage || '',
    pregnancyCategory: medicine?.pregnancyCategory || '',
    categoryId: medicine?.categoryId || '',
    manufacturerId: medicine?.manufacturerId || '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = isEdit ? `/api/medicines/${medicine!.id}` : '/api/medicines';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          createdById: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل الحفظ');
        return;
      }

      onSave(data.medicine);
    } catch (err) {
      setError('حدث خطأ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-medical-900">
              {isEdit ? 'تعديل دواء' : 'إضافة دواء جديد'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* المعلومات الأساسية */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-medical-800 mb-3 pb-2 border-b border-slate-100">المعلومات الأساسية</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم التجاري *</label>
                <input
                  type="text" required
                  value={form.tradeName}
                  onChange={(e) => update('tradeName', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم العلمي *</label>
                <input
                  type="text" required
                  value={form.scientificName}
                  onChange={(e) => update('scientificName', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الباركود</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => update('barcode', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الشكل الصيدلاني *</label>
                <select
                  value={form.form}
                  onChange={(e) => update('form', e.target.value as MedicineForm)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                >
                  {FORMS.map((k) => (
                    <option key={k} value={k}>{MedicineFormNamesAr[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التركيز *</label>
                <input
                  type="text" required
                  value={form.strength}
                  onChange={(e) => update('strength', e.target.value)}
                  placeholder="500mg, 1g, ..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">حجم العلبة</label>
                <input
                  type="text"
                  value={form.packSize}
                  onChange={(e) => update('packSize', e.target.value)}
                  placeholder="20 قرص، 100 مل، ..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
            </div>
          </div>

          {/* التصنيف والشركة */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-medical-800 mb-3 pb-2 border-b border-slate-100">التصنيف والشركة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف العلاجي</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                >
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الشركة المصنعة</label>
                <select
                  value={form.manufacturerId}
                  onChange={(e) => update('manufacturerId', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                >
                  <option value="">بدون شركة</option>
                  {manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* الأسعار والمخزون */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-medical-800 mb-3 pb-2 border-b border-slate-100">الأسعار والمخزون</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">سعر الشراء *</label>
                <input
                  type="number" step="0.01" min="0" required
                  value={form.costPrice}
                  onChange={(e) => update('costPrice', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">سعر البيع *</label>
                <input
                  type="number" step="0.01" min="0" required
                  value={form.sellPrice}
                  onChange={(e) => update('sellPrice', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المخزون الحالي</label>
                <input
                  type="number" min="0"
                  value={form.currentStock}
                  onChange={(e) => update('currentStock', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحد الأدنى</label>
                <input
                  type="number" min="0"
                  value={form.minStock}
                  onChange={(e) => update('minStock', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => update('expiryDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as MedicineStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'ACTIVE' ? 'متوفر' :
                       s === 'OUT_OF_STOCK' ? 'نفذ' :
                       s === 'DISCONTINUED' ? 'متوقف' :
                       s === 'EXPIRED' ? 'منتهي' : 'قيد المراجعة'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* المعلومات العلمية */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-medical-800 mb-3 pb-2 border-b border-slate-100">المعلومات العلمية (اختيارية)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الجرعة</label>
                  <textarea
                    value={form.dosage}
                    onChange={(e) => update('dosage', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاستطبابات</label>
                  <textarea
                    value={form.indications}
                    onChange={(e) => update('indications', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">موانع الاستعمال</label>
                  <textarea
                    value={form.contraindications}
                    onChange={(e) => update('contraindications', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الآثار الجانبية</label>
                  <textarea
                    value={form.sideEffects}
                    onChange={(e) => update('sideEffects', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التفاعلات الدوائية</label>
                  <textarea
                    value={form.drugInteractions}
                    onChange={(e) => update('drugInteractions', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ظروف التخزين</label>
                  <textarea
                    value={form.storage}
                    onChange={(e) => update('storage', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-lg hover:shadow-lg transition font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                isEdit ? 'حفظ التعديلات' : 'إضافة الدواء'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
