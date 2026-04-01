"use client";

import { useState } from "react";
import Link from "next/link";
import { useCourses, useCategories, enrollInCourse } from "@/hooks/use-courses";
import { BookOpen, Search, Users, Clock, Layers, UserPlus } from "lucide-react";
import { toast } from "@/lib/toast";

const modalityLabels: Record<string, string> = { ONLINE: "عن بعد", IN_PERSON: "حضوري", BLENDED: "مدمج" };

export default function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { categories } = useCategories();
  const { data, isLoading, refetch } = useCourses({
    page, limit: 12, search, status: "PUBLISHED", categoryId: categoryFilter,
  });
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      toast.success("تم التسجيل بنجاح!");
      refetch();
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
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="ابحث عن دورة..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-36 bg-gradient-to-bl from-primary to-primary-light relative flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white/30" />
                {course.category && (
                  <span className="absolute top-3 right-3 text-xs bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full">
                    {course.category.nameAr}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{course.titleAr}</h3>
                <p className="text-sm text-gray-500 mb-2">{course.instructor?.nameAr}</p>
                {course.descriptionAr && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.descriptionAr}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 mt-auto">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course._count?.enrollments || 0}</span>
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {course._count?.modules || 0} وحدة</span>
                  {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}د</span>}
                  <span>{modalityLabels[course.modality]}</span>
                </div>
                <button onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  {enrolling === course.id ? "جاري التسجيل..." : "التسجيل في الدورة"}
                </button>
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
    </div>
  );
}
