"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import { Users, BookOpen, GraduationCap, TrendingUp, Building2, Award, BarChart3 } from "lucide-react";

interface DashboardStats {
  users: { total: number; active: number };
  courses: { total: number; published: number };
  enrollments: { total: number; completed: number; completionRate: number };
  departments: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [deptReport, setDeptReport] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard"),
      api.get("/reports/top-courses?limit=5"),
      api.get("/reports/departments"),
      api.get("/reports/enrollment-trends?months=6"),
    ]).then(([s, tc, dr, tr]) => {
      setStats(s.data);
      setTopCourses(tc.data);
      setDeptReport(dr.data);
      setTrends(tr.data);
    }).catch(() => { toast.error("حدث خطأ في تحميل التقارير"); }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  const statCards = [
    { title: "إجمالي المستخدمين", value: stats?.users.total || 0, sub: `${stats?.users.active || 0} نشط`, icon: Users, color: "bg-blue-500" },
    { title: "الدورات", value: stats?.courses.total || 0, sub: `${stats?.courses.published || 0} منشورة`, icon: BookOpen, color: "bg-primary" },
    { title: "التسجيلات", value: stats?.enrollments.total || 0, sub: `${stats?.enrollments.completed || 0} مكتمل`, icon: GraduationCap, color: "bg-green-500" },
    { title: "معدل الإكمال", value: `${stats?.enrollments.completionRate || 0}%`, sub: "من إجمالي التسجيلات", icon: TrendingUp, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات</h1>
        <p className="text-gray-500 mt-1">نظرة شاملة على أداء منصة التعلم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.slice(0, 3).map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
        {/* Donut Chart Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">معدل الإكمال</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.enrollments.completionRate || 0}%</p>
              <p className="text-xs text-gray-400 mt-1">من إجمالي التسجيلات</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#069005 ${(stats?.enrollments.completionRate || 0) * 3.6}deg, #e5e7eb 0deg)`,
              }}>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                {stats?.enrollments.completionRate || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">أعلى الدورات تسجيلاً</h2>
          </div>
          {topCourses.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{course.titleAr}</p>
                    <p className="text-xs text-gray-400">{course.instructor}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{course.enrollments} متدرب</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">اتجاهات التسجيل (آخر 6 أشهر)</h2>
          </div>
          {trends.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {trends.map((t) => {
                const maxVal = Math.max(...trends.map(tr => tr.enrolled), 1);
                return (
                  <div key={t.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">{t.month}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full bg-primary/20 rounded-full" style={{ width: `${(t.enrolled / maxVal) * 100}%` }} />
                      <div className="absolute h-full top-0 bg-green-500/40 rounded-full" style={{ width: `${(t.completed / maxVal) * 100}%` }} />
                    </div>
                    <div className="text-xs w-20 text-left">
                      <span className="text-primary font-medium">{t.enrolled}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-green-600">{t.completed}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary/20 rounded" /> تسجيلات</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500/40 rounded" /> مكتملة</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">تقرير الأقسام</h2>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">القسم</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">الموظفين</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">التسجيلات</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">المكتملة</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">متوسط التقدم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deptReport.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
            ) : (
              deptReport.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{dept.nameAr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.usersCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.totalEnrollments}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{dept.completedEnrollments}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[100px]">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${dept.avgProgress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{dept.avgProgress}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
