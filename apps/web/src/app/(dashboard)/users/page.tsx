"use client";

import { useState, useEffect, useRef } from "react";
import { useUsers, deleteUser, importUsersCSV, type User } from "@/hooks/use-users";
import { useDepartments } from "@/hooks/use-departments";
import { UserFormModal } from "@/components/users/user-form-modal";
import { Search, Plus, Upload, MoreVertical, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "@/lib/toast";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدير النظام",
  ADMIN: "مدير",
  TRAINING_MANAGER: "مدير التدريب",
  INSTRUCTOR: "مدرب",
  LEARNER: "متعلم",
};

const statusLabels: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: "نشط", class: "bg-green-100 text-green-700" },
  INACTIVE: { label: "غير نشط", class: "bg-gray-100 text-gray-700" },
  SUSPENDED: { label: "موقوف", class: "bg-red-100 text-red-700" },
  PENDING: { label: "قيد المراجعة", class: "bg-amber-100 text-amber-700" },
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (!data?.data) return;
    setSelectedIds(prev => prev.size === data.data.length ? new Set() : new Set(data.data.map(u => u.id)));
  };
  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} مستخدم؟`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteUser(id)));
      toast.success(`تم حذف ${selectedIds.size} مستخدم`);
      setSelectedIds(new Set());
      refetch();
    } catch { toast.error("حدث خطأ أثناء الحذف"); }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data, isLoading, refetch } = useUsers({
    page,
    limit: 10,
    search,
    role: roleFilter,
    status: statusFilter,
  });
  const { departments } = useDepartments();

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await deleteUser(id);
      refetch();
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importUsersCSV(file);
      refetch();
      toast.success("تم استيراد المستخدمين بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الاستيراد");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-500 mt-1">إدارة جميع مستخدمي النظام</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">استيراد CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
          <button
            onClick={() => { setEditingUser(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">إضافة مستخدم</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد الإلكتروني..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">جميع الأدوار</option>
            {Object.entries(roleLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(statusLabels).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">تم تحديد {selectedIds.size} مستخدم</span>
          <div className="flex gap-2">
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
              <Trash2 className="w-3.5 h-3.5" /> حذف المحدد
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={data?.data ? selectedIds.size === data.data.length && data.data.length > 0 : false}
                  className="w-4 h-4 text-primary rounded border-gray-300" />
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">المستخدم</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">الدور</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">القسم</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">آخر دخول</th>
              <th className="px-6 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  لا يوجد مستخدمين
                </td>
              </tr>
            ) : (
              data?.data.map((user) => (
                <tr key={user.id} className={`transition-colors ${selectedIds.has(user.id) ? "bg-primary/5" : "hover:bg-gray-50"}`}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 text-primary rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-sm font-bold">
                          {user.nameAr?.[0] || user.email[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.nameAr}</p>
                        <p className="text-sm text-gray-500" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {roleLabels[user.role] || user.role}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.department?.nameAr || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusLabels[user.status]?.class || "bg-gray-100"}`}>
                      {statusLabels[user.status]?.label || user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ar-SA") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={activeMenu === user.id ? menuRef : undefined}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                          <button
                            onClick={() => { setEditingUser(user); setShowModal(true); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" /> تعديل
                          </button>
                          <button
                            onClick={() => { handleDelete(user.id); setActiveMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" /> حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              عرض {((data.page - 1) * data.limit) + 1} - {Math.min(data.page * data.limit, data.total)} من {data.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                السابق
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          departments={departments}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSuccess={() => { setShowModal(false); setEditingUser(null); refetch(); }}
        />
      )}
    </div>
  );
}
