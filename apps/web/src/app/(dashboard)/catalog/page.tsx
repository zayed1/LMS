"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCourses, useCategories, enrollInCourse, useMyEnrollments } from "@/hooks/use-courses";
import api from "@/lib/api";
import { BookOpen, Search, Users, Clock, Layers, UserPlus, CheckCircle, X, ChevronDown, FileText, Video, Play, Edit as PenIcon } from "lucide-react";
import { toast } from "@/lib/toast";

const modalityLabels: Record<string, string> = { ONLINE: "عن بعد", IN_PERSON: "حضوري", BLENDED: "مدمج" };
const lessonTypeLabels: Record<string, { label: string; icon: any }> = {
  TEXT: { label: "نص", icon: FileText }, VIDEO: { label: "فيديو", icon: Video },
  DOCUMENT: { label: "مستند", icon: FileText }, QUIZ: { label: "اختبار", icon: BookOpen },
  ASSIGNMENT: { label: "واجب", icon: PenIcon }, LIVE_SESSION: { label: "جلسة مباشرة", icon: Play },
  SCORM: { label: "SCORM", icon: BookOpen },
};

export default function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { categories } = useCategories();
  const { data, isLoading, refetch } = useCourses({
    page, limit: 12, search, status: "PUBLISHED", categoryId: categoryFilter,
  });
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const { enrollments, refetch: refetchEnrollments } = useMyEnrollments();
  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      toast.success("تم التسجيل بنجاح!");
      refetch();
      refetchEnrollments();
    } catch {
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">كتالوج الدورات</h1>
        <p className="text-gray-500 mt-1">تصفح الدورات المتاحة وسجل في ما يناسبك</p>
      </div>

      {/* Search + Categories */}
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="ابحث عن دورة..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-xl text-sm bg-white">
            <option value="">الأحدث</option>
            <option value="popular">الأكثر تسجيلاً</option>
            <option value="title">أبجدي</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setCategoryFilter(""); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${!categoryFilter ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              الكل
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${categoryFilter === cat.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {cat.nameAr} {cat._count?.courses ? `(${cat._count.courses})` : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 animate-pulse">
              <div className="h-36 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-full" /><div className="h-8 bg-gray-200 rounded mt-3" /></div>
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">لا توجد دورات متاحة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data.map(course => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover flex flex-col">
              {/* Clickable header + content */}
              <div className="cursor-pointer" onClick={() => setPreviewCourseId(course.id)}>
                <div className="h-36 bg-gradient-to-bl from-primary to-primary-light relative flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white/30" />
                  {course.category && (
                    <span className="absolute top-3 right-3 text-xs bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full">
                      {course.category.nameAr}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{course.titleAr}</h3>
                  <p className="text-sm text-gray-500 mb-2">{course.instructor?.nameAr}</p>
                  {course.descriptionAr && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.descriptionAr}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course._count?.enrollments || 0}</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {course._count?.modules || 0} وحدة</span>
                    {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}د</span>}
                    <span>{modalityLabels[course.modality]}</span>
                  </div>
                </div>
              </div>
              {/* Enroll button - not part of the clickable area */}
              <div className="px-4 pb-4 mt-auto">
                {enrolledCourseIds.has(course.id) ? (
                  <Link href={`/learn/${course.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100">
                    <CheckCircle className="w-4 h-4" /> متابعة التعلم
                  </Link>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    {enrolling === course.id ? "جاري التسجيل..." : "التسجيل في الدورة"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">السابق</button>
          <span className="text-sm text-gray-500">صفحة {page} من {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">التالي</button>
        </div>
      )}

      {/* Course Preview Modal */}
      {previewCourseId && (
        <CoursePreviewModal
          courseId={previewCourseId}
          isEnrolled={enrolledCourseIds.has(previewCourseId)}
          enrolling={enrolling === previewCourseId}
          onEnroll={() => handleEnroll(previewCourseId)}
          onClose={() => setPreviewCourseId(null)}
        />
      )}
    </div>
  );
}

function CoursePreviewModal({ courseId, isEnrolled, enrolling, onEnroll, onClose }: {
  courseId: string; isEnrolled: boolean; enrolling: boolean; onEnroll: () => void; onClose: () => void;
}) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get(`/courses/${courseId}`).then(res => {
      setCourse(res.data);
      // Auto-expand first module
      if (res.data?.modules?.[0]) setExpandedModules(new Set([res.data.modules[0].id]));
    }).catch(() => toast.error("حدث خطأ في تحميل الدورة"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totalLessons = course?.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0;
  const totalDuration = course?.modules?.reduce((s: number, m: any) =>
    s + (m.lessons?.reduce((ls: number, l: any) => ls + (l.duration || 0), 0) || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : !course ? (
          <div className="p-12 text-center text-gray-400">الدورة غير موجودة</div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-bl from-primary to-primary-light p-6 text-white relative flex-shrink-0">
              <button onClick={onClose} className="absolute top-3 left-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
              {course.category && (
                <span className="inline-flex text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full mb-3">
                  {course.category.nameAr}
                </span>
              )}
              <h2 className="text-xl font-bold mb-1">{course.titleAr}</h2>
              <p className="text-white/70 text-sm">{course.titleEn}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course._count?.enrollments || 0} متدرب</span>
                <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {course.modules?.length || 0} وحدة</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {totalLessons} درس</span>
                {totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {totalDuration} دقيقة</span>}
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Info */}
              <div className="p-6 space-y-4 border-b border-gray-100">
                {course.descriptionAr && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">عن الدورة</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{course.descriptionAr}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  {course.instructor && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{course.instructor.nameAr?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">المدرب</p>
                        <p className="text-sm font-medium text-gray-700">{course.instructor.nameAr}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">النمط</p>
                    <p className="text-sm font-medium text-gray-700">{modalityLabels[course.modality] || course.modality}</p>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400">المدة</p>
                      <p className="text-sm font-medium text-gray-700">{course.duration} دقيقة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modules & Lessons */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">محتوى الدورة</h3>
                {(!course.modules || course.modules.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-6">لا يوجد محتوى بعد</p>
                ) : (
                  <div className="space-y-2">
                    {course.modules.map((mod: any, modIdx: number) => {
                      const isExpanded = expandedModules.has(mod.id);
                      return (
                        <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <button onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-right">
                            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">{modIdx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{mod.titleAr}</p>
                              <p className="text-xs text-gray-400">{mod.lessons?.length || 0} درس</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                          </button>
                          {isExpanded && mod.lessons && mod.lessons.length > 0 && (
                            <div className="border-t border-gray-100">
                              {mod.lessons.map((lesson: any, lesIdx: number) => {
                                const TypeIcon = lessonTypeLabels[lesson.type]?.icon || FileText;
                                return (
                                  <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                                    <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700">{lesson.titleAr}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>{lessonTypeLabels[lesson.type]?.label || lesson.type}</span>
                                        {lesson.duration && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {lesson.duration}د</span>}
                                      </div>
                                    </div>
                                    {lesson.isPreview && (
                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">مجاني</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Enroll Action */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              {isEnrolled ? (
                <Link href={`/learn/${courseId}`} onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
                  <CheckCircle className="w-5 h-5" /> متابعة التعلم
                </Link>
              ) : (
                <button onClick={onEnroll} disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  <UserPlus className="w-5 h-5" />
                  {enrolling ? "جاري التسجيل..." : "التسجيل في الدورة"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
