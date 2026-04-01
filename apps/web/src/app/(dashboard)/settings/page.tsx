"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { toast } from "@/lib/toast";
import api from "@/lib/api";
import { User, Lock, Bell, Palette, Globe, Check, Monitor, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
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
          {activeTab === "profile" && <ProfileTab user={user} onUpdate={setUser} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "language" && <LanguageTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({
    nameAr: user?.nameAr || "",
    nameEn: user?.nameEn || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.nameAr.trim() || !form.nameEn.trim()) {
      toast.error("يرجى إدخال الاسم بالعربي والإنجليزي");
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", form);
      onUpdate(res.data);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">الملف الشخصي</h2>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary text-2xl font-bold">{user?.nameAr?.[0] || "م"}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{user?.nameAr}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربي *</label>
          <input type="text" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزي *</label>
          <input type="text" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input type="email" defaultValue={user?.email || ""} dir="ltr" disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
          <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (form.newPassword.length < 4) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">تغيير كلمة المرور</h2>
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
          <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
          <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
          <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? "جاري التحديث..." : "تحديث كلمة المرور"}
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    enrollments: true,
    quizzes: true,
    certificates: true,
    reminders: true,
    system: true,
  });

  const items = [
    { key: "enrollments", label: "إشعارات التسجيل في الدورات", desc: "إشعار عند التسجيل في دورة جديدة" },
    { key: "quizzes", label: "إشعارات الاختبارات", desc: "إشعار عند توفر اختبار جديد أو ظهور النتائج" },
    { key: "certificates", label: "إشعارات الشهادات", desc: "إشعار عند إصدار شهادة جديدة" },
    { key: "reminders", label: "تذكيرات التعلم", desc: "تذكيرات دورية لإكمال الدورات" },
    { key: "system", label: "إشعارات النظام", desc: "تحديثات وأخبار المنصة" },
  ];

  const handleToggle = (key: string) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    toast.success("تم تحديث تفضيلات الإشعارات");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">إعدادات الإشعارات</h2>
      {items.map(item => (
        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div><p className="text-sm font-medium text-gray-700">{item.label}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={prefs[item.key as keyof typeof prefs]}
              onChange={() => handleToggle(item.key)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      ))}
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('lms-theme') || 'light';
    return 'light';
  });

  const themes = [
    { key: "light", label: "فاتح", icon: Sun, desc: "المظهر الفاتح الافتراضي" },
    { key: "dark", label: "داكن", icon: Moon, desc: "مظهر داكن مريح للعين" },
    { key: "system", label: "تلقائي", icon: Monitor, desc: "يتبع إعدادات النظام" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">المظهر</h2>
      <div className="grid grid-cols-3 gap-4">
        {themes.map(t => (
          <button key={t.key} onClick={() => { setTheme(t.key); localStorage.setItem('lms-theme', t.key); toast.success(`تم اختيار المظهر ${t.label}`); }}
            className={`relative p-4 rounded-xl border-2 text-center transition-colors ${
              theme === t.key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
            }`}>
            {theme === t.key && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <t.icon className={`w-8 h-8 mx-auto mb-2 ${theme === t.key ? "text-primary" : "text-gray-400"}`} />
            <p className="text-sm font-medium text-gray-700">{t.label}</p>
            <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LanguageTab() {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('lms-lang') || 'ar';
    return 'ar';
  });

  const languages = [
    { key: "ar", label: "العربية", native: "العربية", flag: "🇸🇦" },
    { key: "en", label: "English", native: "الإنجليزية", flag: "🇺🇸" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">اللغة</h2>
      <div className="space-y-3">
        {languages.map(l => (
          <button key={l.key} onClick={() => { setLang(l.key); localStorage.setItem('lms-lang', l.key); toast.success(`تم اختيار اللغة ${l.native}`); }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
              lang === l.key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
            }`}>
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium text-gray-700">{l.native}</p>
              <p className="text-xs text-gray-400">{l.label}</p>
            </div>
            {lang === l.key && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
