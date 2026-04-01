"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import { Award, Download, ExternalLink, Search, CheckCircle } from "lucide-react";

interface Certificate {
  id: string;
  certificateNo: string;
  grade?: number;
  issuedAt: string;
  expiresAt?: string;
  pdfUrl?: string;
  course: { id: string; titleAr: string; titleEn: string };
  template?: { nameAr: string };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyNo, setVerifyNo] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.get("/certificates/my").then(res => {
      setCertificates(res.data);
    }).catch(() => { toast.error("حدث خطأ في تحميل الشهادات"); }).finally(() => setIsLoading(false));
  }, []);

  const handleVerify = async () => {
    if (!verifyNo.trim()) {
      toast.error("يرجى إدخال رقم الشهادة");
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.get(`/certificates/verify/${verifyNo.trim()}`);
      setVerifyResult(res.data);
    } catch {
      setVerifyResult({ valid: false });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = (cert: Certificate) => {
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, '_blank');
    } else {
      toast.info("ملف الشهادة غير متوفر حالياً");
    }
  };

  const handleView = (cert: Certificate) => {
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, '_blank');
    } else {
      // Show certificate details in a simple view
      toast.info(`شهادة: ${cert.course.titleAr} - رقم: ${cert.certificateNo}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">شهاداتي</h1>
        <p className="text-gray-500 mt-1">عرض والتحقق من الشهادات</p>
      </div>

      {/* Verify Certificate */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">التحقق من شهادة</h2>
        <div className="flex gap-3 max-w-lg">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={verifyNo} onChange={e => setVerifyNo(e.target.value)}
              placeholder="أدخل رقم الشهادة"
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              dir="ltr" onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
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

      {/* Certificates List */}
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
            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Certificate Header */}
              <div className="h-32 bg-gradient-to-bl from-primary to-primary-light relative flex items-center justify-center">
                <Award className="w-16 h-16 text-white/20" />
                <div className="absolute bottom-3 right-3">
                  <span className="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full" dir="ltr">
                    {cert.certificateNo}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{cert.course.titleAr}</h3>
                {cert.grade && <p className="text-sm text-primary font-medium mb-2">الدرجة: {cert.grade}%</p>}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>صدرت: {new Date(cert.issuedAt).toLocaleDateString("ar-SA")}</span>
                  {cert.expiresAt && <span>تنتهي: {new Date(cert.expiresAt).toLocaleDateString("ar-SA")}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(cert)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <Download className="w-4 h-4" /> تحميل
                  </button>
                  <button onClick={() => handleView(cert)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5">
                    <ExternalLink className="w-4 h-4" /> عرض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
