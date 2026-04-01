"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourse, updateCourse, publishCourse, archiveCourse, addModule, deleteModule as delModule, addLesson, deleteLesson as delLesson, updateModule, updateLesson } from "@/hooks/use-courses";
import api from "@/lib/api";
import { ArrowRight, Send, Archive, Plus, Edit, Trash2, ChevronDown, ChevronLeft, Play, FileText, Video, BookOpen, X, GripVertical, Users, Clock } from "lucide-react";
import { toast } from "@/lib/toast";

const lessonTypeLabels: Record<string, { label: string; icon: any }> = {
  TEXT: { label: "نص", icon: FileText },
  VIDEO: { label: "فيديو", icon: Video },
  DOCUMENT: { label: "مستند", icon: FileText },
  QUIZ: { label: "اختبار", icon: BookOpen },
  ASSIGNMENT: { label: "واجب", icon: Edit },
  LIVE_SESSION: { label: "جلسة مباشرة", icon: Play },
  SCORM: { label: "SCORM", icon: BookOpen },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { course, isLoading, refetch } = useCourse(courseId);
  const [activeTab, setActiveTab] = useState<"info" | "content" | "students">("content");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [currentModuleId, setCurrentModuleId] = useState("");
  const [dragModuleId, setDragModuleId] = useState<string | null>(null);

  const handleModuleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDragModuleId(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleModuleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
    try {
      await api.put(`/courses/${courseId}/reorder-modules`, { moduleIds: ids });
      refetch();
    } catch { toast.error("حدث خطأ في إعادة الترتيب"); }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12 text-gray-500">الدورة غير موجودة</div>;
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوحدة؟")) return;
    await delModule(id);
    refetch();
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    await delLesson(id);
    refetch();
  };

  const tabs = [
    { key: "content", label: "المحتوى" },
    { key: "info", label: "المعلومات" },
    { key: "students", label: "المتدربين" },
  ];

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
                course.status === "ARCHIVED" ? "bg-gray-100 text-gray-600" :
                "bg-amber-100 text-amber-700"
              }`}>
                {course.status === "PUBLISHED" ? "منشورة" : course.status === "ARCHIVED" ? "مؤرشفة" : "مسودة"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{course.titleEn}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {course.status === "DRAFT" && (
            <button onClick={async () => { await publishCourse(courseId); refetch(); }}
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
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {course.modules?.map((mod) => (
            <div key={mod.id}
              draggable
              onDragStart={e => handleModuleDragStart(e, mod.id)}
              onDragOver={handleModuleDragOver}
              onDrop={e => handleModuleDrop(e, mod.id)}
              onDragEnd={() => setDragModuleId(null)}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                dragModuleId === mod.id ? "border-primary opacity-50 scale-[0.98]" : "border-gray-200"
              }`}>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleModule(mod.id)}>
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab active:cursor-grabbing" />
                  {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
                  <div>
                    <h3 className="font-medium text-gray-800">{mod.titleAr}</h3>
                    <p className="text-xs text-gray-400">{mod.lessons?.length || 0} درس</p>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditingModule(mod); setShowModuleModal(true); }} className="p-1.5 rounded hover:bg-gray-200">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-danger" />
                  </button>
                  <button onClick={() => { setCurrentModuleId(mod.id); setEditingLesson(null); setShowLessonModal(true); }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/5 rounded">
                    <Plus className="w-3 h-3" /> درس
                  </button>
                </div>
              </div>
              {expandedModules.has(mod.id) && mod.lessons && (
                <div className="border-t border-gray-100">
                  {mod.lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">لا توجد دروس في هذه الوحدة</p>
                  ) : mod.lessons.map((lesson) => {
                    const TypeIcon = lessonTypeLabels[lesson.type]?.icon || FileText;
                    return (
                      <div key={lesson.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="w-4 h-4 text-primary-light" />
                          <div>
                            <p className="text-sm text-gray-700">{lesson.titleAr}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{lessonTypeLabels[lesson.type]?.label || lesson.type}</span>
                              {lesson.duration && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {lesson.duration}د</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setCurrentModuleId(mod.id); setEditingLesson(lesson); setShowLessonModal(true); }} className="p-1 rounded hover:bg-gray-200">
                            <Edit className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-danger" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> إضافة وحدة جديدة
          </button>
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
            <div><span className="text-gray-500">الوحدات:</span> <span className="font-medium">{course._count?.modules || course.modules?.length || 0}</span></div>
          </div>
          {course.descriptionAr && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">الوصف</h4>
              <p className="text-sm text-gray-600">{course.descriptionAr}</p>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <StudentsTab courseId={courseId} enrollmentCount={course._count?.enrollments || 0} />
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal
          courseId={courseId}
          module={editingModule}
          onClose={() => { setShowModuleModal(false); setEditingModule(null); }}
          onSuccess={() => { setShowModuleModal(false); setEditingModule(null); refetch(); }}
        />
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          moduleId={currentModuleId}
          lesson={editingLesson}
          onClose={() => { setShowLessonModal(false); setEditingLesson(null); }}
          onSuccess={() => { setShowLessonModal(false); setEditingLesson(null); refetch(); }}
        />
      )}
    </div>
  );
}

function ModuleModal({ courseId, module: mod, onClose, onSuccess }: { courseId: string; module: any; onClose: () => void; onSuccess: () => void }) {
  const isEditing = !!mod;
  const [form, setForm] = useState({ titleAr: mod?.titleAr || "", titleEn: mod?.titleEn || "", description: mod?.description || "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) { await updateModule(mod.id, form); }
      else { await addModule(courseId, form); }
      onSuccess();
    } catch { toast.error("حدث خطأ"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
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

function LessonModal({ moduleId, lesson, onClose, onSuccess }: { moduleId: string; lesson: any; onClose: () => void; onSuccess: () => void }) {
  const isEditing = !!lesson;
  const [form, setForm] = useState({
    titleAr: lesson?.titleAr || "", titleEn: lesson?.titleEn || "", type: lesson?.type || "TEXT",
    content: lesson?.content || "", videoUrl: lesson?.videoUrl || "", duration: lesson?.duration?.toString() || "",
    isPreview: lesson?.isPreview || false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form, duration: form.duration ? Number(form.duration) : undefined };
      if (isEditing) { await updateLesson(lesson.id, payload); }
      else { await addLesson(moduleId, payload); }
      onSuccess();
    } catch { toast.error("حدث خطأ"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{isEditing ? "تعديل درس" : "إضافة درس"}</h2><button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالعربي *</label><input required value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالإنجليزي *</label><input required value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} dir="ltr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدرس</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                {Object.entries(lessonTypeLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقائق)</label><input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} min={1} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          </div>
          {(form.type === "TEXT" || form.type === "QUIZ" || form.type === "ASSIGNMENT") && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></div>
          )}
          {(form.type === "VIDEO" || form.type === "LIVE_SESSION") && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">رابط الفيديو</label><input value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} dir="ltr" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPreview} onChange={e => setForm({...form, isPreview: e.target.checked})} className="w-4 h-4 text-primary rounded border-gray-300" />
            <span className="text-sm text-gray-700">معاينة مجانية</span>
          </label>
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={submitting} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{submitting ? "جاري..." : isEditing ? "تحديث" : "إضافة"}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : students.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">لا يوجد متدربين مسجلين في هذه الدورة</p>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">المتدرب</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">الحالة</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">التقدم</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">{e.user?.nameAr?.[0] || "?"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{e.user?.nameAr}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{e.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${enrollStatusLabels[e.status]?.cls || "bg-gray-100"}`}>
                    {enrollStatusLabels[e.status]?.label || e.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px]">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{e.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString("ar-SA") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
