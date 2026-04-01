"use client";

import { useState } from "react";
import Link from "next/link";
import { useCourses, deleteCourse, publishCourse, archiveCourse } from "@/hooks/use-courses";
import { BookOpen, Plus, Search, Users, Clock, Layers, MoreVertical, Eye, Edit, Trash2, Send, Archive } from "lucide-react";
import { toast } from "@/lib/toast";

const statusLabels: Record<string, { label: string; class: string }> = {
  DRAFT: { label: "مسودة", class: "bg-amber-100 text-amber-700" },
  PUBLISHED: { label: "منشورة", class: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "مؤرشفة", class: "bg-gray-100 text-gray-600" },
};

const modalityLabels: Record<string, string> = {
  ONLINE: "عن بعد",
  IN_PERSON: "حضوري",
  BLENDED: "مدمج",
};

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, refetch } = useCourses({
    page, limit: 9, search, status: statusFilter, modality: modalityFilter,
  });

  const handleAction = async (action: string, id: string) => {
    setActiveMenu(null);
    try {
      if (action === "delete") {
        if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
        await deleteCourse(id);
      } else if (action === "publish") {
        await publishCourse(id);
      } else if (action === "archive") {
        await archiveCourse(id);
      }
      refetch();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الدورات</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة الدورات التدريبية</p>
        </div>
        <Link
          href="/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">إنشاء دورة جديدة</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الدورات..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select
            value={modalityFilter}
            onChange={(e) => { setModalityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">جميع الأنماط</option>
            {Object.entries(modalityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">لا توجد دورات</h3>
          <p className="text-gray-400 mt-1">ابدأ بإنشاء دورة تدريبية جديدة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-bl from-primary to-primary-light relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusLabels[course.status]?.class || "bg-gray-100"}`}>
                    {statusLabels[course.status]?.label || course.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3 relative">
                  <button
                    onClick={(e) => { e.preventDefault(); setActiveMenu(activeMenu === course.id ? null : course.id); }}
                    className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/40 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                  {activeMenu === course.id && (
                    <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
                      <Link href={`/courses/${course.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4" /> عرض
                      </Link>
                      <Link href={`/courses/${course.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit className="w-4 h-4" /> تعديل
                      </Link>
                      {course.status === "DRAFT" && (
                        <button onClick={() => handleAction("publish", course.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                          <Send className="w-4 h-4" /> نشر
                        </button>
                      )}
                      {course.status === "PUBLISHED" && (
                        <button onClick={() => handleAction("archive", course.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                          <Archive className="w-4 h-4" /> أرشفة
                        </button>
                      )}
                      <button onClick={() => handleAction("delete", course.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <Link href={`/courses/${course.id}`} className="block p-4">
                <div className="flex items-center gap-2 mb-2">
                  {course.category && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {course.category.nameAr}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {modalityLabels[course.modality] || course.modality}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{course.titleAr}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor?.nameAr}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {course._count?.enrollments || 0} متدرب
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {course._count?.modules || 0} وحدة
                  </span>
                  {course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.duration} د
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">السابق</button>
          <span className="text-sm text-gray-500">صفحة {page} من {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">التالي</button>
        </div>
      )}
    </div>
  );
}
