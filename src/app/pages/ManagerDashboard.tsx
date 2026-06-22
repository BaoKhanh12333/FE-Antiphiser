import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
  TrendingUp, Users, AlertTriangle, Award, ChevronRight, Star,
  Loader2, PlusCircle, ShoppingCart,
} from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import { motion } from "motion/react";

/* ── riskConfig: thêm critical ──────────────────────── */
const riskConfig: Record<string, { label: string; color: string; glow: string }> = {
  critical: { label: "Nguy kịch", color: "#7C3AED", glow: "rgba(124,58,237,0.4)" },
  high:     { label: "Cao",        color: "#EF4444", glow: "rgba(239,68,68,0.35)" },
  medium:   { label: "Trung bình", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  low:      { label: "Thấp",       color: "#10B981", glow: "rgba(16,185,129,0.35)" },
};

const scoreColor = (s: number) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

/* Derive avatar initials từ fullName ─────────────────── */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── MAIN ─────────────────────────────────────────────── */
export function ManagerDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, emps, cpRes] = await Promise.all([
          analyticsService.getCompanyOverview(),
          analyticsService.getHighRiskEmployees(),
          analyticsService.getCampaignCompletion(),
        ]);
        setOverview(ov);
        setEmployees(emps ?? []);
        setCampaigns(cpRes?.campaigns ?? []);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* Stat cards ─────────────────────────────────────── */
  const cards = [
    {
      label: "Điểm TB phòng ban",
      value: overview ? `${overview.avgRiskScore}` : "—",
      suffix: "/100",
      icon: Star,
      color: "#6366F1",
      sub: `${overview?.totalAttempts ?? 0} lần thực hành`,
    },
    {
      label: "Đã hoàn thành học",
      value: overview ? `${overview.lessonCompletionRate}%` : "—",
      suffix: "",
      icon: Users,
      color: "#10B981",
      sub: `${overview?.activeEmployees ?? 0} nhân viên hoạt động`,
    },
    {
      label: "Email lừa đảo click",
      value: overview ? `${overview.totalClickedLink}` : "—",
      suffix: " lần",
      icon: AlertTriangle,
      color: "#F59E0B",
      sub: `${overview?.totalCredentialLeaked ?? 0} lần lộ thông tin`,
    },
    {
      label: "Nhân viên hoạt động",
      value: overview ? `${overview.activeEmployees}` : "—",
      suffix: "",
      icon: Award,
      color: "#8B5CF6",
      sub: `Tổng ${overview?.totalEmployees ?? 0} nhân viên`,
    },
  ];

  /* Bar chart data từ campaigns ────────────────────── */
  const chartData = campaigns.map((c: any) => ({
    name: c.campaignName.length > 16 ? c.campaignName.slice(0, 14) + "…" : c.campaignName,
    "Hoàn thành bài học": Math.round(c.lessonCompletionPct),
    "Tỷ lệ phát hiện": Math.round(c.detectionRate),
  }));

  if (loading) {
    return (
      <div className="space-y-8 max-w-screen-xl mx-auto animate-pulse">
        <div className="h-8 w-52 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-3xl" />)}
        </div>
        <div className="h-72 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Dashboard Quản lý 👔
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            Tổng quan hiệu suất bảo mật — {overview?.totalEmployees ?? 0} nhân viên
          </p>
        </div>
        <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/quan-ly/mua-goi")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #10B981, #059669)",
            boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
          }}
        >
          <ShoppingCart size={15} /> Mua gói
        </button>
        <button
          onClick={() => navigate("/quan-ly/tao-chien-dich")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            fontWeight: 700,
            fontSize: "0.875rem",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
          }}
        >
          <PlusCircle size={15} /> Tạo chiến dịch
        </button>
        </div>
      </div>

      {/* Stat cards — deltas ẩn (không có time-series) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, suffix, icon: Icon, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
            className="rounded-3xl p-5"
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
            <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Bar chart: tiến độ theo Campaign */}
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
              Tiến độ theo Chiến dịch
            </h3>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.78rem" }}>% hoàn thành bài học & tỷ lệ phát hiện phishing</p>
          </div>
          <div className="flex items-center gap-1 text-indigo-600" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
            <TrendingUp size={14} /> {campaigns.length} chiến dịch
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Chưa có chiến dịch nào được giao cho công ty này.
          </div>
        ) : (
          <div style={{ width: "100%", minHeight: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Hoàn thành bài học" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Tỷ lệ phát hiện" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Employee list */}
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
        <div className="grid items-center px-4 pb-3" style={{ gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 0.6fr" }}>
          {["Nhân viên", "Bộ phận", "Điểm", "Tiến độ", "Rủi ro", ""].map((h) => (
            <span key={h || "action"} className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em" }}>{h}</span>
          ))}
        </div>

        {employees.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">Chưa có nhân viên nào trong công ty.</p>
        ) : (
          <div className="space-y-2">
            {employees.map((emp: any) => {
              const riskKey = (emp.riskLevel ?? "medium").toLowerCase() as keyof typeof riskConfig;
              const risk = riskConfig[riskKey] ?? riskConfig.medium;
              const score = Math.round(emp.riskScore ?? 50);
              const done = emp.completedLessons ?? 0;
              const total = emp.totalAssignedLessons ?? 0;
              const pct = total > 0 ? (done / total) * 100 : 0;

              return (
                <div
                  key={emp.userId}
                  className="grid items-center px-4 py-3.5 rounded-xl cursor-pointer transition-all hover:shadow-sm group"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 0.6fr", background: "#fff", borderRadius: 12 }}
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${scoreColor(score)}, ${scoreColor(score)}cc)`, fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      {initials(emp.fullName ?? "?")}
                    </div>
                    <span className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{emp.fullName}</span>
                  </div>

                  {/* Dept — không có trong model */}
                  <span className="text-slate-400" style={{ fontSize: "0.85rem" }}>—</span>

                  {/* Score */}
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: scoreColor(score) }}>{score}</span>
                    <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>/100</span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full flex-1 max-w-[100px]" style={{ background: "#F1F5F9" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: scoreColor(score) }} />
                    </div>
                    <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>{done}/{total}</span>
                  </div>

                  {/* Risk — Neon Glow */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="block w-2.5 h-2.5 rounded-full" style={{ background: risk.color }} />
                      <span className="absolute inset-0 rounded-full" style={{ background: risk.color, filter: "blur(4px)", opacity: 0.6 }} />
                      {(riskKey === "high" || riskKey === "critical") && (
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
        )}
      </div>
    </div>
  );
}
