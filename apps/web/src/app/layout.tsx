import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة التعلم - المركز الخليجي للوقاية من الأمراض ومكافحتها',
  description: 'نظام إدارة التعلم - المركز الخليجي للوقاية من الأمراض ومكافحتها',
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
