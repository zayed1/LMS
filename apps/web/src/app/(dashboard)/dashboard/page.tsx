"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

interface DashboardStats {
  users: { total: number; active: number };
  courses: { total: number; published: number };
  enrollments: { total: number; completed: number; completionRate: number };
  departments: number;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target?: string;
  time: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard"),
      api.get("/reports/recent-activities?limit=5"),
    ]).then(([statsRes, activitiesRes]) => {
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    }).catch(() => { toast.error("حدث خطأ في تحميل البيانات"); }).finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { title: "إجمالي المستخدمين", value: stats?.users.total ?? 0, icon: Users, color: "bg-primary", change: stats ? `${stats.users.active} نشط` : "" },
    { title: "الدورات النشطة", value: stats?.courses.published ?? 0, icon: BookOpen, color: "bg-primary-light", change: stats ? `${stats.courses.total} إجمالي` : "" },
    { title: "المتعلمين المسجلين", value: stats?.enrollments.total ?? 0, icon: GraduationCap, color: "bg-success", change: stats ? `${stats.enrollments.completed} مكتمل` : "" },
    { title: "معدل الإكمال", value: `${stats?.enrollments.completionRate ?? 0}%`, icon: TrendingUp, color: "bg-amber-500", change: "" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في نظام إدارة التعلم</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                {isLoading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                )}
                {stat.change && <span className="text-xs text-success mt-1 inline-block">{stat.change}</span>}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">آخر النشاطات</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">لا توجد نشاطات حديثة</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-sm font-bold">{activity.user?.[0] || "?"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      {activity.target && <span className="text-primary">{activity.target}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "إضافة مستخدم", href: "/users", icon: "👤" },
              { label: "إنشاء دورة", href: "/courses/new", icon: "📚" },
              { label: "الدورات", href: "/courses", icon: "📝" },
              { label: "عرض التقارير", href: "/reports", icon: "📊" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
