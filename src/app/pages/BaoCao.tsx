import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Download, TrendingUp, Award, Brain, Sparkles, Trophy, Star } from "lucide-react";

const radarData = [
  { skill: "Phát hiện URL", A: 85 },
  { skill: "Nhận biết domain", A: 70 },
  { skill: "Social Eng.", A: 60 },
  { skill: "Bảo mật MK", A: 90 },
  { skill: "Tệp đính kèm", A: 55 },
  { skill: "Cảnh giác chung", A: 80 },
];

const monthlyTrend = [
  { month: "T10", score: 45 },
  { month: "T11", score: 52 },
  { month: "T12", score: 60 },
  { month: "T1", score: 65 },
  { month: "T2", score: 72 },
  { month: "T3", score: 83 },
];

const aiInsights = [
  {
    icon: "🎯",
    title: "Điểm mạnh nổi bật",
    desc: "Bạn xuất sắc trong việc nhận diện URL giả mạo – tốt hơn 85% đồng nghiệp cùng phòng ban.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
  },
  {
    icon: "⚡",
    title: "Cần tập trung",
    desc: "Kỹ năng nhận diện Social Engineering còn yếu. Hoàn thành Module 3 để cải thiện thêm 20 điểm.",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
  },
  {
    icon: "🔮",
    title: "Dự báo AI",
    desc: 'Nếu duy trì tốc độ hiện tại, bạn sẽ đạt chứng chỉ "Nhân viên An toàn Thông tin" vào tháng 4/2026.',
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
  },
];

/* ── Custom Radar Dot with glow ───────────────────── */
function GlowDot(props: any) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#6366F1" fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={3.5} fill="#6366F1" />
      <circle cx={cx} cy={cy} r={2} fill="#fff" fillOpacity={0.8} />
    </g>
  );
}

export function BaoCao() {
  return (
    <div className="max-w-screen-lg mx-auto space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>Báo cáo & AI</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
            Phân tích chuyên sâu từ trí tuệ nhân tạo
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "#0F172A",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 4px 16px rgba(15,23,42,0.2)",
          }}
        >
          <Download size={15} /> Xuất báo cáo PDF
        </button>
      </div>

      {/* AI Insights — Floating cards with gradient accent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {aiInsights.map(({ icon, title, desc, color, gradient }) => (
          <div
            key={title}
            className="rounded-3xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            {/* Gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: gradient }} />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{icon}</span>
              <Sparkles size={14} style={{ color }} />
            </div>
            <h3 className="text-slate-800 mb-2" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</h3>
            <p className="text-slate-500" style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar — Glowing nodes */}
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
            <Brain size={18} className="text-indigo-600" />
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>Bản đồ kỹ năng</h3>
          </div>
          <div style={{ width: "100%", minHeight: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} outerRadius={100} id="user-radar-chart">
                <defs>
                  <radialGradient id="radarFill">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.08} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="#E0E7FF" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: "#64748B", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Bạn"
                  dataKey="A"
                  stroke="#6366F1"
                  fill="url(#radarFill)"
                  strokeWidth={2.5}
                  dot={<GlowDot />}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area chart — thick line with shadow */}
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
            <TrendingUp size={18} className="text-emerald-600" />
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>Xu hướng 6 tháng</h3>
          </div>
          <div style={{ width: "100%", minHeight: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend} id="user-trend-area">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                  formatter={(v: number) => [`${v} điểm`, "Chỉ số tín nhiệm"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={3.5}
                  fill="url(#trendGrad)"
                  dot={{ fill: "#6366F1", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, fill: "#818CF8", stroke: "#6366F1", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Certification — Dark theme premium card */}
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
          boxShadow: "0 12px 48px rgba(15,23,42,0.4)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "10%", width: 200, height: 200, background: "radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-10%", left: "5%", width: 150, height: 150, background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", filter: "blur(30px)" }} />

        <div className="relative z-10 flex items-start gap-5 flex-wrap">
          {/* Medal */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))",
              border: "1px solid rgba(251,191,36,0.2)",
              boxShadow: "0 0 32px rgba(251,191,36,0.1)",
            }}
          >
            <Trophy size={36} className="text-amber-400" />
            {/* Sparkle accents */}
            <Star size={8} className="absolute top-2 right-2 text-amber-300" fill="#FCD34D" />
            <Star size={6} className="absolute bottom-3 left-2 text-amber-300" fill="#FCD34D" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-amber-400" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                CHỨNG CHỈ SẮP ĐẠT ĐƯỢC
              </p>
              <Sparkles size={13} className="text-amber-400" />
            </div>
            <h3 className="text-white mb-2" style={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.4 }}>
              Nhân viên An toàn Thông tin Cấp độ 1
            </h3>
            <p className="text-indigo-300" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
              Hoàn thành thêm 8 bài học và đạt điểm tín nhiệm ≥ 85 để nhận chứng chỉ chính thức
            </p>

            {/* Vibrant progress bar */}
            <div className="mt-5">
              <div className="flex justify-between mb-2">
                <span className="text-indigo-300" style={{ fontSize: "0.78rem" }}>Tiến độ</span>
                <span className="text-amber-400" style={{ fontSize: "0.82rem", fontWeight: 800 }}>76%</span>
              </div>
              <div className="h-3 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "76%",
                    background: "linear-gradient(90deg, #F59E0B, #FBBF24, #FCD34D)",
                    boxShadow: "0 0 16px rgba(251,191,36,0.5), 0 0 32px rgba(251,191,36,0.2)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-indigo-400" style={{ fontSize: "0.72rem" }}>12 bài hoàn thành</span>
                <span className="text-indigo-400" style={{ fontSize: "0.72rem" }}>8 bài còn lại</span>
              </div>
            </div>
          </div>

          <button
            className="shrink-0 self-center px-6 py-3 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
              color: "#0F172A",
              fontWeight: 800,
              fontSize: "0.9rem",
              boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
            }}
          >
            Xem lộ trình
          </button>
        </div>
      </div>
    </div>
  );
}
