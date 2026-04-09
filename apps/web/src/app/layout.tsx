import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة التعلم - المركز الخليجي للوقاية من الأمراض ومكافحتها',
  description: 'نظام إدارة التعلم - المركز الخليجي للوقاية من الأمراض ومكافحتها',
};

const themeScript = `
  (function() {
    var t = localStorage.getItem('lms-theme');
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
