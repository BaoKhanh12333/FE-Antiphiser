import { useState } from "react";
import {
  Brain, AlertTriangle, Shield, Clock, ChevronRight, Search, Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import axiosInstance from "../../api/axiosInstance";
import mascotPoint from "../../../data/mascot/point.png";
import mascotSurprised from "../../../data/mascot/surprised.png";

const cardCls = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
  border: "1px solid rgba(255,255,255,0.8)",
  borderRadius: 24,
  padding: 24,
};

export function AdminBaoCaoAI() {
  const [companyId, setCompanyId] = useState("");
  const [orgReport, setOrgReport] = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [searched, setSearched]   = useState(false);

  function handleSearch() {
    const id = parseInt(companyId, 10);
    if (!id || id <= 0) {
      setError("Vui lòng nhập ID công ty hợp lệ (số nguyên dương).");
      return;
    }
    setLoading(true);
    setError(null);
    setOrgReport(null);
    setSearched(true);
    (axiosInstance as any)
      .get(`org-report?companyId=${id}`)
      .then((data: any) => setOrgReport(data))
      .catch(() => setError("Không tìm thấy báo cáo cho ID công ty này hoặc công ty chưa có dữ liệu."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
          Báo cáo AI Tổ chức
        </h1>
        <p className="text-slate-400 mt-1" style={{ fontSize: "0.875rem" }}>
          Xem phân tích bảo mật và đề xuất AI cho từng tổ chức trong hệ thống
        </p>
      </div>

      {/* Company ID selector */}
      <div style={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-indigo-500" />
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Chọn tổ chức</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            min={1}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập ID công ty (vd: 1, 2, 3...)"
            style={{
              flex: 1,
              minWidth: 220,
              maxWidth: 360,
              height: 44,
              border: "1.5px solid rgba(99,102,241,0.25)",
              borderRadius: 12,
              padding: "0 14px",
              fontSize: "0.9rem",
              color: "#0F172A",
              outline: "none",
              background: "#F8F9FF",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 12,
              background: loading ? "#94A3B8" : "#6366F1",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? "Đang tải..." : "Xem báo cáo"}
          </button>
        </div>
        {error && (
          <p className="mt-3" style={{ fontSize: "0.83rem", color: "#DC2626" }}>{error}</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
          <span className="ml-3 text-slate-400 text-sm">Đang phân tích dữ liệu tổ chức...</span>
        </div>
      )}

      {/* Empty / not searched yet */}
      {!loading && !orgReport && !searched && (
        <div style={{ ...cardCls, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
          <img src={mascotPoint} alt="mascot" className="w-20 h-20 object-contain" />
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>Nhập ID công ty để xem báo cáo</p>
          <p className="text-slate-400 max-w-sm" style={{ fontSize: "0.83rem", lineHeight: 1.7 }}>
            Hệ thống sẽ hiển thị phân tích AI đầy đủ gồm tóm tắt điều hành, rủi ro, chiến thuật và danh sách nhân viên cần chú ý.
          </p>
        </div>
      )}

      {/* Error state after search */}
      {!loading && searched && !orgReport && error && (
        <div style={{ ...cardCls, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48, textAlign: "center" }}>
          <img src={mascotSurprised} alt="mascot" className="w-16 h-16 object-contain" />
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>Không tìm thấy dữ liệu</p>
        </div>
      )}

      {/* Report content */}
      {!loading && orgReport && (
        <div className="space-y-4">
          {/* Executive Summary */}
          <motion.div
            style={cardCls}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={mascotPoint} alt="mascot" className="w-12 h-12 object-contain" />
              <div>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Tóm tắt điều hành</p>
                <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                  {orgReport.companyName} · ID: {orgReport.companyId} · {orgReport.totalEmployees} nhân viên · Tỷ lệ thất bại: {orgReport.orgFailRate?.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-slate-700" style={{ fontSize: "0.88rem", lineHeight: 1.8 }}>{orgReport.executiveSummary}</p>
          </motion.div>

          {/* Top Risks + Tactic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              style={cardCls}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Rủi ro hàng đầu</p>
              </div>
              <div className="space-y-3">
                {(orgReport.topRisks ?? []).map((risk: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span
                      className="shrink-0 flex items-center justify-center rounded-full font-bold"
                      style={{ width: 22, height: 22, background: "#FEF2F2", color: "#DC2626", fontSize: "0.7rem" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-slate-700" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{risk}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              style={cardCls}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-indigo-500 shrink-0" />
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Phân tích chiến thuật</p>
              </div>
              <div className="space-y-4">
                {(orgReport.tacticBreakdown ?? []).map((t: any) => (
                  <div key={t.categoryName}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-600" style={{ fontSize: "0.82rem" }}>{t.categoryName}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: t.failRate > 50 ? "#EF4444" : t.failRate > 25 ? "#F59E0B" : "#10B981" }}>
                        {t.failRate?.toFixed(1)}% thất bại
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#F1F5F9" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(t.failRate ?? 0, 100)}%`,
                          background: t.failRate > 50 ? "#EF4444" : t.failRate > 25 ? "#F59E0B" : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* High Risk Users */}
          {(orgReport.highRiskUsers ?? []).length > 0 && (
            <motion.div
              style={cardCls}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-orange-500 shrink-0" />
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Nhân viên cần chú ý</p>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Nhân viên", "Điểm rủi ro", "Số lỗi"].map((h) => (
                        <th key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 12px 10px", textAlign: "left", borderBottom: "1px solid #F1F5F9" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orgReport.highRiskUsers.map((u: any, i: number) => (
                      <tr key={u.userId} style={{ borderBottom: i < orgReport.highRiskUsers.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        <td style={{ padding: "10px 12px", fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>{u.fullName}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, background: u.riskScore > 70 ? "#FEF2F2" : u.riskScore > 40 ? "#FFFBEB" : "#ECFDF5", color: u.riskScore > 70 ? "#DC2626" : u.riskScore > 40 ? "#D97706" : "#059669", padding: "3px 10px", borderRadius: 6 }}>
                            {u.riskScore?.toFixed(0)}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: "0.85rem", color: "#475569" }}>{u.totalFlaws} lỗi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* AI Suggestion */}
          <motion.div
            className="rounded-3xl p-5 flex items-start gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <ChevronRight size={20} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#4338CA", marginBottom: 6 }}>
                Đề xuất chiến dịch tiếp theo{" "}
                <span style={{ fontWeight: 700, fontSize: "0.78rem", background: "#EEF2FF", color: "#6366F1", padding: "2px 10px", borderRadius: 6, marginLeft: 8 }}>
                  {orgReport.suggestedDifficulty === "Easy" ? "Dễ" : orgReport.suggestedDifficulty === "Medium" ? "Trung bình" : "Khó"}
                </span>
              </p>
              <p className="text-slate-600" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{orgReport.suggestedNextCampaignContext}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
