import { useState, useEffect } from "react";
import {
  Sparkles, Download, AlertTriangle, Shield, Clock,
  ChevronRight, FileText, Brain, Loader2, Construction,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

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

  useEffect(() => {
    analyticsService
      .getCompanyOverview()
      .then((data: any) => setOverview(data))
      .catch((err: any) => console.error("BaoCao load error:", err))
      .finally(() => setLoading(false));
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

      {/* AI Insights — placeholder (chưa có nguồn dữ liệu) */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Brain size={18} className="text-indigo-500" />
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0F172A" }}>
            Phân tích & Đề xuất từ AI
          </h2>
        </div>

        <div
          className="rounded-3xl p-8 flex flex-col items-center gap-3 text-center"
          style={{
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
            border: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
            <Construction size={28} className="text-indigo-400" />
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>Đang phát triển</p>
          <p className="text-slate-400 max-w-sm" style={{ fontSize: "0.83rem", lineHeight: 1.7 }}>
            Tính năng phân tích & đề xuất từ AI đang được xây dựng.
            Hệ thống sẽ tự động sinh insight từ dữ liệu thực hành của nhân viên.
          </p>
        </div>
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
