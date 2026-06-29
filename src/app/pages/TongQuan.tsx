import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Mail, CheckCircle2, AlertTriangle, PlayCircle, BookOpen, Shield, Building2, ShieldAlert, ArrowRight, TrendingUp } from "lucide-react";
import { userService } from "../services/userService";
import { campaignService } from "../services/campaignService";
import { scenarioService } from "../services/scenarioService";
import { lessonService } from "../services/lessonService";
import { subscriptionService } from "../services/subscriptionService";
import { motion } from "motion/react";
import mascotWave from "../../data/mascot/wave.png";
import mascotPoint from "../../data/mascot/point.png";
import axiosInstance from "../api/axiosInstance";
import { AchievementDef, getAllAchievements, RARITY_CONFIG, UserStats } from "../data/achievements";
import { AchievementToastManager } from "../components/AchievementToast";
import { OnboardingWelcomeModal, shouldShowWelcome } from "../components/OnboardingWelcomeModal";
import { GettingStartedChecklist } from "../components/GettingStartedChecklist";

// ─── SVG Accuracy Ring ────────────────────────────────────────────────────────
function AccuracyRing({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          stroke="#F1F5F9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="url(#accuracyGradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
        <defs>
          <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="font-black text-slate-800" style={{ fontSize: size * 0.22 }}>
          {value}%
        </span>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Độ chính xác</p>
      </div>
    </div>
  );
}

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASE_CONFIG: Record<number, {
  name: string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  1: { name: "Nền tảng cơ bản",            Icon: Shield,      color: "#7C3AED", bgColor: "#F5F3FF" },
  2: { name: "Nhận diện email đáng ngờ",    Icon: Mail,        color: "#2563EB", bgColor: "#EFF6FF" },
  3: { name: "Phishing môi trường doanh nghiệp", Icon: Building2, color: "#B45309", bgColor: "#FEF3C7" },
  4: { name: "Ứng phó & Báo cáo",           Icon: ShieldAlert, color: "#059669", bgColor: "#ECFDF5" },
};

// ─── Vietnamese day labels ─────────────────────────────────────────────────────
const VI_DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getPhaseNum(lesson: any) {
  return lesson.phaseNumber ?? 1;
}

// ─── Streak Dots ──────────────────────────────────────────────────────────────
interface TrendDay { date: string; correct: number; total: number }

function StreakDots({ recentTrend }: { recentTrend: TrendDay[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const match = recentTrend.find(t => t.date.startsWith(iso));
    return {
      iso,
      label: VI_DAY_SHORT[d.getDay()],
      isToday: i === 6,
      total: match?.total ?? 0,
      correct: match?.correct ?? 0,
    };
  });

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm font-bold text-slate-700">Hoạt động 7 ngày qua</span>
      </div>
      <div className="flex gap-2 items-end">
        {days.map((d) => {
          const active = d.total > 0;
          const pct = d.total > 0 ? d.correct / d.total : 0;
          const dotColor = !active
            ? "#E2E8F0"
            : pct >= 0.8
            ? "#10B981"
            : pct >= 0.5
            ? "#F59E0B"
            : "#EF4444";

          return (
            <div key={d.iso} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
              <span className="text-[9px] font-bold text-slate-400">{d.total > 0 ? d.total : ""}</span>
              <div
                title={active ? `${d.correct}/${d.total} đúng` : "Không có hoạt động"}
                style={{
                  width: "100%",
                  height: 28,
                  borderRadius: 6,
                  background: dotColor,
                  border: d.isToday ? "2px solid #6366F1" : "none",
                  transition: "background 0.3s",
                  boxShadow: active ? `0 2px 8px ${dotColor}55` : "none",
                }}
              />
              <span className="text-[9px] font-bold" style={{ color: d.isToday ? "#6366F1" : "#94A3B8" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3">
        {[
          { color: "#10B981", label: "≥80% đúng" },
          { color: "#F59E0B", label: "50–79%" },
          { color: "#EF4444", label: "<50%" },
          { color: "#E2E8F0", label: "Không hoạt động" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span className="text-[9px] text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Achievement Grid ─────────────────────────────────────────────────────────
interface AchievementGridProps {
  defs: AchievementDef[];
  earned: string[];
  userStats: UserStats;
}

function AchievementGrid({ defs, earned, userStats }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {defs.map((def) => {
        const isEarned = earned.includes(def.id);
        const cfg = RARITY_CONFIG[def.rarity];
        const prog = def.progress(userStats);
        const pct = prog.max > 0 ? Math.min(100, Math.round((prog.current / prog.max) * 100)) : 0;

        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              borderRadius: 14,
              padding: "14px 14px 12px",
              background: isEarned ? cfg.bgGrad : "#F8FAFC",
              border: `1.5px solid ${isEarned ? cfg.borderColor : "#E2E8F0"}`,
              boxShadow: isEarned ? cfg.glowShadow : "none",
              position: "relative",
              overflow: "hidden",
              transition: "box-shadow 0.3s",
            }}
          >
            {/* Rarity label */}
            <span style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: "0.58rem",
              fontWeight: 700,
              background: isEarned ? cfg.badgeBg : "#F1F5F9",
              color: isEarned ? cfg.badgeText : "#94A3B8",
              padding: "1px 6px",
              borderRadius: 99,
            }}>
              {cfg.label}
            </span>

            {/* Icon */}
            <div style={{
              fontSize: "1.7rem",
              marginBottom: 6,
              filter: isEarned ? "none" : "grayscale(1) opacity(0.35)",
            }}>
              {def.icon}
            </div>

            {/* Title + desc */}
            <p style={{
              fontSize: "0.82rem",
              fontWeight: 800,
              color: isEarned ? "#0F172A" : "#94A3B8",
              marginBottom: 2,
              lineHeight: 1.2,
            }}>
              {def.title}
            </p>
            <p style={{ fontSize: "0.68rem", color: isEarned ? cfg.textColor : "#CBD5E1", lineHeight: 1.3 }}>
              {def.desc}
            </p>

            {/* Progress bar (locked only) or "Đã đạt" badge */}
            {isEarned ? (
              <div style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.6rem",
                fontWeight: 700,
                color: cfg.textColor,
                background: cfg.badgeBg,
                padding: "2px 8px",
                borderRadius: 99,
              }}>
                ✓ Đã đạt
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 600 }}>
                    {prog.current} / {prog.max}
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "#E2E8F0", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 99,
                    width: `${pct}%`,
                    background: "linear-gradient(90deg,#94A3B8,#CBD5E1)",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TongQuan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [recentTrend, setRecentTrend] = useState<TrendDay[]>([]);
  const [hasPlan, setHasPlan] = useState(false);

  // Onboarding
  const [showWelcome, setShowWelcome] = useState(false);

  // Toast queue
  const [toastQueue, setToastQueue] = useState<{ id: string; icon: string; title: string; rarity: any }[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((q) => q.filter((t) => t.id !== id));
  }, []);

  // Aggregate Stats
  const [stats, setStats] = useState<UserStats>({
    processedEmails: 0,
    correctDetections: 0,
    trickedTimes: 0,
    completedLessons: 0,
  });
  const [accuracyRate, setAccuracyRate] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch user profile
        const userProfile = await userService.getUserProfile();
        setProfile(userProfile);

        // 2. Fetch my campaigns
        const myCampaigns = await campaignService.getMyCampaigns();

        const filteredCampaigns = myCampaigns?.filter((c: any) =>
          !c.campaignName.toLowerCase().includes("test") &&
          !c.campaignName.toLowerCase().includes("verify")
        ) || [];

        setAllCampaigns(filteredCampaigns);

        const active = filteredCampaigns.find((c: any) => c.isActive) || null;
        setActiveCampaign(active);

        // 3. Compute aggregate stats over all campaigns
        let combinedAttempts: any[] = [];
        if (filteredCampaigns.length > 0) {
          const allAttemptsLists = await Promise.all(
            filteredCampaigns.map((c: any) =>
              scenarioService.getMyAttempts(c.campaignId).catch(() => [])
            )
          );
          combinedAttempts = allAttemptsLists.flat();
        }

        const processed = combinedAttempts.length;
        const correct = combinedAttempts.filter((a: any) => a.isCorrect).length;
        const accuracy = processed > 0 ? Math.round((correct / processed) * 100) : 0;
        const tricked = combinedAttempts.filter((a: any) => a.isClickedLink || a.isCredentialLeaked).length;

        // 4. Fetch lessons progress
        let completedLessons = 0;
        if (userProfile?.id) {
          const [lessonsData, progressData] = await Promise.all([
            lessonService.getAllLessons().catch(() => []),
            lessonService.getUserProgress(userProfile.id).catch(() => [])
          ]);
          const lessons = lessonsData || [];
          const progress = progressData || [];
          setAllLessons(lessons);
          setProgressList(progress);
          completedLessons = progress.filter((p: any) => p.isCompleted).length;
        }

        const newStats: UserStats = {
          processedEmails: processed,
          correctDetections: correct,
          trickedTimes: tricked,
          completedLessons,
        };
        setStats(newStats);
        setAccuracyRate(accuracy);

        // 5. Fetch plan status
        const planStatus = await subscriptionService.getMyPlanStatus().catch(() => null);
        setHasPlan(planStatus?.hasPlan === true);

        // 6. Fetch recent trend for streak
        const reportData = await axiosInstance.get("Analytics/my-report").catch(() => null);
        const trend: TrendDay[] = reportData?.recentTrend ?? reportData?.data?.recentTrend ?? [];
        setRecentTrend(Array.isArray(trend) ? trend : []);

        // 7. Detect newly unlocked achievements and queue toasts
        const allDefsNow = getAllAchievements();
        const seenRaw = localStorage.getItem("seenAchievements");
        const seen: string[] = seenRaw ? JSON.parse(seenRaw) : [];
        const nowEarned = allDefsNow.filter(d => d.condition(newStats)).map(d => d.id);
        const newlyEarned = nowEarned.filter(id => !seen.includes(id));

        if (newlyEarned.length > 0) {
          localStorage.setItem("seenAchievements", JSON.stringify([...seen, ...newlyEarned]));
          const newToasts = newlyEarned.map(id => {
            const def = allDefsNow.find(d => d.id === id)!;
            return { id: def.id, icon: def.icon, title: def.title, rarity: def.rarity };
          });
          setToastQueue(newToasts);
        }
        // 8. Show welcome modal once for new users
        if (shouldShowWelcome()) {
          setShowWelcome(true);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const allDefs = useMemo(() => getAllAchievements(), []);

  const earnedIds = useMemo(
    () => allDefs.filter(d => d.condition(stats)).map(d => d.id),
    [allDefs, stats]
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-screen-xl mx-auto animate-pulse">
        <div className="h-8 w-72 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-48 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-2 h-48 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-52 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-2 h-52 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Lesson total completed
  const completedLessonsCount = progressList.filter((p: any) => p.isCompleted).length;
  const totalLessonsCount = allLessons.length || 0;

  // Phase grouping calculations
  const phaseStats = [1, 2, 3, 4].map(ph => {
    const phaseLessons = allLessons.filter((l: any) => getPhaseNum(l) === ph);
    const total = phaseLessons.length;
    const completed = phaseLessons.filter((l: any) =>
      progressList.some((p: any) => p.lessonId === l.lessonId && p.isCompleted)
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { phase: ph, name: PHASE_CONFIG[ph as keyof typeof PHASE_CONFIG].name, completed, total, pct };
  });

  const isUserNew = stats.processedEmails === 0 && completedLessonsCount === 0;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.img
            src={mascotWave}
            alt="AntiPhisher mascot chào"
            className="w-20 h-20 object-contain"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          />
          <div>
            <h1 className="font-extrabold text-2xl text-slate-800 leading-tight">
              Chào mừng quay trở lại, {profile?.fullName || "người dùng"}! 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Hôm nay: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Getting Started Checklist ── */}
      <GettingStartedChecklist
        completedLessons={completedLessonsCount}
        processedEmails={stats.processedEmails}
        hasPlan={hasPlan}
      />

      {/* ── Row 2: Top Grid (Active Campaign + Accuracy Visualizer) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Active Campaign Card */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, #F5F7FF 0%, #EEF2FF 100%)",
            border: "1px solid #E0E7FF",
            boxShadow: "0 10px 30px rgba(79, 70, 229, 0.04)",
          }}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-50/50 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700">
                {allCampaigns.length > 0 ? `● ${allCampaigns.length} chiến dịch đang chạy` : "Sẵn sàng học tập"}
              </span>
            </div>

            {allCampaigns.length > 0 ? (
              <>
                <h2 className="font-black text-slate-800 text-lg leading-snug">
                  Bạn đang tham gia {allCampaigns.length} chiến dịch
                </h2>
                <div className="mt-2 space-y-1">
                  {allCampaigns.slice(0, 3).map((c: any) => (
                    <p key={c.campaignId} className="text-xs text-slate-500 leading-relaxed truncate">
                      • {c.campaignName}
                    </p>
                  ))}
                  {allCampaigns.length > 3 && (
                    <p className="text-xs text-indigo-400 font-semibold">+{allCampaigns.length - 3} chiến dịch khác</p>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-bold">Tổng email đã xử lý</span>
                    <span className="text-xs font-black text-indigo-600">
                      {stats.processedEmails} email — {accuracyRate}% chính xác
                    </span>
                  </div>
                  <div className="h-3 rounded-full w-full bg-indigo-100/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, stats.processedEmails > 0 ? Math.min(stats.processedEmails * 5, 100) : 0)}%`,
                        background: "linear-gradient(90deg, #4F46E5, #6366F1)",
                        boxShadow: "0 0 10px rgba(79, 70, 229, 0.25)"
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-black text-slate-800 text-lg leading-snug">
                  Chưa có chiến dịch hoạt động
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-lg">
                  Hiện tại không có chiến dịch giả lập nào đang được kích hoạt cho bạn. Vui lòng hoàn thành lộ trình học lý thuyết.
                </p>
              </>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-indigo-500 font-bold">
              {allCampaigns.length > 0 ? `${allCampaigns.length} chiến dịch — ${stats.processedEmails} email đã làm` : "Hoàn thành 4 Phase bài học lý thuyết"}
            </span>
            {allCampaigns.length > 0 ? (
              <button
                onClick={() => navigate("/nguoi-dung/mo-phong")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)" }}
              >
                <PlayCircle size={15} />
                Xem tất cả chiến dịch
              </button>
            ) : (
              <button
                onClick={() => navigate("/nguoi-dung/lo-trinh")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-indigo-600 bg-white border border-indigo-200 hover:border-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Học lý thuyết <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Accuracy Visualizer Card */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-100 flex flex-col justify-between"
          style={{ boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Hiệu suất mô phỏng</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tỉ lệ nhận diện email lừa đảo</p>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>

          <div className="my-4 flex items-center justify-center gap-6">
            <AccuracyRing value={accuracyRate} />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Phát hiện đúng</span>
                  <span className="font-bold text-slate-800 text-xs">{stats.correctDetections} email</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Dính bẫy click</span>
                  <span className="font-bold text-slate-800 text-xs">{stats.trickedTimes} lần</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            {stats.processedEmails > 0
              ? `Hệ thống ghi nhận bạn đã hoàn thành phản xạ với ${stats.processedEmails} email.`
              : "Bắt đầu làm các bài kiểm tra mô phỏng để đo lường độ chính xác."}
          </div>
        </div>

      </div>

      {/* ── Row 3: 4 Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail,          bg: "bg-indigo-50",  iconCls: "text-indigo-600",  label: "Email đã xử lý",       value: stats.processedEmails,  valCls: "text-slate-800" },
          { icon: CheckCircle2,  bg: "bg-emerald-50", iconCls: "text-emerald-600", label: "Phát hiện chính xác",  value: stats.correctDetections, valCls: "text-slate-800" },
          { icon: AlertTriangle, bg: "bg-amber-50",   iconCls: "text-amber-600",   label: "Lần dính bẫy",         value: stats.trickedTimes,     valCls: "text-amber-600" },
          { icon: BookOpen,      bg: "bg-violet-50",  iconCls: "text-violet-600",  label: "Bài học hoàn thành",   value: `${completedLessonsCount} / ${totalLessonsCount}`, valCls: "text-slate-800" },
        ].map(({ icon: Icon, bg, iconCls, label, value, valCls }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(99,102,241,0.1)" }}
            className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4 cursor-default"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={18} className={iconCls} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
              <span className={`text-lg font-black block mt-0.5 ${valCls}`}>{value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Achievements + Streak ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-white border border-slate-100 p-6"
        style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.02)" }}
      >
        {/* Streak */}
        <div className="mb-6 pb-5 border-b border-slate-100">
          <StreakDots recentTrend={recentTrend} />
        </div>

        {/* Achievement section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={mascotPoint} alt="mascot" className="w-9 h-9 object-contain" />
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Thành tựu</h2>
              <p className="text-[11px] text-slate-400">
                {earnedIds.length} / {allDefs.length} đã mở khoá
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["bronze", "silver", "gold", "platinum"] as const).map(r => {
              const cnt = allDefs.filter(d => d.rarity === r && earnedIds.includes(d.id)).length;
              const cfg = RARITY_CONFIG[r];
              return cnt > 0 ? (
                <span key={r} style={{
                  fontSize: "0.6rem", fontWeight: 700,
                  background: cfg.badgeBg, color: cfg.badgeText,
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {cfg.label} ×{cnt}
                </span>
              ) : null;
            })}
          </div>
        </div>

        <AchievementGrid defs={allDefs} earned={earnedIds} userStats={stats} />
      </motion.div>

      {/* ── Row 4: Bottom Grid (Phase progress & Call To Action) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Column: Tiến độ theo Phase */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 bg-white border border-slate-100"
          style={{ boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)" }}
        >
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Tiến độ bài học theo Phase</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tiến trình đào tạo lý thuyết</p>
          </div>

          <div className="space-y-4">
            {phaseStats.map(ph => {
              const cfg = PHASE_CONFIG[ph.phase as keyof typeof PHASE_CONFIG];
              const Icon = cfg.Icon;

              return (
                <div key={ph.phase} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bgColor }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-700 truncate">Phase {ph.phase}: {ph.name}</span>
                      <span className="font-bold text-slate-500 shrink-0 ml-2">
                        {ph.completed} / {ph.total} bài
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 w-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${ph.pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: CTA / Quick Launch */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-100 flex flex-col justify-between"
          style={{ boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)" }}
        >
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Hành động nhanh</h3>

            {isUserNew ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chào mừng bạn đến với AntiPhisher! Hãy bắt đầu lộ trình để bảo vệ bản thân và tổ chức.
                </p>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
                  <span className="block text-[10px] text-indigo-500 font-bold uppercase mb-1">Khuyên dùng</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Học Phase 1: Nền tảng cơ bản
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Lý thuyết hoàn thành</span>
                  <span className="font-bold text-slate-700">
                    {Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Số lần phát hiện chính xác</span>
                  <span className="font-bold text-emerald-600">{accuracyRate}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={() => navigate("/nguoi-dung/lo-trinh")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700"
              style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.2)" }}
            >
              <BookOpen size={14} />
              {isUserNew ? "Bắt đầu học ngay" : "Tiếp tục học lý thuyết"}
            </button>

            {activeCampaign && (
              <button
                onClick={() => navigate("/nguoi-dung/mo-phong")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <PlayCircle size={14} />
                Thực hành mô phỏng
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Achievement Toast Manager ── */}
      <AchievementToastManager toasts={toastQueue} onDismiss={dismissToast} />

      {/* ── Onboarding Welcome Modal (one-time) ── */}
      <OnboardingWelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

    </div>
  );
}
