import { useState, useEffect } from "react";
import {
  Sparkles, Download, AlertTriangle, Shield, Clock,
  ChevronRight, FileText, Brain, Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { analyticsService } from "../../services/analyticsService";
import axiosInstance from "../../api/axiosInstance";
import mascotPoint from "../../../data/mascot/point.png";
import mascotSurprised from "../../../data/mascot/surprised.png";

/* ── Heatmap helpers ────────────────────────────────── */
// UI shows working hours 8h–18h → slice hours[8..18] from 24-element array
const hoursLabels = ["8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h"];

function heatColor(v: number): string {
  if (v === 0) return "#F8FAFF";
  if (v <= 2) return "#E0E7FF";
  if (v <= 4) return "#C7D2FE";
  if (v <= 6) return "#A5B4FC";
  if (v <= 8) return "#818CF8";
  return "#6366F1";
}
function heatTextColor(v: number): string {
  return v >= 7 ? "#fff" : "#64748B";
}

/* ── MAIN ─────────────────────────────────────────────── */
export function ManagerBaoCao() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [orgReport, setOrgReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    analyticsService
      .getCompanyOverview()
      .then((data: any) => setOverview(data))
      .catch((err: any) => console.error("BaoCao load error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoadingReport(true);
    (axiosInstance as any)
      .get("org-report")
      .then((data: any) => setOrgReport(data))
      .catch(() => setOrgReport(null))
      .finally(() => setLoadingReport(false));
  }, []);

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  }

  /* 4 stat cards — deltas ẩn (không có time-series) */
  const stats = overview
    ? [
        { label: "Tỷ lệ phát hiện phishing", value: `${overview.overallDetectionRate}%`, color: "#10B981" },
        { label: "Số lần click nhầm",          value: `${overview.totalClickedLink} lần`,   color: "#EF4444" },
        { label: "Bài học hoàn thành",          value: `${overview.lessonCompletionRate}%`,  color: "#6366F1" },
        {
          label: "Thời gian TB phát hiện",
          value: overview.avgDetectionSeconds > 0 ? `${overview.avgDetectionSeconds}s` : "—",
          color: "#F59E0B",
        },
      ]
    : [];

  /* Heatmap data: slice giờ làm việc 8h-18h từ mảng 24 phần tử */
  const heatmapRows = (overview?.heatmap ?? []).map((row: any) => ({
    day: row.day,
    hours: (row.hours as number[]).slice(8, 19), // index 8..18 inclusive → 11 giờ
  }));

  /* Tìm khung giờ cao nhất để sinh insight text động */
  const peakInfo = (() => {
    if (!heatmapRows.length) return null;
    let maxVal = 0, maxDay = "", maxHour = 8;
    heatmapRows.forEach((row: any) => {
      row.hours.forEach((v: number, i: number) => {
        if (v > maxVal) { maxVal = v; maxDay = row.day; maxHour = i + 8; }
      });
    });
    return maxVal > 0 ? { day: maxDay, hour: maxHour, val: maxVal } : null;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-400 text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Báo cáo & Phân tích AI
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            Phân tích hiệu suất bảo mật và đề xuất từ AI cho phòng ban
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: exporting ? "#10B981" : "#0F172A",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 16px rgba(15,23,42,0.2)",
          }}
        >
          {exporting ? <><FileText size={15} /> Đang tải...</> : <><Download size={15} /> Tải báo cáo PDF</>}
        </button>
      </div>

      {/* Stat cards — delta ẩn */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-3xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <p className="text-slate-500 mb-1" style={{ fontSize: "0.78rem" }}>{label}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#0F172A" }}>{value}</p>
            <p className="text-slate-300 mt-1" style={{ fontSize: "0.7rem" }}>Dữ liệu thực tế</p>
          </div>
        ))}
      </div>

      {/* AI Org Report */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Brain size={18} className="text-indigo-500" />
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0F172A" }}>
            Phân tích & Đề xuất từ AI
          </h2>
        </div>

        {loadingReport ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
            <span className="ml-2 text-slate-400 text-sm">Đang phân tích dữ liệu tổ chức...</span>
          </div>
        ) : !orgReport ? (
          <div
            className="rounded-3xl p-8 flex flex-col items-center gap-3 text-center"
            style={{
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <img src={mascotSurprised} alt="mascot" className="w-16 h-16 object-contain" />
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>Chưa có dữ liệu AI</p>
            <p className="text-slate-400 max-w-sm" style={{ fontSize: "0.83rem", lineHeight: 1.7 }}>
              Hệ thống cần ít nhất một chu kỳ thực hành để tạo phân tích AI cho tổ chức.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Executive Summary */}
            <motion.div
              className="rounded-3xl p-6"
              style={{
                background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={mascotPoint} alt="mascot" className="w-12 h-12 object-contain" />
                <div>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Tóm tắt điều hành</p>
                  <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                    {orgReport.companyName} · {orgReport.totalEmployees} nhân viên · Tỷ lệ thất bại: {orgReport.orgFailRate?.toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="text-slate-700" style={{ fontSize: "0.88rem", lineHeight: 1.8 }}>{orgReport.executiveSummary}</p>
            </motion.div>

            {/* Top Risks + Tactic Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
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

      {/* Heatmap: data thật từ company-overview */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
              Bản đồ nhiệt: Khung giờ mất cảnh giác
            </h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.78rem" }}>
              Số lần click nhầm theo ngày và giờ trong tuần (UTC+7) · Màu đậm = rủi ro cao
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Thấp</span>
            {[0, 2, 4, 6, 8, 10].map((v) => (
              <div key={`legend-${v}`} className="w-4 h-4 rounded" style={{ background: heatColor(v) }} />
            ))}
            <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Cao</span>
          </div>
        </div>

        {heatmapRows.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">Chưa có dữ liệu thực hành nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hours header */}
              <div className="grid items-center gap-1.5 mb-2" style={{ gridTemplateColumns: "60px repeat(11, 1fr)" }}>
                <span />
                {hoursLabels.map((h) => (
                  <span key={h} className="text-center text-slate-400" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {heatmapRows.map((row: any) => (
                <div key={row.day} className="grid items-center gap-1.5 mb-1.5" style={{ gridTemplateColumns: "60px repeat(11, 1fr)" }}>
                  <span className="text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{row.day}</span>
                  {row.hours.map((v: number, i: number) => (
                    <div
                      key={`heat-${row.day}-${i}`}
                      className="rounded-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                      style={{
                        height: 36,
                        background: heatColor(v),
                        color: heatTextColor(v),
                        fontSize: "0.72rem",
                        fontWeight: v >= 7 ? 700 : 500,
                      }}
                      title={`${row.day} ${hoursLabels[i]}: ${v} lần click nhầm`}
                    >
                      {v > 0 ? v : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insight text động từ data thật */}
        <div className="mt-5 rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}>
          <Sparkles size={16} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Phân tích dữ liệu: Khung giờ rủi ro
            </p>
            <p className="text-slate-500 mt-1" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
              {peakInfo
                ? <>Khung giờ rủi ro cao nhất là <strong>{peakInfo.day} {peakInfo.hour}h</strong> với <strong>{peakInfo.val} lần</strong> click nhầm. Hãy cân nhắc gửi email mô phỏng vào đúng khung giờ này để tăng cảnh giác.</>
                : "Chưa có dữ liệu click nhầm. Hệ thống sẽ hiển thị phân tích khi nhân viên thực hành."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
