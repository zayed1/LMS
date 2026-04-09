"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourse, publishCourse, archiveCourse, addModule, deleteModule as delModule, addLesson, deleteLesson as delLesson, updateModule, updateLesson } from "@/hooks/use-courses";
import api from "@/lib/api";
import { ArrowRight, Send, Archive, Plus, Edit, Trash2, ChevronDown, ChevronLeft, Play, FileText, Video, BookOpen, X, GripVertical, Users, Clock, Save, Upload, Link2, Eye, PenLine } from "lucide-react";
import { toast } from "@/lib/toast";
import { confirmAction } from "@/components/ui/confirm-dialog";

const lessonTypes: Record<string, { label: string; icon: any; desc: string }> = {
  TEXT: { label: "نص", icon: FileText, desc: "محتوى نصي تعليمي" },
  VIDEO: { label: "فيديو", icon: Video, desc: "رابط فيديو خارجي" },
  DOCUMENT: { label: "مستند", icon: Upload, desc: "ملف للتحميل" },
  QUIZ: { label: "اختبار", icon: BookOpen, desc: "أسئلة تقييمية" },
  ASSIGNMENT: { label: "واجب", icon: PenLine, desc: "مهمة للمتدرب" },
  LIVE_SESSION: { label: "جلسة مباشرة", icon: Play, desc: "رابط جلسة حية" },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { course, isLoading, refetch } = useCourse(courseId);
  const [activeTab, setActiveTab] = useState<"info" | "content" | "students">("content");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [showNewLessonPicker, setShowNewLessonPicker] = useState<string | null>(null);
  const [dragModuleId, setDragModuleId] = useState<string | null>(null);
  const [dragLessonId, setDragLessonId] = useState<string | null>(null);

  // Auto-expand all modules on load
  useEffect(() => {
    if (course?.modules) {
      setExpandedModules(new Set(course.modules.map(m => m.id)));
    }
  }, [course?.modules]);

  const handleModuleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDragModuleId(moduleId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('type', 'module');
  };
  const handleModuleDrop = async (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault();
    if (!dragModuleId || dragModuleId === targetModuleId || !course?.modules) return;
    const ids = course.modules.map(m => m.id);
    const fromIdx = ids.indexOf(dragModuleId);
    const toIdx = ids.indexOf(targetModuleId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, dragModuleId);
    setDragModuleId(null);
    try { await api.put(`/courses/${courseId}/reorder-modules`, { moduleIds: ids }); refetch(); }
    catch { toast.error("حدث خطأ في إعادة الترتيب"); }
  };
  const handleLessonDrop = async (e: React.DragEvent, moduleId: string, targetLessonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragLessonId || dragLessonId === targetLessonId) return;
    const mod = course?.modules?.find(m => m.id === moduleId);
    if (!mod?.lessons) return;
    const ids = mod.lessons.map(l => l.id);
    const fromIdx = ids.indexOf(dragLessonId);
    const toIdx = ids.indexOf(targetLessonId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, dragLessonId);
    setDragLessonId(null);
    try { await api.put(`/courses/modules/${moduleId}/reorder-lessons`, { lessonIds: ids }); refetch(); }
    catch { toast.error("حدث خطأ في إعادة الترتيب"); }
  };

  const handleDeleteModule = async (id: string) => {
    if (!await confirmAction({ title: "حذف الوحدة", message: "سيتم حذف هذه الوحدة وجميع دروسها نهائياً. هل أنت متأكد؟" })) return;
    if (selectedLesson && course?.modules?.find(m => m.id === id)?.lessons?.some(l => l.id === selectedLesson.id)) {
      setSelectedLesson(null);
    }
    await delModule(id);
    refetch();
  };
  const handleDeleteLesson = async (id: string) => {
    if (!await confirmAction({ title: "حذف الدرس", message: "سيتم حذف هذا الدرس نهائياً. هل أنت متأكد؟" })) return;
    if (selectedLesson?.id === id) setSelectedLesson(null);
    await delLesson(id);
    refetch();
  };
  const handleAddLesson = async (moduleId: string, type: string) => {
    setShowNewLessonPicker(null);
    try {
      const res = await addLesson(moduleId, { titleAr: lessonTypes[type]?.label + " جديد", titleEn: "New " + type.toLowerCase(), type });
      refetch();
      setSelectedLesson({ ...res, type, moduleId });
      setSelectedModuleId(moduleId);
    } catch { toast.error("حدث خطأ"); }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (isLoading) return <div className="space-y-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded-xl" /></div>;
  if (!course) return <div className="text-center py-12 text-gray-500">الدورة غير موجودة</div>;

  const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/courses")} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{course.titleAr}</h1>
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                course.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                course.status === "ARCHIVED" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"
              }`}>{course.status === "PUBLISHED" ? "منشورة" : course.status === "ARCHIVED" ? "مؤرشفة" : "مسودة"}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{course.modules?.length || 0} وحدة &middot; {totalLessons} درس</p>
          </div>
        </div>
        <div className="flex gap-2">
          {course.status === "DRAFT" && (
            <button onClick={async () => { await publishCourse(courseId); toast.success("تم نشر الدورة"); refetch(); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Send className="w-4 h-4" /> نشر
            </button>
          )}
          {course.status === "PUBLISHED" && (
            <button onClick={async () => { await archiveCourse(courseId); refetch(); }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
              <Archive className="w-4 h-4" /> أرشفة
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[{key:"content",label:"المحتوى"},{key:"info",label:"المعلومات"},{key:"students",label:"المتدربين"}].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key as any); setSelectedLesson(null); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content Tab - Split Layout */}
      {activeTab === "content" && (
        <div className="flex gap-6 min-h-[calc(100vh-280px)]">
          {/* Left: Module/Lesson Tree */}
          <div className="w-96 flex-shrink-0 space-y-3">
            {course.modules?.map((mod) => (
              <div key={mod.id}
                draggable onDragStart={e => handleModuleDragStart(e, mod.id)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={e => handleModuleDrop(e, mod.id)} onDragEnd={() => setDragModuleId(null)}
                className={`bg-white rounded-xl border transition-all ${dragModuleId === mod.id ? "border-primary opacity-50" : "border-gray-200"}`}>
                {/* Module Header */}
                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-xl" onClick={() => toggleModule(mod.id)}>
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{mod.titleAr}</h3>
                      <p className="text-xs text-gray-400">{mod.lessons?.length || 0} درس</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingModule(mod); setShowModuleModal(true); }} className="p-1 rounded hover:bg-gray-200"><Edit className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => handleDeleteModule(mod.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </div>
                {/* Lessons */}
                {expandedModules.has(mod.id) && (
                  <div className="border-t border-gray-100">
                    {mod.lessons?.map((lesson) => {
                      const TypeIcon = lessonTypes[lesson.type]?.icon || FileText;
                      const isSelected = selectedLesson?.id === lesson.id;
                      return (
                        <div key={lesson.id}
                          draggable onDragStart={e => { e.stopPropagation(); setDragLessonId(lesson.id); e.dataTransfer.effectAllowed = 'move'; }}
                          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={e => handleLessonDrop(e, mod.id, lesson.id)}
                          onDragEnd={() => setDragLessonId(null)}
                          onClick={() => { setSelectedLesson(lesson); setSelectedModuleId(mod.id); }}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                            isSelected ? "bg-primary/5 border-r-2 border-r-primary" : dragLessonId === lesson.id ? "opacity-50" : "hover:bg-gray-50"
                          }`}>
                          <GripVertical className="w-3 h-3 text-gray-300 cursor-grab flex-shrink-0" />
                          <TypeIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-gray-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isSelected ? "text-primary font-medium" : "text-gray-700"}`}>{lesson.titleAr}</p>
                            <p className="text-xs text-gray-400">{lessonTypes[lesson.type]?.label}{lesson.duration ? ` · ${lesson.duration}د` : ""}</p>
                          </div>
                          {lesson.isPreview && <Eye className="w-3 h-3 text-green-500 flex-shrink-0" />}
                        </div>
                      );
                    })}
                    {/* Add Lesson */}
                    <div className="p-2 relative">
                      <button onClick={() => setShowNewLessonPicker(showNewLessonPicker === mod.id ? null : mod.id)}
                        className="w-full py-2 text-xs text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <Plus className="w-3 h-3" /> إضافة درس
                      </button>
                      {showNewLessonPicker === mod.id && (
                        <div className="absolute top-full mt-1 right-2 left-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-30">
                          <p className="text-xs text-gray-500 px-2 py-1 font-medium">اختر نوع الدرس</p>
                          {Object.entries(lessonTypes).map(([key, t]) => (
                            <button key={key} onClick={() => handleAddLesson(mod.id, key)}
                              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 text-right">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><t.icon className="w-4 h-4 text-primary" /></div>
                              <div><p className="text-sm text-gray-800">{t.label}</p><p className="text-xs text-gray-400">{t.desc}</p></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> وحدة جديدة
            </button>
          </div>

          {/* Right: Lesson Editor Panel */}
          <div className="flex-1">
            {selectedLesson ? (
              <LessonEditor
                key={selectedLesson.id}
                lesson={selectedLesson}
                moduleId={selectedModuleId}
                onSave={() => { refetch(); toast.success("تم حفظ الدرس"); }}
                onDelete={() => { handleDeleteLesson(selectedLesson.id); }}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center">
                <div className="text-center">
                  <Edit className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">اختر درساً لتحريره</p>
                  <p className="text-gray-400 text-sm mt-1">أو أضف درساً جديداً من القائمة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">المدرب:</span> <span className="font-medium">{course.instructor?.nameAr || "-"}</span></div>
            <div><span className="text-gray-500">التصنيف:</span> <span className="font-medium">{course.category?.nameAr || "-"}</span></div>
            <div><span className="text-gray-500">المدة:</span> <span className="font-medium">{course.duration ? `${course.duration} دقيقة` : "-"}</span></div>
            <div><span className="text-gray-500">الحد الأقصى:</span> <span className="font-medium">{course.maxEnrollment || "غير محدد"}</span></div>
            <div><span className="text-gray-500">المسجلين:</span> <span className="font-medium">{course._count?.enrollments || 0}</span></div>
            <div><span className="text-gray-500">الوحدات:</span> <span className="font-medium">{course.modules?.length || 0}</span></div>
          </div>
          {course.descriptionAr && (
            <div className="pt-4 border-t"><h4 className="text-sm font-medium text-gray-700 mb-2">الوصف</h4><p className="text-sm text-gray-600">{course.descriptionAr}</p></div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && <StudentsTab courseId={courseId} enrollmentCount={course._count?.enrollments || 0} />}

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal courseId={courseId} module={editingModule}
          onClose={() => { setShowModuleModal(false); setEditingModule(null); }}
          onSuccess={() => { setShowModuleModal(false); setEditingModule(null); refetch(); }} />
      )}
    </div>
  );
}

/* ─── Lesson Editor Panel ─── */
function LessonEditor({ lesson, moduleId, onSave, onDelete }: { lesson: any; moduleId: string; onSave: () => void; onDelete: () => void }) {
  const [form, setForm] = useState({
    titleAr: lesson.titleAr || "", titleEn: lesson.titleEn || "", type: lesson.type || "TEXT",
    content: lesson.content || "", videoUrl: lesson.videoUrl || "", fileUrl: lesson.fileUrl || "",
    duration: lesson.duration?.toString() || "", isPreview: lesson.isPreview || false,
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (field: string, value: any) => { setForm(prev => ({ ...prev, [field]: value })); setDirty(true); };

  const handleSave = async () => {
    if (!form.titleAr.trim()) { toast.error("عنوان الدرس بالعربي مطلوب"); return; }
    setSaving(true);
    try {
      const payload: any = { ...form, duration: form.duration ? Number(form.duration) : undefined };
      await updateLesson(lesson.id, payload);
      setDirty(false);
      onSave();
    } catch { toast.error("حدث خطأ في حفظ الدرس"); }
    finally { setSaving(false); }
  };

  const TypeIcon = lessonTypes[form.type]?.icon || FileText;
  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><TypeIcon className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{lessonTypes[form.type]?.label || form.type}</p>
            <p className="text-xs text-gray-400">تحرير الدرس</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-amber-500 font-medium">غير محفوظ</span>}
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
            <Save className="w-4 h-4" /> {saving ? "جاري..." : "حفظ"}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Title Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالعربي *</label>
            <input value={form.titleAr} onChange={e => update("titleAr", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالإنجليزي</label>
            <input value={form.titleEn} onChange={e => update("titleEn", e.target.value)} dir="ltr" className={inputCls} />
          </div>
        </div>

        {/* Meta Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدرس</label>
            <select value={form.type} onChange={e => update("type", e.target.value)} className={inputCls + " bg-white"}>
              {Object.entries(lessonTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقائق)</label>
            <input type="number" value={form.duration} onChange={e => update("duration", e.target.value)} min={1} className={inputCls} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPreview} onChange={e => update("isPreview", e.target.checked)} className="w-4 h-4 text-primary rounded border-gray-300" />
              <span className="text-sm text-gray-700">معاينة مجانية</span>
            </label>
          </div>
        </div>

        {/* Content Area - Dynamic by Type */}
        {(form.type === "TEXT" || form.type === "QUIZ" || form.type === "ASSIGNMENT") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === "TEXT" ? "المحتوى التعليمي" : form.type === "QUIZ" ? "أسئلة الاختبار" : "تعليمات الواجب"}
            </label>
            <p className="text-xs text-gray-400 mb-2">
              {form.type === "TEXT" ? "اكتب المحتوى النصي للدرس. يدعم الأسطر الجديدة." :
               form.type === "QUIZ" ? "اكتب أسئلة الاختبار وخيارات الإجابة." :
               "اكتب تعليمات ومتطلبات الواجب."}
            </p>
            <textarea value={form.content} onChange={e => update("content", e.target.value)} rows={12}
              className={inputCls + " resize-none font-mono text-sm leading-relaxed"} dir="rtl"
              placeholder={form.type === "TEXT" ? "اكتب المحتوى هنا..." : form.type === "QUIZ" ? "س1: ما هو...؟\nأ) ...\nب) ...\nج) ...\n\nس2: ..." : "المطلوب:\n1. ...\n2. ..."} />
          </div>
        )}

        {(form.type === "VIDEO" || form.type === "LIVE_SESSION") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === "VIDEO" ? "رابط الفيديو" : "رابط الجلسة المباشرة"}
            </label>
            <p className="text-xs text-gray-400 mb-2">أدخل رابط YouTube, Vimeo أو أي رابط فيديو قابل للتضمين</p>
            <div className="relative">
              <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.videoUrl} onChange={e => update("videoUrl", e.target.value)} dir="ltr"
                className={inputCls + " pr-10"} placeholder="https://www.youtube.com/embed/..." />
            </div>
            {/* Video Preview */}
            {form.videoUrl && (
              <div className="mt-3 aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe src={form.videoUrl} className="w-full h-full" allowFullScreen />
              </div>
            )}
          </div>
        )}

        {form.type === "DOCUMENT" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط المستند</label>
            <p className="text-xs text-gray-400 mb-2">أدخل رابط الملف (PDF, DOC, أو أي ملف قابل للتحميل)</p>
            <div className="relative">
              <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.fileUrl} onChange={e => update("fileUrl", e.target.value)} dir="ltr"
                className={inputCls + " pr-10"} placeholder="https://example.com/document.pdf" />
            </div>
            {form.fileUrl && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate" dir="ltr">{form.fileUrl}</p>
                  <p className="text-xs text-gray-400">رابط المستند</p>
                </div>
                <a href={form.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90">معاينة</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Module Modal (kept simple) ─── */
function ModuleModal({ courseId, module: mod, onClose, onSuccess }: { courseId: string; module: any; onClose: () => void; onSuccess: () => void }) {
  const isEditing = !!mod;
  const [form, setForm] = useState({ titleAr: mod?.titleAr || "", titleEn: mod?.titleEn || "", description: mod?.description || "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) await updateModule(mod.id, form); else await addModule(courseId, form);
      onSuccess();
    } catch { toast.error("حدث خطأ"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{isEditing ? "تعديل وحدة" : "إضافة وحدة"}</h2><button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالعربي *</label><input required value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالإنجليزي *</label><input required value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} dir="ltr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={submitting} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? "جاري..." : isEditing ? "تحديث" : "إضافة"}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Students Tab ─── */
const enrollStatusLabels: Record<string, { label: string; cls: string }> = {
  ENROLLED: { label: "مسجل", cls: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "قيد التعلم", cls: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "مكتمل", cls: "bg-green-100 text-green-700" },
  DROPPED: { label: "منسحب", cls: "bg-red-100 text-red-700" },
};

function StudentsTab({ courseId, enrollmentCount }: { courseId: string; enrollmentCount: number }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/enrollments/course/${courseId}?limit=50`)
      .then(res => setStudents(res.data?.data || res.data || []))
      .catch(() => { toast.error("حدث خطأ في تحميل المتدربين"); })
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-gray-800">المتدربين المسجلين</h3>
          <span className="text-sm text-gray-400">({enrollmentCount})</span>
        </div>
      </div>
      {loading ? (
        <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : students.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">لا يوجد متدربين مسجلين في هذه الدورة</p>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">المتدرب</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">الحالة</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">التقدم</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">تاريخ التسجيل</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><span className="text-primary text-xs font-bold">{e.user?.nameAr?.[0] || "?"}</span></div><div><p className="text-sm font-medium text-gray-800">{e.user?.nameAr}</p><p className="text-xs text-gray-400" dir="ltr">{e.user?.email}</p></div></div></td>
                <td className="px-6 py-3"><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${enrollStatusLabels[e.status]?.cls || "bg-gray-100"}`}>{enrollStatusLabels[e.status]?.label || e.status}</span></td>
                <td className="px-6 py-3"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px]"><div className="h-full bg-primary rounded-full" style={{ width: `${e.progress || 0}%` }} /></div><span className="text-xs text-gray-500">{e.progress || 0}%</span></div></td>
                <td className="px-6 py-3 text-sm text-gray-500">{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString("ar-SA") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
