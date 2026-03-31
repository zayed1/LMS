"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { User, Lock, Bell, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { key: "profile", label: "الملف الشخصي", icon: User },
    { key: "security", label: "الأمان", icon: Lock },
    { key: "notifications", label: "الإشعارات", icon: Bell },
    { key: "appearance", label: "المظهر", icon: Palette },
    { key: "language", label: "اللغة", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  activeTab === tab.key ? "bg-primary/5 text-primary border-r-2 border-primary" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">الملف الشخصي</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">{user?.nameAr?.[0] || "م"}</span>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">تغيير الصورة</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربي</label>
                  <input type="text" defaultValue={user?.nameAr || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزي</label>
                  <input type="text" defaultValue={user?.nameEn || ""} dir="ltr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" defaultValue={user?.email || ""} dir="ltr" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input type="tel" defaultValue={user?.phone || ""} dir="ltr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">تغيير كلمة المرور</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">تحديث كلمة المرور</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">إعدادات الإشعارات</h2>
              {[
                { label: "إشعارات التسجيل في الدورات", desc: "إشعار عند التسجيل في دورة جديدة" },
                { label: "إشعارات الاختبارات", desc: "إشعار عند توفر اختبار جديد أو ظهور النتائج" },
                { label: "إشعارات الشهادات", desc: "إشعار عند إصدار شهادة جديدة" },
                { label: "تذكيرات التعلم", desc: "تذكيرات دورية لإكمال الدورات" },
                { label: "إشعارات النظام", desc: "تحديثات وأخبار المنصة" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div><p className="text-sm font-medium text-gray-700">{item.label}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {(activeTab === "appearance" || activeTab === "language") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-400">هذه الميزة قيد التطوير</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
