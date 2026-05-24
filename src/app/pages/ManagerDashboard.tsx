import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import {
  TrendingUp, Users, AlertTriangle, Award, ChevronRight, Star,
  ArrowUpRight, ArrowDownRight, Send,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const teamProgress = [
  { month: "T10", ketoan: 42, it: 68, kinh_doanh: 35 },
  { month: "T11", ketoan: 50, it: 72, kinh_doanh: 41 },
  { month: "T12", ketoan: 58, it: 78, kinh_doanh: 49 },
  { month: "T1",  ketoan: 65, it: 82, kinh_doanh: 55 },
  { month: "T2",  ketoan: 71, it: 87, kinh_doanh: 62 },
  { month: "T3",  ketoan: 79, it: 91, kinh_doanh: 70 },
];

const employees = [
  { name: "Nguyễn Thị Lan",  dept: "Kế toán",    score: 83, risk: "low",    avatar: "NT", done: 12, total: 20 },
  { name: "Trần Văn Bình",   dept: "Kế toán",    score: 47, risk: "high",   avatar: "TB", done: 5,  total: 20 },
  { name: "Lê Thị Hoa",      dept: "Kế toán",    score: 65, risk: "medium", avatar: "LH", done: 9,  total: 20 },
  { name: "Phạm Minh Tuấn",  dept: "Kinh doanh", score: 72, risk: "low",    avatar: "PT", done: 14, total: 20 },
  { name: "Vũ Thị Thu",      dept: "Kinh doanh", score: 38, risk: "high",   avatar: "VT", done: 3,  total: 20 },
  { name: "Hoàng Đức Nam",   dept: "IT",          score: 91, risk: "low",    avatar: "HN", done: 20, total: 20 },
  { name: "Đinh Thị Yến",    dept: "IT",          score: 88, risk: "low",    avatar: "DY", done: 18, total: 20 },
];

const riskConfig = {
  high:   { label: "Cao",        color: "#EF4444", glow: "rgba(239,68,68,0.35)" },
  medium: { label: "Trung bình", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  low:    { label: "Thấp",       color: "#10B981", glow: "rgba(16,185,129,0.35)" },
};

const scoreColor = (s: number) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

const sparkScore = [{ v: 60 }, { v: 63 }, { v: 66 }, { v: 68 }, { v: 71 }, { v: 69 }, { v: 69 }];
const sparkClick = [{ v: 20 }, { v: 18 }, { v: 15 }, { v: 14 }, { v: 12 }, { v: 10 }, { v: 8 }];

/* ── Sparkline ────────────────────────────────────── */
function Sparkline({ data, color, id }: { data: { v: number }[]; color: string; id: string }) {
  return (
    <div style={{ width: "100%", height: 36 }}>
      <ResponsiveContainer width="100%" height={36}>
        <LineChart data={data} id={id}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function ManagerDashboard() {
  const avgScore = Math.round(employees.reduce((a, e) => a + e.score, 0) / employees.length);
  const completedPct = Math.round(employees.filter((e) => e.done === e.total).length / employees.length * 100);

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Dashboard Quản lý 👔
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            Tổng quan hiệu suất bảo mật Phòng Kế toán & Kinh doanh
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            fontWeight: 700,
            fontSize: "0.875rem",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
          }}
        >
          <Send size={15} /> Gửi nhắc nhở học tập
        </button>
      </div>

      {/* Stat cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Điểm TB phòng ban", value: avgScore, suffix: "/100", icon: Star, color: "#6366F1", delta: "+8", deltaUp: true, deltaText: "so với tháng trước", spark: sparkScore, sparkColor: "#6366F1", sparkId: "mgr-spark-score" },
          { label: "Đã hoàn thành học", value: `${completedPct}%`, suffix: "", icon: Users, color: "#10B981", delta: "+14%", deltaUp: true, deltaText: "4/7 nhân viên", spark: null, sparkColor: "", sparkId: "" },
          { label: "Email lừa đảo click", value: "8", suffix: " lần", icon: AlertTriangle, color: "#F59E0B", delta: "↓12", deltaUp: false, deltaText: "giảm so với tháng trước", spark: sparkClick, sparkColor: "#EF4444", sparkId: "mgr-spark-click" },
          { label: "Xếp hạng công ty", value: "#3", suffix: "", icon: Award, color: "#8B5CF6", delta: "+1", deltaUp: true, deltaText: "trong 12 phòng ban", spark: null, sparkColor: "", sparkId: "" },
        ].map(({ label, value, suffix, icon: Icon, color, delta, deltaUp, deltaText, spark, sparkColor, sparkId }) => (
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
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-500" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{label}</p>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}12` }}>
                <Icon size={20} style={{ color }} />
              </div>
            </div>
            <p className="mb-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.7rem", color: "#0F172A" }}>
              {value}<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#94A3B8" }}>{suffix}</span>
            </p>
            <div className="flex items-center gap-1.5 mb-2">
              {deltaUp ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-emerald-500" />}
              <span className="text-emerald-600" style={{ fontSize: "0.78rem", fontWeight: 700 }}>{delta}</span>
              <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>{deltaText}</span>
            </div>
            {spark && <Sparkline data={spark} color={sparkColor} id={sparkId} />}
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
              Tiến độ 3 nhóm nhân viên
            </h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.78rem" }}>Chỉ số tín nhiệm bảo mật theo tháng</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-600" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
            <TrendingUp size={14} /> Tất cả đang tăng
          </div>
        </div>
        <div style={{ width: "100%", minHeight: 260 }}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={teamProgress} id="mgr-area-chart">
              <defs>
                <linearGradient id="mgrGradKetoan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="mgrGradIT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="mgrGradKD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 12, background: "rgba(255,255,255,0.95)" }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v: string) => v === "ketoan" ? "Kế toán" : v === "it" ? "IT" : "Kinh doanh"} />
              <Area type="monotone" dataKey="ketoan" stroke="#6366F1" strokeWidth={2.5} fill="url(#mgrGradKetoan)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="it" stroke="#10B981" strokeWidth={2.5} fill="url(#mgrGradIT)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="kinh_doanh" stroke="#F59E0B" strokeWidth={2.5} fill="url(#mgrGradKD)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee list — spaced rows with neon glow */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Users size={17} className="text-indigo-600" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
            Danh sách nhân viên
          </h3>
          <button className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>

        {/* Header row */}
        <div
          className="grid items-center px-4 pb-3"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 0.6fr" }}
        >
          {["Nhân viên", "Phòng ban", "Điểm", "Tiến độ", "Rủi ro", ""].map((h) => (
            <span key={h || "action-col"} className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {employees.map((emp) => {
            const risk = riskConfig[emp.risk as keyof typeof riskConfig];
            const pct = (emp.done / emp.total) * 100;
            return (
              <div
                key={emp.name}
                className="grid items-center px-4 py-3.5 rounded-xl cursor-pointer transition-all hover:shadow-sm group"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 0.6fr",
                  background: "#fff",
                  borderRadius: 12,
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${scoreColor(emp.score)}, ${scoreColor(emp.score)}cc)`, fontWeight: 700, fontSize: "0.78rem" }}
                  >
                    {emp.avatar}
                  </div>
                  <span className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{emp.name}</span>
                </div>

                {/* Dept */}
                <span className="text-slate-500" style={{ fontSize: "0.85rem" }}>{emp.dept}</span>

                {/* Score */}
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: scoreColor(emp.score) }}>{emp.score}</span>
                  <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>/100</span>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full flex-1 max-w-[100px]" style={{ background: "#F1F5F9" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: scoreColor(emp.score) }} />
                  </div>
                  <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>{emp.done}/{emp.total}</span>
                </div>

                {/* Risk — Neon Glow */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span
                      className="block w-2.5 h-2.5 rounded-full"
                      style={{ background: risk.color }}
                    />
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ background: risk.color, filter: "blur(4px)", opacity: 0.6 }}
                    />
                    {emp.risk === "high" && (
                      <span className="absolute inset-0 rounded-full animate-ping" style={{ background: risk.color, opacity: 0.3 }} />
                    )}
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: risk.color, textShadow: `0 0 8px ${risk.glow}` }}>
                    {risk.label}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
