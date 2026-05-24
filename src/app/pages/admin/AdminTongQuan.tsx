import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  ChevronRight,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const sparkData1 = [
  { v: 320 }, { v: 380 }, { v: 350 }, { v: 420 }, { v: 480 }, { v: 510 }, { v: 580 },
];
const sparkData2 = [
  { v: 28 }, { v: 24 }, { v: 22 }, { v: 18 }, { v: 15 }, { v: 14 }, { v: 12 },
];
const sparkData3 = [
  { v: 5 }, { v: 8 }, { v: 12 }, { v: 9 }, { v: 15 }, { v: 18 }, { v: 23 },
];
const sparkData4 = [
  { v: 62 }, { v: 65 }, { v: 68 }, { v: 72 }, { v: 74 }, { v: 78 }, { v: 83 },
];

const areaData = [
  { month: "T1", phishing: 120, spear: 45, bec: 18 },
  { month: "T2", phishing: 145, spear: 52, bec: 22 },
  { month: "T3", phishing: 138, spear: 48, bec: 28 },
  { month: "T4", phishing: 180, spear: 65, bec: 35 },
  { month: "T5", phishing: 210, spear: 72, bec: 40 },
  { month: "T6", phishing: 195, spear: 68, bec: 38 },
  { month: "T7", phishing: 240, spear: 85, bec: 45 },
  { month: "T8", phishing: 230, spear: 78, bec: 42 },
  { month: "T9", phishing: 260, spear: 92, bec: 50 },
  { month: "T10", phishing: 280, spear: 98, bec: 55 },
  { month: "T11", phishing: 310, spear: 105, bec: 48 },
  { month: "T12", phishing: 340, spear: 115, bec: 52 },
];

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Phát hiện chiến dịch BEC nhắm vào Phòng Kế toán",
    time: "2 phút trước",
    desc: "3 email giả mạo CEO yêu cầu chuyển tiền đã được gửi đến CFO.",
  },
  {
    id: 2,
    type: "warning",
    title: "Tỷ lệ click nhầm tăng 12% ở Phòng Marketing",
    time: "15 phút trước",
    desc: "Cần triển khai thêm bài đào tạo cho nhóm này.",
  },
  {
    id: 3,
    type: "critical",
    title: "Tên miền giả mạo mới được phát hiện: vcb-onIine.net",
    time: "1 giờ trước",
    desc: "Domain đã được thêm vào blacklist và thông báo cho tất cả nhân viên.",
  },
  {
    id: 4,
    type: "warning",
    title: "5 nhân viên chưa hoàn thành đào tạo bắt buộc",
    time: "3 giờ trước",
    desc: "Hạn cuối: 10/03/2026. Đã gửi nhắc nhở tự động.",
  },
  {
    id: 5,
    type: "info",
    title: "Cập nhật thư viện kịch bản: +12 kịch bản mới",
    time: "5 giờ trước",
    desc: "AI đã tạo thêm 12 kịch bản dựa trên xu hướng tấn công mới nhất.",
  },
];

const statsCards = [
  {
    label: "Tổng cuộc tấn công giả lập",
    value: "2,580",
    delta: "+18%",
    deltaUp: true,
    icon: ShieldAlert,
    color: "#6366F1",
    gradientFrom: "rgba(99,102,241,0.12)",
    gradientTo: "rgba(99,102,241,0.02)",
    sparkColor: "#6366F1",
    sparkData: sparkData1,
  },
  {
    label: "Tỷ lệ nhân viên mắc bẫy",
    value: "12%",
    delta: "↓ 6%",
    deltaUp: false,
    icon: AlertTriangle,
    color: "#F59E0B",
    gradientFrom: "rgba(245,158,11,0.12)",
    gradientTo: "rgba(245,158,11,0.02)",
    sparkColor: "#F59E0B",
    sparkData: sparkData2,
  },
  {
    label: "Báo cáo nghi vấn mới",
    value: "23",
    delta: "+8",
    deltaUp: true,
    icon: Bell,
    color: "#EF4444",
    gradientFrom: "rgba(239,68,68,0.12)",
    gradientTo: "rgba(239,68,68,0.02)",
    sparkColor: "#EF4444",
    sparkData: sparkData3,
  },
  {
    label: "Điểm an toàn trung bình",
    value: "83/100",
    delta: "+5 pts",
    deltaUp: true,
    icon: TrendingUp,
    color: "#10B981",
    gradientFrom: "rgba(16,185,129,0.12)",
    gradientTo: "rgba(16,185,129,0.02)",
    sparkColor: "#10B981",
    sparkData: sparkData4,
  },
];

/* ── Sparkline ────────────────────────────────────── */
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div style={{ width: "100%", height: 40 }}>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={data} id={`spark-${color.replace('#','')}`}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function AdminTongQuan() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "12m">("12m");

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-slate-800"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
          >
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            Giám sát sức khỏe bảo mật toàn tổ chức theo thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
            <Activity size={14} className="text-emerald-600" />
            <span className="text-emerald-700" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>

      {/* Stats cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map(({ label, value, delta, deltaUp, icon: Icon, color, gradientFrom, gradientTo, sparkColor, sparkData }) => (
          <div
            key={label}
            className="rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-slate-500" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{label}</p>
                <p className="mt-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.7rem", color: "#0F172A" }}>
                  {value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            </div>

            {/* Delta */}
            <div className="flex items-center gap-1.5 mb-3">
              {deltaUp ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-emerald-500" />
              )}
              <span
                className="text-emerald-600"
                style={{ fontSize: "0.78rem", fontWeight: 700 }}
              >
                {delta}
              </span>
              <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>so với tháng trước</span>
            </div>

            {/* Sparkline */}
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        ))}
      </div>

      {/* Main chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Area Chart */}
        <div
          className="lg:col-span-3 rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
                Diễn biến tấn công theo thời gian
              </h3>
              <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.78rem" }}>Phân loại theo hình thức phishing</p>
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ background: "#F1F5F9", border: "1px solid rgba(99,102,241,0.08)" }}>
              {(["7d", "30d", "12m"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: timeRange === range ? 700 : 500,
                    color: timeRange === range ? "#fff" : "#64748B",
                    background: timeRange === range ? "#6366F1" : "transparent",
                    borderRadius: timeRange === range ? 10 : 0,
                  }}
                >
                  {range === "7d" ? "7 ngày" : range === "30d" ? "30 ngày" : "12 tháng"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", minHeight: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={areaData} id="admin-area-chart">
                <defs>
                  <linearGradient id="areaIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="areaTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="areaPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    fontSize: 12,
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.95)",
                  }}
                />
                <Area type="monotone" dataKey="phishing" name="Phishing" stroke="#6366F1" strokeWidth={2.5} fill="url(#areaIndigo)" />
                <Area type="monotone" dataKey="spear" name="Spear Phishing" stroke="#14B8A6" strokeWidth={2} fill="url(#areaTeal)" />
                <Area type="monotone" dataKey="bec" name="BEC/CEO Fraud" stroke="#EC4899" strokeWidth={2} fill="url(#areaPink)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6 mt-4">
            {[
              { color: "#6366F1", label: "Phishing" },
              { color: "#14B8A6", label: "Spear Phishing" },
              { color: "#EC4899", label: "BEC / CEO Fraud" },
            ].map(({ color: c, label: l }) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: c }} />
                <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time alerts */}
        <div
          className="lg:col-span-2 rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell size={17} className="text-red-500" />
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
                Cảnh báo bảo mật
              </h3>
            </div>
            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {alerts.filter((a) => a.type === "critical").length} khẩn cấp
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const isCritical = alert.type === "critical";
              const isWarning = alert.type === "warning";
              const dotColor = isCritical ? "#EF4444" : isWarning ? "#F59E0B" : "#6366F1";
              const glowColor = isCritical
                ? "rgba(239,68,68,0.15)"
                : isWarning
                ? "rgba(245,158,11,0.12)"
                : "rgba(99,102,241,0.08)";

              return (
                <div
                  key={alert.id}
                  className="rounded-2xl p-4 transition-all hover:shadow-sm cursor-pointer group"
                  style={{
                    background: glowColor,
                    border: `1px solid ${isCritical ? "rgba(239,68,68,0.12)" : isWarning ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.08)"}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Glowing dot */}
                    <div className="mt-1.5 shrink-0 relative">
                      <span
                        className="block w-2.5 h-2.5 rounded-full"
                        style={{
                          background: dotColor,
                          boxShadow: `0 0 8px ${dotColor}60, 0 0 16px ${dotColor}30`,
                        }}
                      />
                      {isCritical && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{ background: dotColor, opacity: 0.4 }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-slate-800"
                        style={{ fontWeight: 600, fontSize: "0.83rem", lineHeight: 1.5 }}
                      >
                        {alert.title}
                      </p>
                      <p className="text-slate-500 mt-1" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                        {alert.desc}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={11} className="text-slate-400" />
                        <span className="text-slate-400" style={{ fontSize: "0.7rem" }}>{alert.time}</span>
                      </div>
                    </div>

                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}