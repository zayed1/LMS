import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GCDC - نظام إدارة التعلم',
  description: 'نظام إدارة التعلم الخاص بمركز الخليج للتطوير والتدريب',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
