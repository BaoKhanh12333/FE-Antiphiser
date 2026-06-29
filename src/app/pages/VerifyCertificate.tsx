import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import axiosInstance from "../api/axiosInstance";

export function VerifyCertificate() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;
    (axiosInstance as any)
      .get(`Certificate/verify/${code}`)
      .then((res: any) => {
        if (res?.isSuccess) setData(res.result);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  const date = data?.issuedAt
    ? new Date(data.issuedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logo bar */}
      <div className="flex items-center gap-2 mb-10">
        <Shield size={24} className="text-indigo-500" />
        <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#4338CA" }}>AntiPhisher</span>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span>Đang xác minh chứng chỉ...</span>
        </div>
      )}

      {!loading && error && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <XCircle size={56} className="text-red-400 mx-auto mb-4" />
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F172A", marginBottom: 8 }}>
            Không tìm thấy chứng chỉ
          </h1>
          <p className="text-slate-400 mb-6">
            Mã chứng chỉ <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{code}</span> không tồn tại hoặc đã bị thu hồi.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "#6366F1" }}
          >
            Về trang chủ
          </Link>
        </motion.div>
      )}

      {!loading && data && (
        <motion.div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#fff",
            borderRadius: 24,
            padding: 36,
            boxShadow: "0 4px 32px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-6">
            {data.isValid ? (
              <>
                <CheckCircle size={22} className="text-emerald-500" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#059669" }}>Chứng chỉ hợp lệ</span>
              </>
            ) : (
              <>
                <XCircle size={22} className="text-red-400" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#DC2626" }}>Chứng chỉ đã bị thu hồi</span>
              </>
            )}
          </div>

          {/* Visual strip */}
          <div
            style={{
              background: "linear-gradient(135deg, #1E1B4B, #4338CA)",
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 24,
              color: "#fff",
            }}
          >
            <p style={{ fontSize: "0.68rem", color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Được cấp cho
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>{data.fullNameSnapshot}</p>
            {data.companyNameSnapshot && (
              <p style={{ fontSize: "0.85rem", color: "#A5B4FC" }}>{data.companyNameSnapshot}</p>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: "0.65rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Tỉ lệ đúng</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#059669" }}>{data.correctRateSnapshot?.toFixed(1)}%</p>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: "0.65rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Bài thực hành</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A" }}>{data.totalAttemptsSnapshot}</p>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: "0.65rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Ngày cấp</p>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{date}</p>
            </div>
          </div>

          {/* Code */}
          <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.68rem", color: "#94A3B8", marginRight: 12 }}>Mã chứng chỉ</p>
            <p style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1rem", color: "#4338CA", letterSpacing: "0.06em" }}>{data.certificateCode}</p>
          </div>

          <p className="text-center text-slate-400 mt-5" style={{ fontSize: "0.75rem" }}>
            Chứng chỉ này được cấp bởi hệ thống AntiPhisher — nền tảng đào tạo nhận thức bảo mật.
          </p>
        </motion.div>
      )}
    </div>
  );
}
