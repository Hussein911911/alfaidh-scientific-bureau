# منصة الفيض الدوائي العلمي | Alfaidh Scientific Bureau

> منصة متكاملة لإدارة الأدوية والصيدليات - Scientific Pharmaceutical Management Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHussein911911%2Falfaidh-scientific-bureau)

## 🌐 النشر بنقرة واحدة على Vercel

1. انقر الزر أعلاه
2. اختر مستودع `Hussein911911/alfaidh-scientific-bureau`
3. أضف قاعدة بيانات Neon (مجانية) واحصل على `DATABASE_URL`
4. أضف `DATABASE_URL` كـ Environment Variable في Vercel
5. انتظر Deploy → احصل على رابط عام!

## ✨ المميزات

### 📦 إدارة الأدوية
- تخزين شامل للأدوية مع كل المعلومات العلمية
- بحث وفلترة متقدمة (بالاسم، التصنيف، الشكل، الحالة)
- إضافة/تعديل/حذف الأدوية
- عرض تفصيلي لكل دواء مع المعلومات العلمية الكاملة
- طباعة قوائم الأدوية

### 👥 نظام 9 رتب متقدم
1. **المدير العام** (`ADMIN`) - كل الصلاحيات
2. **المحاسب** (`ACCOUNTANT`) - إدارة الأموال والديون
3. **مدير المبيعات والمشتريات** (`SALES_MANAGER`) - إدارة المبيعات والمشتريات
4. **مساعد الصيدلية** (`ASSISTANT`) - تجهيز الفواتير وطباعة القوائم
5. **المخزّن** (`STOREKEEPER`) - إدارة المخزون والجرد
6. **المراجع العلمي** (`SCIENTIFIC_REVIEWER`) - مراجعة المعلومات العلمية
7. **السائق** (`DRIVER`) - إدارة التوصيل
8. **مسؤول الرحلات** (`TRIP_COORDINATOR`) - جدولة الرحلات
9. **المتصفح** (`VIEWER`) - عرض فقط

## 🛠️ التقنيات

- **Next.js 14** - إطار العمل (App Router)
- **TypeScript** - لغة البرمجة
- **Drizzle ORM** - طبقة قاعدة البيانات
- **PostgreSQL** - للإنتاج (Vercel/Neon)
- **PGlite** - للتطوير المحلي (embedded PostgreSQL)
- **jose** - JWT للمصادقة
- **Tailwind CSS** - التصميم
- **Zod** - التحقق من البيانات

## 🚀 التشغيل محلياً

```bash
# 1. تثبيت المكتبات
npm install

# 2. تعبئة قاعدة البيانات بـ 9 مستخدمين و 4 أدوية
npx tsx prisma/seed.ts

# 3. تشغيل
npm run dev
```

ثم افتح [http://localhost:3000](http://localhost:3000)

### للنشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel

# اتبع التعليمات:
# - اربط بحسابك في GitHub
# - اختر المستودع
# - أضف DATABASE_URL في Environment Variables
#   (أنشئ قاعدة بيانات مجانية من https://neon.tech)
# - Deploy!
```

## 🔑 حسابات الدخول (كلمة المرور: `admin123`)

| الرتبة | البريد | اسم المستخدم |
|---|---|---|
| المدير العام | `admin@alfaidh.com` | `admin` |
| المحاسب | `accountant@alfaidh.com` | `accountant` |
| مدير المبيعات والمشتريات | `sales@alfaidh.com` | `sales_manager` |
| مساعد الصيدلية | `assistant@alfaidh.com` | `assistant` |
| المخزّن | `storekeeper@alfaidh.com` | `storekeeper` |
| المراجع العلمي | `reviewer@alfaidh.com` | `reviewer` |
| السائق | `driver@alfaidh.com` | `driver` |
| مسؤول الرحلات | `coordinator@alfaidh.com` | `coordinator` |
| المتصفح | `viewer@alfaidh.com` | `viewer` |

## 📂 بنية المشروع

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # تسجيل دخول/خروج
│   │   └── medicines/ # CRUD الأدوية
│   ├── dashboard/     # صفحات محمية
│   │   ├── medicines/ # إدارة الأدوية
│   │   ├── sales/     # المبيعات
│   │   ├── purchases/ # المشتريات
│   │   ├── inventory/ # المخزون
│   │   ├── accounting/ # المحاسبة
│   │   ├── debts/     # الديون
│   │   ├── trips/     # الرحلات
│   │   ├── users/     # المستخدمون
│   │   └── ...
│   ├── login/         # صفحة تسجيل الدخول
│   └── page.tsx       # الصفحة الرئيسية
├── components/        # مكونات React
├── db/                # مخطط قاعدة البيانات (Drizzle)
└── lib/               # منطق مشترك
    ├── auth.ts        # نظام المصادقة
    ├── db.ts          # اتصال قاعدة البيانات
    └── permissions.ts # نظام الصلاحيات
```

## 📄 الترخيص

جميع الحقوق محفوظة © 2026 منصة الفيض الدوائي العلمي
