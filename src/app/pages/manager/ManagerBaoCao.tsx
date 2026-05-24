import { useState } from "react";
import {
  Sparkles, Download, TrendingUp, TrendingDown,
  AlertTriangle, Shield, Clock, ChevronRight,
  FileText, Brain,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const heatmapData = [
  // rows = days (T2-CN), cols = hours (8-18)
  { day: "T2",  hours: [2, 5, 3, 8, 6, 4, 7, 9, 5, 3, 1] },
  { day: "T3",  hours: [1, 4, 6, 7, 5, 3, 6, 8, 4, 2, 1] },
  { day: "T4",  hours: [3, 6, 5, 9, 7, 5, 8,10, 6, 4, 2] },
  { day: "T5",  hours: [2, 3, 4, 6, 5, 3, 5, 7, 3, 2, 1] },
  { day: "T6",  hours: [4, 7, 8,10, 8, 6, 9,10, 7, 5, 3] },
  { day: "T7",  hours: [1, 2, 3, 4, 3, 2, 3, 4, 2, 1, 0] },
  { day: "CN",  hours: [0, 1, 1, 2, 1, 1, 2, 2, 1, 0, 0] },
];

const hoursLabels = ["8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h"];

const aiInsights = [
  {
    id: 1,
    type: "warning",
    title: "Nhóm Kế toán dễ bị lừa bởi tệp đính kèm .zip",
    desc: "AI nhận thấy 4/5 lần click nhầm của nhóm Kế toán liên quan đến file .zip giả mạo hóa đơn. Hãy ưu tiên khóa học 'Nhận diện Mã độc qua File đính kèm' cho nhóm này.",
    action: "Gán khóa học Mã độc",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    iconBg: "#FFFBEB",
    iconColor: "#F59E0B",
  },
  {
    id: 2,
    type: "critical",
    title: "Trần Văn Bình cần can thiệp khẩn cấp",
    desc: "Nhân viên này đã click nhầm 4 lần liên tiếp trong 2 tuần, điểm số giảm từ 55 xuống 47. Đề xuất: Buổi đào tạo 1-1 kết hợp bài kiểm tra thực hành.",
    action: "Lên lịch đào tạo 1-1",
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
  },
  {
    id: 3,
    type: "positive",
    title: "Nhóm IT đạt tỷ lệ phát hiện 95%",
    desc: "Đội IT đã cải thiện đáng kể nhờ khóa học 'Advanced Phishing Detection'. Hãy áp dụng mô hình tương tự cho các phòng ban khác.",
    action: "Nhân rộng mô hình",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
  },
  {
    id: 4,
    type: "info",
    title: "Chiều thứ Sáu là khung giờ rủi ro cao nhất",
    desc: "Dữ liệu cho thấy 35% các lần click nhầm xảy ra vào khung 14h-16h thứ Sáu. AI đề xuất: Gửi email mô phỏng vào đúng khung giờ này để huấn luyện.",
    action: "Lên lịch chiến dịch T6",
    gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
  },
];

const monthlyStats = [
  { label: "Tỷ lệ phát hiện phishing", value: "78%", delta: "+12%", up: true, color: "#10B981" },
  { label: "Số lần click nhầm", value: "8", delta: "↓12 lần", up: false, color: "#10B981" },
  { label: "Bài học hoàn thành", value: "67%", delta: "+18%", up: true, color: "#6366F1" },
  { label: "Thời gian TB phát hiện", value: "45s", delta: "↓15s", up: false, color: "#F59E0B" },
];

/* ── Heatmap cell color ───────────────────────────── */
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

/* ── MAIN ─────────────────────────────────────────── */
export function ManagerBaoCao() {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
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
          {exporting ? (
            <><FileText size={15} /> Đang tải...</>
          ) : (
            <><Download size={15} /> Tải báo cáo PDF cho ban giám đốc</>
          )}
        </button>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {monthlyStats.map(({ label, value, delta, up, color }) => (
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
            <div className="flex items-center gap-1.5 mt-1">
              {up ? <TrendingUp size={13} style={{ color }} /> : <TrendingDown size={13} style={{ color }} />}
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color }}>{delta}</span>
              <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>tháng này</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Brain size={18} className="text-indigo-500" />
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0F172A" }}>
            Phân tích & Đề xuất từ AI
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-3xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer group"
              style={{
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              }}
            >
              {/* Gradient top border */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: insight.gradient }} />

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: insight.iconBg }}>
                  {insight.type === "warning" && <AlertTriangle size={20} style={{ color: insight.iconColor }} />}
                  {insight.type === "critical" && <AlertTriangle size={20} style={{ color: insight.iconColor }} />}
                  {insight.type === "positive" && <Shield size={20} style={{ color: insight.iconColor }} />}
                  {insight.type === "info" && <Clock size={20} style={{ color: insight.iconColor }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={14} style={{ color: insight.iconColor }} />
                    <h3 className="text-slate-800" style={{ fontWeight: 700, fontSize: "0.92rem" }}>{insight.title}</h3>
                  </div>
                  <p className="text-slate-500 mb-3" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>{insight.desc}</p>
                  <button
                    className="flex items-center gap-1 transition-colors group-hover:gap-2"
                    style={{ fontSize: "0.82rem", fontWeight: 700, color: insight.iconColor }}
                  >
                    {insight.action} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
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
              Số lần click nhầm theo ngày và giờ trong tuần · Màu đậm = rủi ro cao
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
            {heatmapData.map((row) => (
              <div key={row.day} className="grid items-center gap-1.5 mb-1.5" style={{ gridTemplateColumns: "60px repeat(11, 1fr)" }}>
                <span className="text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{row.day}</span>
                {row.hours.map((v, i) => (
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

        {/* Heatmap insights */}
        <div className="mt-5 rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}>
          <Sparkles size={16} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Phân tích từ AI: Khung giờ rủi ro cao nhất
            </p>
            <p className="text-slate-500 mt-1" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
              Thứ Tư và Thứ Sáu, khung giờ <strong>15h-16h</strong> có tỷ lệ click nhầm cao nhất (10 lần/tuần). 
              Đây là lúc nhân viên thường mệt mỏi và mất tập trung. AI đề xuất: Triển khai email mô phỏng phishing vào đúng khung giờ này 
              để tạo thói quen cảnh giác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
