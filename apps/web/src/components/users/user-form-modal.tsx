"use client";

import { useState } from "react";
import { createUser, updateUser, type User } from "@/hooks/use-users";
import type { Department } from "@/hooks/use-departments";
import { X } from "lucide-react";

interface Props {
  user: User | null;
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}

const roles = [
  { value: "SUPER_ADMIN", label: "مدير النظام" },
  { value: "ADMIN", label: "مدير" },
  { value: "TRAINING_MANAGER", label: "مدير التدريب" },
  { value: "INSTRUCTOR", label: "مدرب" },
  { value: "LEARNER", label: "متعلم" },
];

export function UserFormModal({ user, departments, onClose, onSuccess }: Props) {
  const isEditing = !!user;
  const [form, setForm] = useState({
    email: user?.email || "",
    password: "",
    nameAr: user?.nameAr || "",
    nameEn: user?.nameEn || "",
    role: user?.role || "LEARNER",
    departmentId: user?.departmentId || "",
    phone: user?.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = { ...form, departmentId: form.departmentId || undefined };
      if (isEditing) {
        const { password, ...rest } = payload;
        await updateUser(user!.id, rest);
      } else {
        await createUser(payload);
      }
      onSuccess();
    } catch {
      setError(isEditing ? "حدث خطأ أثناء التعديل" : "حدث خطأ أثناء الإنشاء");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربي *</label>
              <input
                type="text"
                required
                value={form.nameAr}
                onChange={(e) => updateField("nameAr", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزي</label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => updateField("nameEn", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              dir="ltr"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                minLength={8}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدور *</label>
              <select
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
              <select
                value={form.departmentId}
                onChange={(e) => updateField("departmentId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">بدون قسم</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              dir="ltr"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "جاري الحفظ..." : isEditing ? "تحديث" : "إضافة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
