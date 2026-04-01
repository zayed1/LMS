"use client";

import { useState } from "react";
import { useDepartments, useDepartmentTree, createDepartment, updateDepartment, deleteDepartment, type Department } from "@/hooks/use-departments";
import { Plus, Edit, Trash2, ChevronDown, ChevronLeft, Building2, Users, X } from "lucide-react";
import { toast } from "@/lib/toast";

export default function DepartmentsPage() {
  const { departments, isLoading, refetch } = useDepartments();
  const { tree } = useDepartmentTree();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      await deleteDepartment(id);
      refetch();
    } catch {
      toast.error("لا يمكن حذف قسم يحتوي على مستخدمين");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الهيكل التنظيمي</h1>
          <p className="text-gray-500 mt-1">إدارة الأقسام والإدارات</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
            >
              قائمة
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === "tree" ? "bg-white shadow-sm" : ""}`}
            >
              شجري
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">إضافة قسم</span>
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">القسم</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">القسم الرئيسي</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">عدد الموظفين</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد أقسام
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{dept.nameAr}</p>
                          <p className="text-sm text-gray-500">{dept.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dept.parent?.nameAr || "قسم رئيسي"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{dept._count?.users || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {dept.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditing(dept); setShowModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tree View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {tree.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا يوجد أقسام</p>
          ) : (
            <div className="space-y-2">
              {tree.map((dept) => (
                <TreeNode
                  key={dept.id}
                  department={dept}
                  onEdit={(d) => { setEditing(d); setShowModal(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Department Form Modal */}
      {showModal && (
        <DepartmentFormModal
          department={editing}
          departments={departments}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSuccess={() => { setShowModal(false); setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

function TreeNode({
  department,
  level = 0,
  onEdit,
  onDelete,
}: {
  department: Department;
  level?: number;
  onEdit: (d: Department) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = department.children && department.children.length > 0;

  return (
    <div style={{ paddingRight: level * 24 }}>
      <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 group">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-6 h-6 flex items-center justify-center"
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          )}
        </button>
        <Building2 className="w-5 h-5 text-primary" />
        <span className="font-medium text-gray-800 flex-1">{department.nameAr}</span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Users className="w-3 h-3" /> {department._count?.users || 0}
        </span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button onClick={() => onEdit(department)} className="p-1 rounded hover:bg-gray-200">
            <Edit className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={() => onDelete(department.id)} className="p-1 rounded hover:bg-red-100">
            <Trash2 className="w-3.5 h-3.5 text-danger" />
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {department.children!.map((child) => (
            <TreeNode key={child.id} department={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentFormModal({
  department,
  departments,
  onClose,
  onSuccess,
}: {
  department: Department | null;
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEditing = !!department;
  const [form, setForm] = useState({
    nameAr: department?.nameAr || "",
    nameEn: department?.nameEn || "",
    parentId: department?.parentId || "",
    description: department?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const payload = { ...form, parentId: form.parentId || undefined };
      if (isEditing) {
        await updateDepartment(department!.id, payload);
      } else {
        await createDepartment(payload);
      }
      onSuccess();
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableParents = departments.filter((d) => d.id !== department?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "تعديل قسم" : "إضافة قسم جديد"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-lg border border-red-200">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم بالعربي *</label>
            <input
              type="text"
              required
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم بالإنجليزي</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القسم الرئيسي</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">قسم مستقل (جذري)</option>
              {availableParents.map((d) => (
                <option key={d.id} value={d.id}>{d.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "جاري الحفظ..." : isEditing ? "تحديث" : "إضافة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
