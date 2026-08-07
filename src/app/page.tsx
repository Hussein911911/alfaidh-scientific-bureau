import Link from 'next/link';
import { Pill, Database, Users, ShoppingCart, FileText, TrendingUp, Shield, Truck, FlaskConical, ClipboardCheck, Wallet, MapPin } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: Database, title: 'قاعدة بيانات شاملة', desc: 'تخزين آلاف الأدوية مع كل المعلومات العلمية' },
    { icon: Users, title: '9 رتب وصلاحيات', desc: 'نظام صلاحيات متقدم لكل دور في المنصة' },
    { icon: ShoppingCart, title: 'إدارة المبيعات', desc: 'فواتير ومبيعات وطباعة احترافية' },
    { icon: Truck, title: 'إدارة المشتريات', desc: 'تتبع الطلبات والموردين' },
    { icon: Wallet, title: 'المحاسبة والديون', desc: 'إدارة الأموال والديون والتقارير المالية' },
    { icon: ClipboardCheck, title: 'إدارة المخزون', desc: 'جرد وتنبيهات النفاد والصلاحية' },
    { icon: FlaskConical, title: 'المراجعة العلمية', desc: 'مراجعة المعلومات العلمية واعتماد الأدوية' },
    { icon: MapPin, title: 'إدارة الرحلات', desc: 'جدولة الرحلات وتتبع السائقين' },
  ];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-medical-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-xl flex items-center justify-center shadow-lg">
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-medical-900">الفيض الدوائي العلمي</h1>
              <p className="text-xs text-medical-600">Alfaidh Scientific Bureau</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/setup"
              className="px-5 py-2.5 text-medical-700 hover:text-medical-900 font-medium transition-colors"
            >
              الإعداد
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 text-medical-700 hover:text-medical-900 font-medium transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-medical-50 border border-medical-200 rounded-full text-medical-700 text-sm font-medium mb-6 animate-fade-in">
          <Shield className="w-4 h-4" />
          <span>منصة علمية احترافية للصيدليات</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-medical-900 mb-6 animate-fade-in">
          نظام شامل لإدارة
          <span className="block bg-gradient-to-l from-medical-600 to-pharma-600 bg-clip-text text-transparent mt-2">
            الأدوية والصيدليات
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in">
          منصة متكاملة تجمع بين إدارة المخزون الدوائي، المبيعات، المشتريات، المحاسبة، وإدارة الموظفين -
          كل ما تحتاجه لإدارة صيدليتك في مكان واحد.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Pill className="w-5 h-5" />
            الدخول للمنصة
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-medical-200 text-medical-700 rounded-xl font-bold text-lg hover:border-medical-400 hover:bg-medical-50 transition-all"
          >
            تعرف على المميزات
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-medical-900 mb-3">المميزات الكاملة</h2>
          <p className="text-slate-600 text-lg">كل ما تحتاجه لإدارة صيدليتك بشكل احترافي</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-medical-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-medical-100 to-pharma-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-medical-600" />
              </div>
              <h3 className="text-lg font-bold text-medical-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-medical-900 mb-3">9 رتب متخصصة</h2>
          <p className="text-slate-600 text-lg">نظام صلاحيات متقدم يناسب كل دور في فريقك</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { role: 'المدير العام', desc: 'كل الصلاحيات', color: 'from-red-500 to-pink-500' },
            { role: 'المحاسب', desc: 'إدارة الأموال والديون', color: 'from-emerald-500 to-teal-500' },
            { role: 'مدير المبيعات والمشتريات', desc: 'إدارة المبيعات والمشتريات', color: 'from-blue-500 to-cyan-500' },
            { role: 'مساعد الصيدلية', desc: 'تجهيز الفواتير والقوائم', color: 'from-sky-500 to-blue-500' },
            { role: 'المخزّن', desc: 'إدارة المخزون والجرد', color: 'from-amber-500 to-orange-500' },
            { role: 'المراجع العلمي', desc: 'مراجعة المعلومات العلمية', color: 'from-purple-500 to-indigo-500' },
            { role: 'السائق', desc: 'إدارة التوصيل', color: 'from-slate-500 to-gray-500' },
            { role: 'مسؤول الرحلات', desc: 'جدولة الرحلات', color: 'from-indigo-500 to-violet-500' },
            { role: 'المتصفح', desc: 'عرض فقط', color: 'from-gray-400 to-slate-500' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${r.color} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold text-medical-900">{r.role}</h3>
                <p className="text-sm text-slate-600">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-medical-600 to-pharma-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">جاهز للبدء؟</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            انضم إلى منصة الفيض الدوائي العلمي وابدأ في إدارة صيدليتك بشكل احترافي
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-medical-700 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            <FileText className="w-5 h-5" />
            الدخول الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-600">
          <p>© 2026 منصة الفيض الدوائي العلمي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </main>
  );
}
