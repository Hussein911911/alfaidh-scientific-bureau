'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Printer, Filter, Download, Pill, Barcode, Package } from 'lucide-react';
import { MedicineFormNamesAr, MedicineStatusNamesAr, type MedicineForm, type MedicineStatus } from '@/lib/medicine-helpers';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MedicineModal } from './MedicineModal';

const FORMS = Object.keys(MedicineFormNamesAr) as MedicineForm[];
const STATUSES = Object.keys(MedicineStatusNamesAr) as MedicineStatus[];

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
  category?: { name: string } | null;
  manufacturer?: { name: string } | null;
  createdBy?: { fullName: string };
}

export function MedicinesView({
  medicines: initialMedicines,
  categories,
  manufacturers,
  permissions,
  currentUserId,
}: {
  medicines: Medicine[];
  categories: { id: string; name: string }[];
  manufacturers: { id: string; name: string }[];
  permissions: { canCreate: boolean; canEdit: boolean; canDelete: boolean; canPrint: boolean };
  currentUserId: string;
}) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterForm, setFilterForm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !m.tradeName.toLowerCase().includes(s) &&
          !m.scientificName.toLowerCase().includes(s) &&
          !(m.barcode && m.barcode.includes(s))
        ) return false;
      }
      if (filterCategory && m.category?.name !== filterCategory) return false;
      if (filterForm && m.form !== filterForm) return false;
      if (filterStatus && m.status !== filterStatus) return false;
      return true;
    });
  }, [medicines, search, filterCategory, filterForm, filterStatus]);

  function openAdd() {
    setEditingMedicine(null);
    setModalOpen(true);
  }

  function openEdit(med: Medicine) {
    setEditingMedicine(med);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
    try {
      const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedicines(medicines.filter((m) => m.id !== id));
      } else {
        alert('فشل حذف الدواء');
      }
    } catch {
      alert('حدث خطأ');
    }
  }

  function handleSave(saved: Medicine) {
    if (editingMedicine) {
      setMedicines(medicines.map((m) => (m.id === saved.id ? saved : m)));
    } else {
      setMedicines([saved, ...medicines]);
    }
    setModalOpen(false);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 no-print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
            <Pill className="w-7 h-7 text-medical-500" />
            الأدوية
          </h1>
          <p className="text-slate-500 mt-1">إدارة شاملة لقاعدة بيانات الأدوية</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canPrint && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
          )}
          {permissions.canCreate && (
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              إضافة دواء
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم التجاري، العلمي، أو الباركود..."
            className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 text-sm"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterForm}
            onChange={(e) => setFilterForm(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 text-sm"
          >
            <option value="">كل الأشكال</option>
            {FORMS.map((k) => (
              <option key={k} value={k}>{MedicineFormNamesAr[k]}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-400 text-sm"
          >
            <option value="">كل الحالات</option>
            {STATUSES.map((k) => (
              <option key={k} value={k}>{MedicineStatusNamesAr[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        عرض <span className="font-bold text-medical-700">{filtered.length}</span> من {medicines.length} دواء
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">الاسم التجاري</th>
                <th className="px-4 py-3 text-right font-semibold">الاسم العلمي</th>
                <th className="px-4 py-3 text-right font-semibold">الشكل</th>
                <th className="px-4 py-3 text-right font-semibold">التركيز</th>
                <th className="px-4 py-3 text-right font-semibold">المخزون</th>
                <th className="px-4 py-3 text-right font-semibold">سعر البيع</th>
                <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد أدوية</p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-medical-900">{m.tradeName}</div>
                      {m.manufacturer && (
                        <div className="text-xs text-slate-500">{m.manufacturer.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{m.scientificName}</td>
                    <td className="px-4 py-3 text-slate-600">{MedicineFormNamesAr[m.form]}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.strength}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        m.currentStock <= m.minStock
                          ? 'bg-red-100 text-red-700'
                          : m.currentStock <= m.minStock * 2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-medical-700">{formatCurrency(m.sellPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        m.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        m.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' :
                        m.status === 'EXPIRED' ? 'bg-slate-100 text-slate-700' :
                        m.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {MedicineStatusNamesAr[m.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingMedicine(m)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {permissions.canEdit && (
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 rounded transition"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Modal */}
      {modalOpen && (
        <MedicineModal
          medicine={editingMedicine}
          categories={categories}
          manufacturers={manufacturers}
          currentUserId={currentUserId}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* View Modal */}
      {viewingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewingMedicine(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-medical-900">{viewingMedicine.tradeName}</h3>
              <button onClick={() => setViewingMedicine(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-xs">الاسم العلمي</p>
                  <p className="font-bold text-medical-900">{viewingMedicine.scientificName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">التركيز</p>
                  <p className="font-bold">{viewingMedicine.strength}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">الشكل الصيدلاني</p>
                  <p className="font-bold">{MedicineFormNamesAr[viewingMedicine.form]}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">التصنيف</p>
                  <p className="font-bold">{viewingMedicine.category?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">الشركة المصنعة</p>
                  <p className="font-bold">{viewingMedicine.manufacturer?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">الباركود</p>
                  <p className="font-mono">{viewingMedicine.barcode || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">سعر الشراء</p>
                  <p className="font-bold">{formatCurrency(viewingMedicine.costPrice)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">سعر البيع</p>
                  <p className="font-bold text-medical-700 text-lg">{formatCurrency(viewingMedicine.sellPrice)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">المخزون الحالي</p>
                  <p className="font-bold">{viewingMedicine.currentStock}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">الحد الأدنى</p>
                  <p className="font-bold">{viewingMedicine.minStock}</p>
                </div>
              </div>

              {viewingMedicine.description && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">الوصف</p>
                  <p className="text-slate-700">{viewingMedicine.description}</p>
                </div>
              )}
              {viewingMedicine.dosage && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">الجرعة</p>
                  <p className="text-slate-700">{viewingMedicine.dosage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
