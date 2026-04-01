"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/hooks/use-courses";
import { useCategories } from "@/hooks/use-courses";
import { ArrowRight, Save, Send, Check, BookOpen, Settings2, Eye } from "lucide-react";
import { toast } from "@/lib/toast";

const steps = [
  { key: "basic", label: "المعلومات الأساسية", icon: BookOpen },
  { key: "details", label: "التفاصيل والإعدادات", icon: Settings2 },
  { key: "review", label: "المراجعة والنشر", icon: Eye },
];

export default function NewCoursePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "",
    categoryId: "", modality: "ONLINE", duration: "",
    maxEnrollment: "", startDate: "", endDate: "", isPublic: false,
  });

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.titleAr.trim()) newErrors.titleAr = "عنوان الدورة بالعربي مطلوب";
      if (!form.titleEn.trim()) newErrors.titleEn = "عنوان الدورة بالإنجليزي مطلوب";
    }
    if (step === 1) {
      if (form.startDate && form.endDate && form.startDate > form.endDate) {
        newErrors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 2));
  };
  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (publish = false) => {
    if (!validateStep(0)) { setCurrentStep(0); return; }
    setIsSubmitting(true);
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
      toast.success(publish ? "تم نشر الدورة بنجاح" : "تم حفظ الدورة كمسودة");
      router.push(`/courses/${course.id}`);
    } catch {
      toast.error("حدث خطأ أثناء إنشاء الدورة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalityLabels: Record<string, string> = { ONLINE: "عن بعد", IN_PERSON: "حضوري", BLENDED: "مدمج" };
  const inputCls = (field: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors[field] ? "border-red-400 bg-red-50/50" : "border-gray-300"}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إنشاء دورة جديدة</h1>
          <p className="text-gray-500 mt-1">{steps[currentStep].label}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <button onClick={() => idx < currentStep && setCurrentStep(idx)}
                  className={`flex items-center gap-2 ${idx < currentStep ? "cursor-pointer" : "cursor-default"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded ${idx < currentStep ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة بالعربي *</label>
                <input type="text" value={form.titleAr} onChange={e => updateField("titleAr", e.target.value)} className={inputCls("titleAr")} />
                {errors.titleAr && <p className="text-xs text-red-500 mt-1">{errors.titleAr}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة بالإنجليزي *</label>
                <input type="text" value={form.titleEn} onChange={e => updateField("titleEn", e.target.value)} dir="ltr" className={inputCls("titleEn")} />
                {errors.titleEn && <p className="text-xs text-red-500 mt-1">{errors.titleEn}</p>}
              </div>
            </div>
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
          </>
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
                <input type="number" value={form.duration} onChange={e => updateField("duration", e.target.value)} min={1} className={inputCls("duration")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للتسجيل</label>
                <input type="number" value={form.maxEnrollment} onChange={e => updateField("maxEnrollment", e.target.value)} min={1} className={inputCls("maxEnrollment")} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={e => updateField("isPublic", e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300" />
                  <span className="text-sm text-gray-700">دورة عامة</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                <input type="date" value={form.startDate} onChange={e => updateField("startDate", e.target.value)} className={inputCls("startDate")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                <input type="date" value={form.endDate} onChange={e => updateField("endDate", e.target.value)} className={inputCls("endDate")} />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">مراجعة بيانات الدورة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">العنوان بالعربي</span>
                <span className="font-medium text-gray-800">{form.titleAr || "-"}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">العنوان بالإنجليزي</span>
                <span className="font-medium text-gray-800" dir="ltr">{form.titleEn || "-"}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">التصنيف</span>
                <span className="font-medium text-gray-800">{categories.find(c => c.id === form.categoryId)?.nameAr || "بدون تصنيف"}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">نمط التدريب</span>
                <span className="font-medium text-gray-800">{modalityLabels[form.modality]}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">المدة</span>
                <span className="font-medium text-gray-800">{form.duration ? `${form.duration} دقيقة` : "غير محدد"}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-gray-500 block mb-1">الحد الأقصى</span>
                <span className="font-medium text-gray-800">{form.maxEnrollment || "غير محدد"}</span>
              </div>
              {form.startDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block mb-1">تاريخ البداية</span>
                  <span className="font-medium text-gray-800">{form.startDate}</span>
                </div>
              )}
              {form.endDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block mb-1">تاريخ النهاية</span>
                  <span className="font-medium text-gray-800">{form.endDate}</span>
                </div>
              )}
            </div>
            {(form.descriptionAr || form.descriptionEn) && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-gray-500 block mb-1">الوصف</span>
                <p className="text-gray-700">{form.descriptionAr || form.descriptionEn}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {currentStep > 0 && (
            <button onClick={goBack} className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              السابق
            </button>
          )}
          <div className="flex-1" />
          {currentStep < 2 ? (
            <button onClick={goNext}
              className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              التالي
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => handleSubmit(false)} disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 disabled:opacity-50 transition-colors">
                <Save className="w-4 h-4" /> حفظ كمسودة
              </button>
              <button onClick={() => handleSubmit(true)} disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" /> {isSubmitting ? "جاري..." : "نشر الدورة"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
