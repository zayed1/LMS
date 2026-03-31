'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">GCDC</h1>
        <p className="mt-4 text-lg text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
