import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'الفيض الدوائي العلمي | Alfaidh Scientific Bureau',
  description: 'منصة متكاملة لإدارة الأدوية والصيدليات - نظام شامل للمخزون والمبيعات والمشتريات والمحاسبة',
  keywords: 'صيدلية, أدوية, إدارة, مخزون, مبيعات, محاسبة, pharma, medicine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
