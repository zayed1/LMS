"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyEnrollments } from "@/hooks/use-courses";
import { BookOpen, Play, CheckCircle, Clock, Award } from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  ENROLLED: { label: "مسجل", class: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "قيد التعلم", class: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "مكتمل", class: "bg-green-100 text-green-700" },
  DROPPED: { label: "منسحب", class: "bg-gray-100 text-gray-600" },
};

export default function MyCoursesPage() {
  const [tab, setTab] = useState<string>("");
  const statusMap: Record<string, string> = { active: "IN_PROGRESS", completed: "COMPLETED" };
  const { enrollments, isLoading } = useMyEnrollments(statusMap[tab] || undefined);

  const tabs = [
    { key: "", label: "الكل" },
    { key: "active", label: "قيد التعلم" },
    { key: "completed", label: "مكتملة" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">دوراتي</h1>
        <p className="text-gray-500 mt-1">تتبع تقدمك في الدورات المسجل بها</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-4 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-full" /></div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">لا توجد دورات</h3>
          <p className="text-gray-400 mt-1 mb-4">تصفح كتالوج الدورات للتسجيل في دورة جديدة</p>
          <Link href="/catalog" className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            تصفح الدورات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover">
              <div className={`h-32 relative flex items-center justify-center ${enrollment.status === "COMPLETED" ? "bg-gradient-to-bl from-green-500 to-green-600" : "bg-gradient-to-bl from-primary to-primary-light"}`}>
                {enrollment.status === "COMPLETED" ? (
                  <CheckCircle className="w-10 h-10 text-white/30" />
                ) : (
                  <BookOpen className="w-10 h-10 text-white/30" />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusLabels[enrollment.status]?.class}`}>
                    {statusLabels[enrollment.status]?.label}
                  </span>
                </div>
                {enrollment.status === "COMPLETED" && (
                  <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-white text-xs font-bold">
                    مكتمل
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{enrollment.course.titleAr}</h3>
                <p className="text-sm text-gray-500 mb-3">{enrollment.course.instructor?.nameAr}</p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>التقدم</span>
                    <span>{Math.round(enrollment.progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(enrollment.enrolledAt).toLocaleDateString("ar-SA")}
                  </span>
                  <Link href={`/learn/${enrollment.courseId}`}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                    {enrollment.status === "COMPLETED" ? (
                      <><CheckCircle className="w-4 h-4" /> مراجعة</>
                    ) : (
                      <><Play className="w-4 h-4" /> متابعة</>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
