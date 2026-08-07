'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, Clock, CheckCircle2, TrendingUp, MapPin, Phone,
  Package, Calendar, Camera, PenLine, X, ChevronRight, Loader2,
  AlertTriangle, PlayCircle, Flag, CheckCheck, MessageSquare,
  Bell, BarChart3, DollarSign, Star, Send, Radio, Wifi,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Trip {
  id: string;
  tripNumber: string;
  startLocation: string | null;
  endLocation: string | null;
  customerPhone: string | null;
  amountToCollect: string | null;
  startDate: string;
  endDate: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
}

const STATUS_INFO = {
  PLANNED: { label: 'مجدولة', color: 'bg-blue-100 text-blue-700', icon: Clock },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-amber-100 text-amber-700', icon: PlayCircle },
  COMPLETED: { label: 'مكتملة', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  CANCELLED: { label: 'ملغاة', color: 'bg-red-100 text-red-700', icon: X },
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: string;
  message: string;
  createdAt: string;
}

interface Stats {
  todaysTrips: number;
  weekTrips: number;
  monthTrips: number;
  completedThisWeek: number;
  cancelledThisWeek: number;
  successRate: number;
  totalCommissions: number;
  unpaidCommissions: number;
  averageRating: number;
}

export function DriverDashboard({
  stats: initialStats,
  activeTripsList,
  deliveryHistory,
  driverName,
}: {
  stats: Stats;
  activeTripsList: Trip[];
  deliveryHistory: Trip[];
  driverName: string;
}) {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tab, setTab] = useState<'active' | 'history' | 'stats'>('active');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gpsActive, setGpsActive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // تتبع GPS المباشر
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // كل 30 ثانية
    return () => {
      clearInterval(interval);
      stopGPS();
    };
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {}
  }

  // تشغيل/إيقاف تتبع GPS
  function toggleGPS() {
    if (gpsActive) {
      stopGPS();
    } else {
      startGPS();
    }
  }

  function startGPS() {
    if (!navigator.geolocation) {
      alert('GPS غير متوفر في جهازك');
      return;
    }
    setGpsActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await fetch('/api/driver/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0,
            }),
          });
        } catch {}
      },
      (err) => {
        console.error('GPS error:', err);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }

  function stopGPS() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }

  async function updateTripStatus(tripId: string, newStatus: string, notes?: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        router.refresh();
        setSelectedTrip(null);
        setShowProofModal(false);
        // تحديث الإحصائيات
        fetch('/api/driver/stats').then(r => r.json()).then(d => setStats(d.stats));
      } else {
        alert('فشل تحديث الحالة');
      }
    } catch {
      alert('حدث خطأ');
    } finally {
      setUpdating(false);
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header مع زر GPS والإشعارات */}
      <div className="bg-gradient-to-l from-medical-500 via-medical-600 to-pharma-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6" />
            <span className="text-sm opacity-90">لوحة السائق</span>
          </div>
          <div className="flex items-center gap-2">
            {/* زر GPS */}
            <button
              onClick={toggleGPS}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                gpsActive
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {gpsActive ? <Wifi className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
              {gpsActive ? 'GPS مفعّل' : 'GPS معطّل'}
            </button>
            {/* زر الإشعارات */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">أهلاً {driverName} 👋</h1>
        <p className="opacity-90 text-sm">
          {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Truck} title="رحلات اليوم" value={stats.todaysTrips} color="from-blue-500 to-cyan-500" bg="bg-blue-50" />
        <StatCard icon={PlayCircle} title="نشطة الآن" value={activeTripsList.length} color="from-amber-500 to-orange-500" bg="bg-amber-50" />
        <StatCard icon={CheckCheck} title="مكتملة (أسبوع)" value={stats.completedThisWeek} color="from-emerald-500 to-teal-500" bg="bg-emerald-50" />
        <StatCard icon={TrendingUp} title="نسبة النجاح" value={`${stats.successRate}%`} color="from-purple-500 to-indigo-500" bg="bg-purple-50" />
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SmallStat label="هذا الأسبوع" value={stats.weekTrips} />
        <SmallStat label="هذا الشهر" value={stats.monthTrips} />
        <SmallStat label="إجمالي العمولات" value={formatCurrency(stats.totalCommissions)} highlight />
        <SmallStat label="متوسط التقييم" value={stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ⭐` : 'لا يوجد'} />
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'active', label: 'النشطة', count: activeTripsList.length, icon: Truck },
            { key: 'history', label: 'السجل', count: deliveryHistory.length, icon: Clock },
            { key: 'stats', label: 'الإحصائيات', count: null, icon: BarChart3 },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex-1 px-3 py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
                  tab === t.key
                    ? 'bg-medical-50 text-medical-700 border-b-2 border-medical-500'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count !== null && (
                  <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {tab === 'active' && (
            activeTripsList.length === 0 ? (
              <EmptyState icon={Truck} title="لا توجد رحلات نشطة" description="استرح أو راجع السجل." />
            ) : (
              <div className="space-y-3">
                {activeTripsList.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onClick={() => setSelectedTrip(trip)} />
                ))}
              </div>
            )
          )}
          {tab === 'history' && (
            deliveryHistory.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="لا يوجد سجل بعد" description="ستظهر هنا كل الرحلات المكتملة." />
            ) : (
              <div className="space-y-3">
                {deliveryHistory.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onClick={() => setSelectedTrip(trip)} />
                ))}
              </div>
            )
          )}
          {tab === 'stats' && <DriverStatsView stats={stats} />}
        </div>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onUpdate={updateTripStatus}
          onShowProof={() => setShowProofModal(true)}
          onShowChat={() => setShowChatModal(true)}
          updating={updating}
        />
      )}

      {/* Proof of Delivery Modal */}
      {showProofModal && selectedTrip && (
        <ProofOfDeliveryModal
          trip={selectedTrip}
          onClose={() => setShowProofModal(false)}
          onSubmit={(proof) => {
            const notes = JSON.stringify({ proof, completedAt: new Date().toISOString() });
            updateTripStatus(selectedTrip.id, 'COMPLETED', notes);
          }}
          updating={updating}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && selectedTrip && (
        <ChatModal
          trip={selectedTrip}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onRead={async (id) => {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: id }),
            });
            loadNotifications();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, bg }: any) {
  return (
    <div className={`${bg} border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-shadow`}>
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs text-slate-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SmallStat({ label, value, highlight }: any) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const info = STATUS_INFO[trip.status];
  const Icon = info.icon;
  return (
    <button
      onClick={onClick}
      className="w-full text-right p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-xs text-slate-500">{trip.tripNumber}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${info.color} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {info.label}
            </span>
            {trip.amountToCollect && Number(trip.amountToCollect) > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(Number(trip.amountToCollect))}
              </span>
            )}
          </div>
          {trip.endLocation && (
            <div className="flex items-center gap-1 text-sm text-slate-700 mb-1">
              <MapPin className="w-3.5 h-3.5 text-medical-500" />
              <span className="truncate">{trip.endLocation}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {new Date(trip.startDate).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-medical-500 group-hover:translate-x-[-2px] transition-all flex-shrink-0" />
      </div>
    </button>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-slate-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-medical-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function DriverStatsView({ stats }: { stats: Stats }) {
  const max = Math.max(stats.weekTrips, 1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">إجمالي العمولات</p>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalCommissions)}</p>
          <p className="text-xs text-emerald-700 mt-1">غير مدفوع: {formatCurrency(stats.unpaidCommissions)}</p>
        </div>
        <div className="p-4 bg-gradient-to-l from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">متوسط التقييم</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            <span className="text-base text-amber-600"> / 5</span>
          </p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i <= Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-bold text-medical-800 mb-3">أداء الأسبوع</p>
        <div className="space-y-2">
          <Bar label="مكتملة" value={stats.completedThisWeek} max={max} color="bg-emerald-500" />
          <Bar label="ملغاة" value={stats.cancelledThisWeek} max={max} color="bg-red-500" />
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between text-xs">
          <span className="text-slate-600">إجمالي الأسبوع</span>
          <span className="font-bold text-medical-800">{stats.weekTrips} رحلة</span>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: any) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TripDetailModal({ trip, onClose, onUpdate, onShowProof, onShowChat, updating }: any) {
  const info = STATUS_INFO[trip.status as keyof typeof STATUS_INFO];
  const Icon = info.icon;
  const isActive = trip.status === 'PLANNED' || trip.status === 'IN_PROGRESS';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-slate-500">{trip.tripNumber}</span>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${info.color}`}>
            <Icon className="w-3 h-3" />
            {info.label}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {trip.endLocation && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">عنوان التوصيل</p>
              <p className="font-bold text-medical-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-medical-500" />
                {trip.endLocation}
              </p>
            </div>
          )}

          {trip.customerPhone && (
            <a
              href={`tel:${trip.customerPhone}`}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">اتصل بالزبون</p>
                <p className="font-bold text-blue-700" dir="ltr">{trip.customerPhone}</p>
              </div>
            </a>
          )}

          {trip.amountToCollect && Number(trip.amountToCollect) > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-700 mb-1 font-bold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                المبلغ المطلوب تحصيله
              </p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(Number(trip.amountToCollect))}</p>
            </div>
          )}

          {trip.notes && !trip.notes.startsWith('{') && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 mb-1 font-bold">ملاحظات</p>
              <p className="text-sm text-amber-900">{trip.notes}</p>
            </div>
          )}

          {isActive && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={onShowChat}
                className="w-full py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                محادثة الزبون
              </button>
              {trip.status === 'PLANNED' && (
                <button
                  onClick={() => onUpdate(trip.id, 'IN_PROGRESS')}
                  disabled={updating}
                  className="w-full py-3 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  بدء الرحلة
                </button>
              )}
              {trip.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={onShowProof}
                    disabled={updating}
                    className="w-full py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCheck className="w-4 h-4" />
                    تأكيد التسليم
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('سبب فشل التسميل:');
                      if (reason) onUpdate(trip.id, 'CANCELLED', reason);
                    }}
                    disabled={updating}
                    className="w-full py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    فشل التسليم
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProofOfDeliveryModal({ trip, onClose, onSubmit, updating }: any) {
  const [signature, setSignature] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  function getLocation() {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      alert('GPS غير متوفر');
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
      },
      () => { alert('فشل الحصول على الموقع'); setGettingLocation(false); }
    );
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!signature.trim()) {
      alert('يرجى إدخال اسم المستلم');
      return;
    }
    onSubmit({ signature, photo, location, notes, timestamp: new Date().toISOString() });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-medical-900 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-500" />
              إثبات التسليم
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستلم *</label>
            <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">صورة</label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2 text-sm">
                <Camera className="w-4 h-4" />
                {photo ? '✓ تم' : 'التقاط صورة'}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              </label>
              {photo && <img src={photo} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الموقع</label>
            <button onClick={getLocation} disabled={gettingLocation}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2 text-sm">
              {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {location ? `✓ ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'تسجيل الموقع'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>
          <button onClick={submit} disabled={updating}
            className="w-full py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            تأكيد التسليم
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [trip.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`/api/messages?tripId=${trip.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id, message: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        loadMessages();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-medical-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              محادثة الزبون
            </h3>
            <p className="text-xs text-slate-500">{trip.tripNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">لا توجد رسائل. ابدأ المحادثة!</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderType === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  m.senderType === 'driver'
                    ? 'bg-medical-500 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  <p>{m.message}</p>
                  <p className={`text-[10px] mt-0.5 ${m.senderType === 'driver' ? 'text-medical-100' : 'text-slate-500'}`}>
                    {new Date(m.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب رسالة..."
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-400 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-medical-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-1"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel({ notifications, onClose, onRead }: any) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex items-center justify-between">
          <h3 className="font-bold text-medical-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            التنبيهات ({notifications.length})
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد تنبيهات</p>
            </div>
          ) : (
            notifications.map((n: Notification) => (
              <button
                key={n.id}
                onClick={() => onRead(n.id)}
                className={`w-full text-right p-3 rounded-xl border transition ${
                  n.isRead ? 'bg-white border-slate-200' : 'bg-medical-50 border-medical-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-medical-900">{n.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
