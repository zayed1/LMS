"use client";

import Link from "next/link";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

const stats = [
  { title: "إجمالي المستخدمين", value: "0", icon: Users, color: "bg-primary", change: "+0%" },
  { title: "الدورات النشطة", value: "0", icon: BookOpen, color: "bg-primary-light", change: "+0%" },
  { title: "المتعلمين النشطين", value: "0", icon: GraduationCap, color: "bg-success", change: "+0%" },
  { title: "معدل الإكمال", value: "0%", icon: TrendingUp, color: "bg-amber-500", change: "+0%" },
];

const recentActivities = [
  { user: "أحمد محمد", action: "أكمل دورة", target: "أساسيات الأمن السيبراني", time: "منذ ساعتين" },
  { user: "فاطمة علي", action: "بدأ دورة", target: "إدارة المشاريع", time: "منذ 3 ساعات" },
  { user: "خالد سعود", action: "اجتاز اختبار", target: "مقدمة في البرمجة", time: "منذ 5 ساعات" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في نظام إدارة التعلم</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <span className="text-xs text-success mt-1 inline-block">{stat.change}</span>
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
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm font-bold">{activity.user[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="text-primary">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
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
