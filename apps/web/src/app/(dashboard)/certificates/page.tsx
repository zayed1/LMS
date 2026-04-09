"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import { confirmAction } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/lib/auth";
import { Award, Download, ExternalLink, Search, CheckCircle, X, QrCode, Share2, Plus, Trash2, UserPlus } from "lucide-react";

interface Certificate {
  id: string;
  certificateNo: string;
  grade?: number;
  issuedAt: string;
  expiresAt?: string;
  pdfUrl?: string;
  course: { id: string; titleAr: string; titleEn: string };
  user?: { id: string; nameAr: string; nameEn: string; email: string };
  template?: { nameAr: string };
}

const adminRoles = ["SUPER_ADMIN", "ADMIN", "TRAINING_MANAGER"];

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const isAdmin = adminRoles.includes(user?.role || "");
  const [activeTab, setActiveTab] = useState<"my" | "manage">("my");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyNo, setVerifyNo] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    api.get("/certificates/my").then(res => setCertificates(res.data))
      .catch(() => { toast.error("حدث خطأ في تحميل الشهادات"); })
      .finally(() => setIsLoading(false));
  }, []);

  const loadAllCertificates = () => {
    api.get("/certificates/all").then(res => setAllCertificates(res.data)).catch(() => { toast.error("حدث خطأ"); });
  };

  useEffect(() => { if (isAdmin && activeTab === "manage") loadAllCertificates(); }, [activeTab]);

  const handleVerify = async () => {
    if (!verifyNo.trim()) { toast.error("يرجى إدخال رقم الشهادة"); return; }
    setVerifying(true); setVerifyResult(null);
    try { const res = await api.get(`/certificates/verify/${verifyNo.trim()}`); setVerifyResult(res.data); }
    catch { setVerifyResult({ valid: false }); }
    finally { setVerifying(false); }
  };

  const handleDownload = (cert: Certificate) => {
    if (cert.pdfUrl) window.open(cert.pdfUrl, '_blank');
    else toast.info("ملف الشهادة غير متوفر حالياً");
  };

  const handleDelete = async (id: string) => {
    if (!await confirmAction({ title: "حذف الشهادة", message: "سيتم حذف هذه الشهادة نهائياً. هل أنت متأكد؟" })) return;
    try { await api.delete(`/certificates/${id}`); toast.success("تم حذف الشهادة"); loadAllCertificates(); }
    catch { toast.error("حدث خطأ في الحذف"); }
  };

  const tabs = [
    { key: "my", label: "شهاداتي" },
    ...(isAdmin ? [{ key: "manage", label: "إدارة الشهادات" }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{activeTab === "manage" ? "إدارة الشهادات" : "شهاداتي"}</h1>
          <p className="text-gray-500 mt-1">{activeTab === "manage" ? "إصدار وإدارة شهادات المتدربين" : "عرض والتحقق من الشهادات"}</p>
        </div>
        {isAdmin && activeTab === "manage" && (
          <button onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> إصدار شهادة
          </button>
        )}
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>{tab.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* ─── My Certificates Tab ─── */}
      {activeTab === "my" && (
        <>
          {/* Verify */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">التحقق من شهادة</h2>
            <div className="flex gap-3 max-w-lg">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={verifyNo} onChange={e => setVerifyNo(e.target.value)} placeholder="أدخل رقم الشهادة"
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  dir="ltr" onKeyDown={e => e.key === 'Enter' && handleVerify()} />
              </div>
              <button onClick={handleVerify} disabled={verifying}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {verifying ? "جاري..." : "تحقق"}
              </button>
            </div>
            {verifyResult && (
              <div className={`mt-4 p-4 rounded-lg ${verifyResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                {verifyResult.valid ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium">شهادة صالحة</p>
                      <p className="text-sm text-green-600">{verifyResult.certificate.user.nameAr} - {verifyResult.certificate.course.titleAr}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-700 font-medium">رقم الشهادة غير صالح أو غير موجود</p>
                )}
              </div>
            )}
          </div>

          {/* My Certificates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">لا توجد شهادات</h3>
              <p className="text-gray-400 mt-1">أكمل دوراتك للحصول على شهادات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover">
                  <div className="h-32 bg-gradient-to-bl from-primary to-primary-light relative flex items-center justify-center cert-shine">
                    <Award className="w-16 h-16 text-white/20" />
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full" dir="ltr">{cert.certificateNo}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{cert.course.titleAr}</h3>
                    {cert.grade != null && <p className="text-sm text-primary font-medium mb-2">الدرجة: {cert.grade}%</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>صدرت: {new Date(cert.issuedAt).toLocaleDateString("ar-SA")}</span>
                      {cert.expiresAt && <span>تنتهي: {new Date(cert.expiresAt).toLocaleDateString("ar-SA")}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDownload(cert)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                        <Download className="w-4 h-4" /> تحميل
                      </button>
                      <button onClick={() => setPreviewCert(cert)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5">
                        <ExternalLink className="w-4 h-4" /> عرض
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Admin Manage Tab ─── */}
      {activeTab === "manage" && isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">المتدرب</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">الدورة</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">رقم الشهادة</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">الدرجة</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">تاريخ الاصدار</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allCertificates.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">لا توجد شهادات مصدرة</td></tr>
              ) : allCertificates.map(cert => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div><p className="text-sm font-medium text-gray-800">{cert.user?.nameAr}</p><p className="text-xs text-gray-400" dir="ltr">{cert.user?.email}</p></div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{cert.course.titleAr}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 font-mono" dir="ltr">{cert.certificateNo}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{cert.grade != null ? `${cert.grade}%` : "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(cert.issuedAt).toLocaleDateString("ar-SA")}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Issue Certificate Modal ─── */}
      {showIssueModal && <IssueCertificateModal onClose={() => setShowIssueModal(false)} onSuccess={() => { setShowIssueModal(false); loadAllCertificates(); }} />}

      {/* ─── Preview Modal ─── */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewCert(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-bl from-primary to-primary-light p-8 text-center text-white relative">
              <button onClick={() => setPreviewCert(null)} className="absolute top-3 left-3 p-1 rounded-lg bg-white/10 hover:bg-white/20"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center"><Award className="w-8 h-8" /></div>
              <p className="text-white/70 text-xs mb-1">شهادة إتمام</p>
              <h3 className="text-xl font-bold mb-1">{previewCert.course.titleAr}</h3>
              <p className="text-white/80 text-sm">{previewCert.course.titleEn}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs mb-1">رقم الشهادة</span><span className="font-mono font-bold text-gray-800" dir="ltr">{previewCert.certificateNo}</span></div>
                {previewCert.grade != null && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs mb-1">الدرجة</span><span className="font-bold text-primary">{previewCert.grade}%</span></div>}
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs mb-1">تاريخ الإصدار</span><span className="font-medium text-gray-800">{new Date(previewCert.issuedAt).toLocaleDateString("ar-SA")}</span></div>
                {previewCert.expiresAt && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs mb-1">تاريخ الانتهاء</span><span className="font-medium text-gray-800">{new Date(previewCert.expiresAt).toLocaleDateString("ar-SA")}</span></div>}
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="w-28 h-28 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <QrCode className="w-10 h-10 text-gray-400 mb-1" /><span className="text-[10px] text-gray-400">رمز التحقق</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(previewCert)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"><Download className="w-4 h-4" /> تحميل</button>
                <button onClick={() => { navigator.clipboard.writeText(previewCert.certificateNo); toast.success("تم نسخ رقم الشهادة"); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><Share2 className="w-4 h-4" /> مشاركة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Issue Certificate Modal ─── */
function IssueCertificateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", courseId: "", grade: "", expiresAt: "", pdfUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/users?limit=100"),
      api.get("/courses?limit=100"),
    ]).then(([u, c]) => {
      setUsers(u.data?.data || []);
      setCourses(c.data?.data || []);
    }).catch(() => toast.error("حدث خطأ في تحميل البيانات"));
  }, []);

  const filteredUsers = users.filter(u =>
    !userSearch || u.nameAr?.includes(userSearch) || u.email?.includes(userSearch)
  );
  const filteredCourses = courses.filter(c =>
    !courseSearch || c.titleAr?.includes(courseSearch) || c.titleEn?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.courseId) { toast.error("يرجى اختيار المتدرب والدورة"); return; }
    setSubmitting(true);
    try {
      const payload: any = {
        userId: form.userId,
        courseId: form.courseId,
        grade: form.grade ? Number(form.grade) : undefined,
        expiresAt: form.expiresAt || undefined,
        pdfUrl: form.pdfUrl || undefined,
      };
      await api.post("/certificates/issue", payload);
      toast.success("تم إصدار الشهادة بنجاح");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ في إصدار الشهادة");
    } finally { setSubmitting(false); }
  };

  const selectedUser = users.find(u => u.id === form.userId);
  const selectedCourse = courses.find(c => c.id === form.courseId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary" /></div>
            <div><h2 className="text-lg font-semibold text-gray-800">إصدار شهادة</h2><p className="text-xs text-gray-400">اختر المتدرب والدورة لإصدار الشهادة</p></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المتدرب *</label>
            <input type="text" placeholder="بحث بالاسم أو البريد..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {selectedUser && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><span className="text-primary text-xs font-bold">{selectedUser.nameAr?.[0]}</span></div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-800">{selectedUser.nameAr}</p><p className="text-xs text-gray-400" dir="ltr">{selectedUser.email}</p></div>
                <button type="button" onClick={() => setForm({ ...form, userId: "" })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            )}
            {!selectedUser && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.slice(0, 20).map(u => (
                  <button type="button" key={u.id} onClick={() => { setForm({ ...form, userId: u.id }); setUserSearch(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-right border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{u.nameAr}</span>
                    <span className="text-xs text-gray-400 mr-auto" dir="ltr">{u.email}</span>
                  </button>
                ))}
                {filteredUsers.length === 0 && <p className="text-center text-gray-400 text-sm py-3">لا توجد نتائج</p>}
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الدورة *</label>
            <input type="text" placeholder="بحث في الدورات..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {selectedCourse && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-800 flex-1">{selectedCourse.titleAr}</span>
                <button type="button" onClick={() => setForm({ ...form, courseId: "" })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            )}
            {!selectedCourse && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredCourses.slice(0, 20).map(c => (
                  <button type="button" key={c.id} onClick={() => { setForm({ ...form, courseId: c.id }); setCourseSearch(""); }}
                    className="w-full text-right px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50 last:border-0">
                    {c.titleAr}
                  </button>
                ))}
                {filteredCourses.length === 0 && <p className="text-center text-gray-400 text-sm py-3">لا توجد نتائج</p>}
              </div>
            )}
          </div>

          {/* Grade & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة (%)</label>
              <input type="number" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} min={0} max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="اختياري" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>

          {/* PDF URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط ملف الشهادة (PDF)</label>
            <input type="url" value={form.pdfUrl} onChange={e => setForm({ ...form, pdfUrl: e.target.value })} dir="ltr"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="https://example.com/certificate.pdf" />
            <p className="text-xs text-gray-400 mt-1">اختياري - رابط مباشر لملف PDF الشهادة</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              <Award className="w-4 h-4" /> {submitting ? "جاري الإصدار..." : "إصدار الشهادة"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
