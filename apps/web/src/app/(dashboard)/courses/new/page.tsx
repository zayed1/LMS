"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/hooks/use-courses";
import { useCategories } from "@/hooks/use-courses";
import { ArrowRight, Save, Send } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "",
    categoryId: "", modality: "ONLINE", duration: "",
    maxEnrollment: "", startDate: "", endDate: "", isPublic: false,
  });

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (publish = false) => {
    if (!form.titleAr.trim() || !form.titleEn.trim()) {
      setError("يرجى إدخال عنوان الدورة بالعربي والإنجليزي");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const payload: any = {
        ...form,
        duration: form.duration ? Number(form.duration) : undefined,
        maxEnrollment: form.maxEnrollment ? Number(form.maxEnrollment) : undefined,
        categoryId: form.categoryId || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: publish ? "PUBLISHED" : "DRAFT",
      };
      const course = await createCourse(payload);
      router.push(`/courses/${course.id}`);
    } catch {
      setError("حدث خطأ أثناء إنشاء الدورة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إنشاء دورة جديدة</h1>
          <p className="text-gray-500 mt-1">أدخل المعلومات الأساسية للدورة</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-danger text-sm p-3 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة بالعربي *</label>
            <input type="text" value={form.titleAr} onChange={e => updateField("titleAr", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة بالإنجليزي *</label>
            <input type="text" value={form.titleEn} onChange={e => updateField("titleEn", e.target.value)} dir="ltr"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الوصف بالعربي</label>
          <textarea value={form.descriptionAr} onChange={e => updateField("descriptionAr", e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الوصف بالإنجليزي</label>
          <textarea value={form.descriptionEn} onChange={e => updateField("descriptionEn", e.target.value)} rows={4} dir="ltr"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
        </div>

        {/* Category and Modality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
            <select value={form.categoryId} onChange={e => updateField("categoryId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">بدون تصنيف</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نمط التدريب</label>
            <select value={form.modality} onChange={e => updateField("modality", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="ONLINE">عن بعد</option>
              <option value="IN_PERSON">حضوري</option>
              <option value="BLENDED">مدمج</option>
            </select>
          </div>
        </div>

        {/* Duration and Max Enrollment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
            <input type="number" value={form.duration} onChange={e => updateField("duration", e.target.value)} min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للتسجيل</label>
            <input type="number" value={form.maxEnrollment} onChange={e => updateField("maxEnrollment", e.target.value)} min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={e => updateField("isPublic", e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300" />
              <span className="text-sm text-gray-700">دورة عامة</span>
            </label>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
            <input type="date" value={form.startDate} onChange={e => updateField("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
            <input type="date" value={form.endDate} onChange={e => updateField("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button onClick={() => handleSubmit(false)} disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-lg text-sm font-medium hover:bg-primary/5 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" /> حفظ كمسودة
          </button>
          <button onClick={() => handleSubmit(true)} disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" /> نشر الدورة
          </button>
        </div>
      </div>
    </div>
  );
}
