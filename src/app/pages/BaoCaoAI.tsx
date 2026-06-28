import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, Target, Flame, Bot } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import axiosInstance from "../api/axiosInstance";
import mascotPoint from "../../data/mascot/point.png";
import mascotSad from "../../data/mascot/sad.png";

interface DailyTrend  { date: string; correct: number; total: number; }
interface SkillBreakdown { clickedLinkRate: number; credentialLeakedRate: number; reportedCorrectlyRate: number; phishingDetectionRate: number; safeEmailAccuracy: number; }
interface RecentFeedback { scenarioTitle: string; feedbackText: string; improvementTips: string; createdAt: string; }
interface MyReport {
  totalAttempts: number;
  correctRate: number;
  recentTrend: DailyTrend[];
  skillBreakdown: SkillBreakdown;
  topFeedbacks: RecentFeedback[];
}

function computeStreak(trend: DailyTrend[]): number {
  let streak = 0;
  for (let i = trend.length - 1; i >= 0; i--) {
    if (trend[i].total > 0) streak++;
    else break;
  }
  return streak;
}

const cardCls = [
  "rounded-3xl p-6",
  "bg-white/70 backdrop-blur-md",
  "border border-white/80",
  "shadow-sm",
].join(" ");

export function BaoCaoAI() {
  const [report, setReport]   = useState<MyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice]   = useState<any>(null);

  useEffect(() => {
    (axiosInstance as any)
      .get("Analytics/my-report")
      .then((data: MyReport) => setReport(data))
      .catch(() =>
        setReport({
          totalAttempts: 0,
          correctRate: 0,
          recentTrend: [],
          skillBreakdown: { clickedLinkRate: 0, credentialLeakedRate: 0, reportedCorrectlyRate: 0, phishingDetectionRate: 0, safeEmailAccuracy: 0 },
          topFeedbacks: [],
        })
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (axiosInstance as any)
      .get("user-report/predictive-advice")
      .then((data: any) => setAdvice(data))
      .catch(() => setAdvice(null));
  }, []);

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────
  if (!report || report.totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-5 text-center">
        <motion.img
          src={mascotSad}
          alt="mascot"
          className="w-20 h-20 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <p className="text-slate-500 text-base">
          Bạn chưa làm bài nào. Hãy bắt đầu luyện tập!
        </p>
        <Link
          to="/nguoi-dung/mo-phong"
          className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
        >
          Bắt đầu mô phỏng →
        </Link>
      </div>
    );
  }

  const streak    = computeStreak(report.recentTrend);
  const chartData = report.recentTrend
    .filter(d => d.total > 0)
    .map(d => ({ date: d.date, rate: Math.round((d.correct / d.total) * 100) }));

  const skills = [
    { label: "Tỉ lệ click link giả",     value: report.skillBreakdown.clickedLinkRate,       color: "#EF4444", bg: "#FEF2F2" },
    { label: "Tỉ lệ để lộ thông tin",    value: report.skillBreakdown.credentialLeakedRate,   color: "#F97316", bg: "#FFF7ED" },
    { label: "Tỉ lệ phát hiện đúng",     value: report.skillBreakdown.reportedCorrectlyRate,  color: "#10B981", bg: "#ECFDF5" },
  ];

  return (
    <div className="max-w-screen-lg mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
          Báo cáo phân tích của bạn
        </h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: "0.88rem" }}>
          Dữ liệu thực từ lịch sử luyện tập
        </p>
      </div>

      {/* [A] Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={cardCls}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Target size={18} className="text-indigo-500" />
            </div>
            <span className="text-slate-500 text-sm">Tổng lần thử</span>
          </div>
          <p style={{ fontWeight: 800, fontSize: "2rem", color: "#0F172A" }}>
            {report.totalAttempts}
          </p>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <span className="text-slate-500 text-sm">Tỉ lệ đúng</span>
          </div>
          <p style={{ fontWeight: 800, fontSize: "2rem", color: "#10B981" }}>
            {report.correctRate.toFixed(1)}%
          </p>
        </div>

        <div className={cardCls}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF7ED" }}>
              <Flame size={18} className="text-orange-500" />
            </div>
            <span className="text-slate-500 text-sm">Ngày liên tiếp</span>
          </div>
          <p style={{ fontWeight: 800, fontSize: "2rem", color: "#F97316" }}>
            {streak}
          </p>
        </div>
      </div>

      {/* [B] Line chart */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-indigo-500" />
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
            Tỉ lệ đúng 7 ngày gần nhất
          </h3>
        </div>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            Chưa có dữ liệu trong 7 ngày qua
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Tỉ lệ đúng"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ fill: "#6366F1", r: 4, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* [B2] Radar Chart — 5 kỹ năng */}
      <motion.div
        className={cardCls}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <img
            src={report.correctRate >= 50 ? mascotPoint : mascotSad}
            alt="mascot"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Bản đồ kỹ năng</h2>
            <p className="text-sm text-slate-500">Đánh giá 5 khía cạnh phòng chống phishing</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={[
            { skill: "Phát hiện phishing",       value: report.skillBreakdown.phishingDetectionRate },
            { skill: "Nhận diện email an toàn",  value: report.skillBreakdown.safeEmailAccuracy },
            { skill: "Không click link giả",     value: 100 - report.skillBreakdown.clickedLinkRate },
            { skill: "Bảo vệ thông tin",         value: 100 - report.skillBreakdown.credentialLeakedRate },
            { skill: "Báo cáo chính xác",        value: report.skillBreakdown.reportedCorrectlyRate },
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#64748B" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
            <Radar name="Kỹ năng" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* [C] Skill progress bars */}
      <div className={cardCls}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }} className="mb-5">
          Phân tích hành vi
        </h3>
        <div className="space-y-5">
          {skills.map(({ label, value, color, bg }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 text-sm">{label}</span>
                <span style={{ fontWeight: 700, color, fontSize: "0.9rem" }}>
                  {value.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: bg }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(value, 100)}%`, background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* [D] Top feedbacks */}
      {report.topFeedbacks.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }} className="mb-4">
            Phản hồi AI gần nhất
          </h3>
          <div className="space-y-4">
            {report.topFeedbacks.map((fb, i) => (
              <div key={i} className={cardCls}>
                <div className="flex items-center gap-2 mb-3">
                  <Bot size={16} className="text-indigo-500 shrink-0" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>
                    {fb.scenarioTitle}
                  </span>
                  <span className="ml-auto text-slate-400 text-xs shrink-0">{fb.createdAt}</span>
                </div>
                <p className="text-slate-600 text-sm mb-3" style={{ lineHeight: 1.7 }}>
                  {fb.feedbackText}
                </p>
                {fb.improvementTips && (
                  <p
                    className="text-slate-500 text-sm italic"
                    style={{ lineHeight: 1.6, borderLeft: "3px solid #6366F1", paddingLeft: 12 }}
                  >
                    {fb.improvementTips}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* [E] AI Predictive Advice */}
      {advice && (
        <motion.div
          className={cardCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img src={mascotPoint} alt="mascot" className="w-12 h-12 object-contain" />
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Phân tích AI cá nhân</h2>
              <p className="text-sm text-slate-500">Dựa trên 90 ngày hoạt động gần nhất</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-4" style={{ background: "#FEF2F2" }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#DC2626" }}>Xu hướng rủi ro</p>
              <p className="text-sm font-medium">{advice.riskPattern}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#FFF7ED" }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#EA580C" }}>Điểm yếu chính</p>
              <p className="text-sm font-medium">{advice.primaryWeakness}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Độ tin cậy phân tích</span>
              <span style={{ fontWeight: 700 }}>{Math.round((advice.confidenceScore ?? 0) * 100)}%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "#F1F5F9" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(advice.confidenceScore ?? 0) * 100}%`, background: "#6366F1" }}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase mb-2 text-slate-500">Lời khuyên cụ thể</p>
            <div className="space-y-2">
              {(advice.actionableAdvice ?? []).map((tip: string, i: number) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-0.5 shrink-0">💡</span>
                  <p className="text-sm text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#EFF6FF" }}>
            <span>📊</span>
            <p className="text-sm">
              Độ khó đề xuất tiếp theo:{" "}
              <span style={{ fontWeight: 700 }}>
                {advice.recommendedNextDifficulty === "Easy" ? "Dễ"
                  : advice.recommendedNextDifficulty === "Medium" ? "Trung bình" : "Khó"}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
