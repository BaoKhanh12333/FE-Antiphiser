import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { lessonService } from "../services/lessonService";
import { campaignService } from "../services/campaignService";
import { subscriptionService } from "../services/subscriptionService";
import { getCurrentUserId } from "../utils/currentUser";
import {
  CheckCircle2, Loader2, BookOpen, Shield, Mail,
  Building2, ShieldAlert, ChevronRight, PlayCircle, ArrowRight, AlertTriangle,
  Lock, X, Star, Zap, Clock, Flame,
} from "lucide-react";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @keyframes ltFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes check-pop {
    0%   { transform: scale(0) rotate(-12deg); opacity:0; }
    60%  { transform: scale(1.2) rotate(2deg); }
    100% { transform: scale(1) rotate(0); opacity:1; }
  }
  @keyframes progress-fill {
    from { width: 0%; }
  }
  .lt-enter { animation: ltFadeUp 0.38s ease-out both; }
  .lt-card:hover .lt-arrow { transform: translateX(3px); }
  .lt-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.12) !important; }
  .lt-locked-shimmer {
    background: linear-gradient(90deg, #F1F5F9 25%, #E8EEF7 50%, #F1F5F9 75%);
    background-size: 400px 100%;
    animation: shimmer 2.5s infinite linear;
  }
  .lt-check-pop { animation: check-pop 0.35s cubic-bezier(.34,1.56,.64,1) both; }
  .lt-progress-fill { animation: progress-fill 0.8s 0.3s ease-out both; }
  .lt-pulse { animation: pulse-ring 2s ease-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .lt-enter, .lt-locked-shimmer, .lt-pulse, .lt-progress-fill, .lt-check-pop {
      animation: none !important; transition: none !important;
    }
  }
`;

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASE_DEFAULTS: { Icon: React.ElementType; accent: string; iconBg: string; gradient: string }[] = [
  { Icon: Shield,      accent: "#7C3AED", iconBg: "#EDE9FE", gradient: "linear-gradient(135deg,#7C3AED,#9333EA)" },
  { Icon: Mail,        accent: "#2563EB", iconBg: "#DBEAFE", gradient: "linear-gradient(135deg,#2563EB,#3B82F6)" },
  { Icon: Building2,   accent: "#B45309", iconBg: "#FEF3C7", gradient: "linear-gradient(135deg,#B45309,#D97706)" },
  { Icon: ShieldAlert, accent: "#059669", iconBg: "#D1FAE5", gradient: "linear-gradient(135deg,#059669,#10B981)" },
  { Icon: BookOpen,    accent: "#0891B2", iconBg: "#CFFAFE", gradient: "linear-gradient(135deg,#0891B2,#06B6D4)" },
  { Icon: Shield,      accent: "#7C3AED", iconBg: "#EDE9FE", gradient: "linear-gradient(135deg,#7C3AED,#9333EA)" },
];

function getPhaseConfig(phaseNum: number, phaseName?: string) {
  const idx = (phaseNum - 1) % PHASE_DEFAULTS.length;
  const d = PHASE_DEFAULTS[Math.max(0, idx)];
  return { name: phaseName ?? `Phase ${phaseNum}`, ...d };
}

function getPhase(lesson: any) { return lesson.phaseNumber ?? 1; }

// ─── SVG progress ring (sidebar) ─────────────────────────────────────────────
function ProgressRing({ value, size = 108, stroke = 9 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ * (1 - value / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#ltGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)" }} />
        <defs>
          <linearGradient id="ltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center leading-none">
        <span style={{ fontWeight: 900, fontSize: size * 0.21, color: value === 100 ? "#059669" : "#4F46E5" }}>
          {value}%
        </span>
      </div>
    </div>
  );
}

// ─── Lesson Card ─────────────────────────────────────────────────────────────
function LessonCard({ lesson, isCompleted, phaseNum, isLocked, onOpen, delay = 0 }: {
  lesson: any; isCompleted: boolean; phaseNum: number; isLocked: boolean; onOpen: () => void; delay?: number;
}) {
  const cfg = getPhaseConfig(phaseNum, lesson.phaseName);
  const Icon = cfg.Icon;
  const preview = lesson.content?.replace(/<[^>]*>/g, "").slice(0, 80) || "Nhấn để xem chi tiết bài học...";

  return (
    <div
      onClick={onOpen}
      className="lt-enter lt-card group relative flex items-center gap-4 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
        padding: "14px 16px",
        border: isLocked
          ? "1px solid #E2E8F0"
          : isCompleted
            ? "1.5px solid rgba(16,185,129,0.3)"
            : "1px solid rgba(99,102,241,0.12)",
        background: isLocked ? "#F8FAFC"
          : isCompleted
            ? "linear-gradient(135deg, #FAFFFE 0%, #F0FDF9 100%)"
            : "white",
        boxShadow: isLocked ? "none"
          : isCompleted ? "0 2px 12px rgba(16,185,129,0.06)"
          : "0 2px 8px rgba(99,102,241,0.04)",
      }}
    >
      {/* Left accent bar */}
      {!isLocked && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "3px 0 0 3px",
          background: isCompleted ? "#10B981" : cfg.gradient,
        }} />
      )}

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: isLocked ? "#F1F5F9" : isCompleted ? "#ECFDF5" : cfg.iconBg,
          boxShadow: isLocked ? "none" : `0 2px 8px ${cfg.accent}20`,
        }}
      >
        {isLocked
          ? <Lock size={18} style={{ color: "#CBD5E1" }} />
          : isCompleted
            ? <CheckCircle2 size={20} className="lt-check-pop" style={{ color: "#10B981" }} />
            : <Icon size={20} style={{ color: cfg.accent }} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" style={{ marginLeft: 4 }}>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="font-bold text-sm leading-snug line-clamp-1"
            style={{ color: isLocked ? "#94A3B8" : "#1E293B" }}>
            {lesson.title}
          </h3>
          {isLocked ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full lt-locked-shimmer"
              style={{ color: "#94A3B8", border: "1px solid #E2E8F0" }}>
              <Lock size={8} /> Khoá
            </span>
          ) : isCompleted ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={8} /> Đã học
            </span>
          ) : (
            <span className="shrink-0 text-[10px] font-semibold text-indigo-400 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              Chưa học
            </span>
          )}
        </div>
        <p className="text-xs line-clamp-1" style={{ color: isLocked ? "#CBD5E1" : "#94A3B8" }}>
          {isLocked ? "Nâng cấp gói để mở khoá nội dung" : preview}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock size={10} style={{ color: "#CBD5E1" }} />
          <span style={{ fontSize: "0.7rem", color: "#CBD5E1" }}>{lesson.estimatedMinutes || 10} phút đọc</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={16}
        className="lt-arrow shrink-0 transition-transform duration-200"
        style={{ color: isLocked ? "#E2E8F0" : isCompleted ? "#34D399" : "#C7D2FE" }}
      />
    </div>
  );
}

// ─── Phase Group ─────────────────────────────────────────────────────────────
function PhaseGroup({ phaseNum, lessons, completedIds, onOpen, onLockedClick, delay = 0 }: {
  phaseNum: number; lessons: any[]; completedIds: number[];
  onOpen: (id: number) => void; onLockedClick: () => void; delay?: number;
}) {
  const phaseName = lessons[0]?.phaseName;
  const cfg       = getPhaseConfig(phaseNum, phaseName);
  const Icon      = cfg.Icon;
  const unlocked  = lessons.filter(l => !l.isLocked);
  const done      = unlocked.filter(l => completedIds.includes(l.lessonId)).length;
  const allDone   = unlocked.length > 0 && done === unlocked.length;
  const pct       = unlocked.length > 0 ? Math.round((done / unlocked.length) * 100) : 0;
  const lockedCount = lessons.filter(l => l.isLocked).length;

  return (
    <div className="space-y-2 lt-enter" style={{ animationDelay: `${delay}ms` }}>
      {/* Phase header */}
      <div className="rounded-2xl px-4 py-3 mb-1" style={{
        background: `${cfg.accent}08`,
        border: `1px solid ${cfg.accent}18`,
      }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: cfg.gradient, boxShadow: `0 4px 12px ${cfg.accent}30` }}>
            <Icon size={17} style={{ color: "#fff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-800" style={{ fontSize: "0.88rem" }}>
                Phase {phaseNum}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${cfg.accent}15`, color: cfg.accent }}>
                {cfg.name}
              </span>
              {allDone && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={9} /> Hoàn thành
                </span>
              )}
            </div>
            {/* Mini progress bar */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: `${cfg.accent}15` }}>
                <div className="h-full rounded-full lt-progress-fill"
                  style={{ width: `${pct}%`, background: allDone ? "#10B981" : cfg.gradient }} />
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: allDone ? "#059669" : cfg.accent }}>
                {done}/{unlocked.length}
              </span>
              {lockedCount > 0 && (
                <span style={{ fontSize: "0.68rem", color: "#CBD5E1" }}>· {lockedCount} khoá</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      {lessons.map((l, i) => (
        <LessonCard
          key={l.lessonId}
          lesson={l}
          phaseNum={phaseNum}
          isLocked={!!l.isLocked}
          isCompleted={!l.isLocked && completedIds.includes(l.lessonId)}
          onOpen={() => l.isLocked ? onLockedClick() : onOpen(l.lessonId)}
          delay={i * 30}
        />
      ))}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function ProgressSidebar({ lessons, completedIds, onGoToSimulation }: {
  lessons: any[]; completedIds: number[]; onGoToSimulation: () => void;
}) {
  const done  = completedIds.length;
  const total = lessons.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;
  const phaseNums = [...new Set(lessons.map(getPhase))].sort((a, b) => a - b);

  return (
    <div className="w-64 shrink-0 hidden lg:block space-y-4" style={{ position: "sticky", top: "1.5rem" }}>
      {/* Main progress card */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(99,102,241,0.12)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
          background: "white",
        }}>
        <div style={{ height: 4, background: "linear-gradient(90deg,#6366F1,#10B981)" }} />
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          {/* Ring */}
          <div className={allDone ? "lt-pulse" : ""} style={{ borderRadius: "50%" }}>
            <ProgressRing value={pct} />
          </div>
          <div>
            <div className="flex items-end justify-center gap-1">
              <span style={{ fontSize: "2.2rem", fontWeight: 900, color: allDone ? "#059669" : "#4F46E5", lineHeight: 1 }}>
                {done}
              </span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#CBD5E1", lineHeight: 1.6 }}>/{total}</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              bài hoàn thành
            </p>
          </div>
        </div>
      </div>

      {/* Phase breakdown */}
      <div className="bg-white rounded-2xl p-4 space-y-3"
        style={{ border: "1px solid rgba(99,102,241,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Tiến độ theo phase
        </p>
        {phaseNums.map(ph => {
          const phaseLs   = lessons.filter(l => getPhase(l) === ph);
          const phaseName = phaseLs[0]?.phaseName;
          const cfg       = getPhaseConfig(ph, phaseName);
          const Icon      = cfg.Icon;
          const phaseDone = phaseLs.filter(l => completedIds.includes(l.lessonId)).length;
          const phDone    = phaseLs.length > 0 && phaseDone === phaseLs.length;
          const phPct     = phaseLs.length > 0 ? Math.round((phaseDone / phaseLs.length) * 100) : 0;
          return (
            <div key={ph}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: phDone ? "#ECFDF5" : cfg.iconBg }}>
                  {phDone
                    ? <CheckCircle2 size={12} style={{ color: "#10B981" }} />
                    : <Icon size={12} style={{ color: cfg.accent }} />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>Phase {ph}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: phDone ? "#059669" : cfg.accent }}>
                    {phaseDone}/{phaseLs.length}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full ml-8" style={{ background: `${cfg.accent}15` }}>
                <div className="h-full rounded-full lt-progress-fill"
                  style={{ width: `${phPct}%`, background: phDone ? "#10B981" : cfg.gradient }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {allDone ? (
        <button onClick={onGoToSimulation}
          className="w-full lt-pulse flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 8px 24px rgba(16,185,129,0.35)" }}>
          <PlayCircle size={17} /> Vào mô phỏng ngay
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-4 text-center space-y-2"
          style={{ border: "1px dashed rgba(99,102,241,0.2)", background: "linear-gradient(135deg,#FAFAFF,#F5F3FF)" }}>
          <div className="flex items-center justify-center gap-1.5">
            <Flame size={14} style={{ color: "#6366F1" }} />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#4F46E5" }}>
              {total - done} bài nữa
            </span>
          </div>
          <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>để mở khoá mô phỏng thực chiến</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function LoTrinh() {
  const navigate = useNavigate();
  const reduced  = useReducedMotion();
  const [lessons, setLessons]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [campaignEligibility, setCampaignEligibility] = useState<{campaignId: number; campaignName: string; eligible: boolean}[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const userId = getCurrentUserId();
    const HIDDEN_KEYWORDS = ["test", "verify"];
    Promise.all([
      lessonService.getMyLessons(),
      userId ? lessonService.getUserProgress(userId).catch(() => []) : Promise.resolve([]),
      campaignService.getMyCampaigns().catch(() => []),
    ])
      .then(async ([allLessons, userProgress, myCampaigns]) => {
        setLessons(allLessons || []);
        setCompletedLessonIds(
          (userProgress || []).filter((p: any) => p.isCompleted).map((p: any) => p.lessonId)
        );
        const visibleCampaigns = (myCampaigns || []).filter((c: any) => {
          const name = (c.campaignName || "").toLowerCase();
          return !HIDDEN_KEYWORDS.some((kw: string) => name.includes(kw));
        });
        const eligResults = await Promise.all(
          visibleCampaigns.map(async (c: any) => {
            try {
              const eligible = await lessonService.checkEligibility(c.campaignId);
              return { campaignId: c.campaignId, campaignName: c.campaignName, eligible: !!eligible };
            } catch {
              return { campaignId: c.campaignId, campaignName: c.campaignName, eligible: false };
            }
          })
        );
        setCampaignEligibility(eligResults);
      })
      .catch(err => console.error("Lỗi tải bài học:", err))
      .finally(() => setLoading(false));
    subscriptionService.getAllPlans().then(p => setPlans(p || [])).catch(() => {});
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[340px] gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", boxShadow: "0 4px 16px rgba(99,102,241,0.15)" }}>
        <Loader2 className="animate-spin text-indigo-500" size={22} />
      </div>
      <p className="text-slate-400 text-sm font-medium">Đang tải bài học...</p>
    </div>
  );

  const phaseGroups: Record<number, any[]> = {};
  lessons.forEach(l => {
    const ph = getPhase(l);
    if (!phaseGroups[ph]) phaseGroups[ph] = [];
    phaseGroups[ph].push(l);
  });
  const sortedPhaseNums = Object.keys(phaseGroups).map(Number).sort((a, b) => a - b);
  const totalDone = completedLessonIds.length;
  const totalUnlocked = lessons.filter(l => !l.isLocked).length;

  const eligibleCampaigns   = campaignEligibility.filter(c => c.eligible);
  const ineligibleCampaigns = campaignEligibility.filter(c => !c.eligible);
  const totalPhases = sortedPhaseNums.length;
  const donePhases  = sortedPhaseNums.filter(ph => {
    const ls = phaseGroups[ph] || [];
    const ul = ls.filter((l: any) => !l.isLocked);
    return ul.length > 0 && ul.every((l: any) => completedLessonIds.includes(l.lessonId));
  }).length;

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{css}</style>

      {/* ── Header + stats ── */}
      <div className={!reduced ? "lt-enter mb-5" : "mb-5"}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
              Lộ trình học tập
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Hoàn thành bài học để mở khoá mô phỏng thực chiến
            </p>
          </div>
          {eligibleCampaigns.length > 0 && (
            <button
              onClick={() => navigate("/nguoi-dung/mo-phong")}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}
            >
              <PlayCircle size={15} /> Vào mô phỏng <ArrowRight size={13} />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Bài đã học",
              value: `${totalDone}/${totalUnlocked}`,
              sub: `${totalUnlocked > 0 ? Math.round((totalDone / totalUnlocked) * 100) : 0}% hoàn thành`,
              color: "#6366F1", bg: "#EEF2FF", border: "rgba(99,102,241,0.15)",
            },
            {
              label: "Phase đã xong",
              value: `${donePhases}/${totalPhases}`,
              sub: donePhases === totalPhases && totalPhases > 0 ? "Tất cả hoàn thành" : `Còn ${totalPhases - donePhases} phase`,
              color: donePhases === totalPhases && totalPhases > 0 ? "#059669" : "#F59E0B",
              bg: donePhases === totalPhases && totalPhases > 0 ? "#ECFDF5" : "#FFFBEB",
              border: donePhases === totalPhases && totalPhases > 0 ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            },
            {
              label: "Chiến dịch mở",
              value: `${eligibleCampaigns.length}/${campaignEligibility.length}`,
              sub: eligibleCampaigns.length > 0 ? "Sẵn sàng mô phỏng" : "Chưa đủ điều kiện",
              color: eligibleCampaigns.length > 0 ? "#059669" : "#94A3B8",
              bg: eligibleCampaigns.length > 0 ? "#ECFDF5" : "#F8FAFC",
              border: eligibleCampaigns.length > 0 ? "rgba(16,185,129,0.15)" : "#E2E8F0",
            },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </p>
              <p style={{ fontSize: "1.25rem", fontWeight: 900, color: s.color, lineHeight: 1.2, marginTop: 4 }}>
                {s.value}
              </p>
              <p style={{ fontSize: "0.7rem", color: s.color, opacity: 0.75, marginTop: 2 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Campaign section (compact) ── */}
      {campaignEligibility.length > 0 && (
        <div className={(!reduced ? "lt-enter " : "") + "mb-5 rounded-2xl overflow-hidden"}
          style={{ animationDelay: "40ms" }}>
          {/* Top strip */}
          <div style={{
            height: 3,
            background: eligibleCampaigns.length > 0
              ? "linear-gradient(90deg,#10B981,#34D399,#6366F1)"
              : "linear-gradient(90deg,#F59E0B,#FBBF24)",
          }} />
          <div className="px-5 py-4"
            style={{
              background: eligibleCampaigns.length > 0
                ? "linear-gradient(135deg,#F0FDF9 0%,#F5F3FF 100%)"
                : "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
              border: eligibleCampaigns.length > 0
                ? "1px solid rgba(16,185,129,0.18)"
                : "1px solid rgba(245,158,11,0.2)",
              borderTop: "none",
            }}>
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-0">
                {/* Heading */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: eligibleCampaigns.length > 0
                        ? "linear-gradient(135deg,#10B981,#059669)"
                        : "linear-gradient(135deg,#F59E0B,#D97706)",
                    }}>
                    {eligibleCampaigns.length > 0
                      ? <CheckCircle2 size={14} className="text-white" />
                      : <AlertTriangle size={14} className="text-white" />}
                  </div>
                  <p className="font-bold" style={{
                    fontSize: "0.88rem",
                    color: eligibleCampaigns.length > 0 ? "#065F46" : "#92400E",
                  }}>
                    {eligibleCampaigns.length > 0
                      ? `${eligibleCampaigns.length} chiến dịch đang chờ bạn`
                      : "Hoàn thành bài học để mở khoá chiến dịch"}
                  </p>
                </div>

                {/* Campaign chips */}
                <div className="flex flex-wrap gap-1.5">
                  {eligibleCampaigns.map(ce => (
                    <button
                      key={ce.campaignId}
                      onClick={() => navigate("/nguoi-dung/mo-phong")}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-[1.03]"
                      style={{
                        background: "white",
                        color: "#059669",
                        border: "1.5px solid rgba(16,185,129,0.3)",
                        boxShadow: "0 1px 4px rgba(16,185,129,0.1)",
                      }}
                    >
                      <PlayCircle size={11} />
                      {ce.campaignName}
                    </button>
                  ))}
                  {ineligibleCampaigns.map(ce => (
                    <span
                      key={ce.campaignId}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(0,0,0,0.04)", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                    >
                      <Lock size={9} />
                      {ce.campaignName}
                    </span>
                  ))}
                </div>
              </div>

              {eligibleCampaigns.length > 0 && (
                <button
                  onClick={() => navigate("/nguoi-dung/mo-phong")}
                  className="shrink-0 self-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg,#10B981,#059669)",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <PlayCircle size={15} /> Vào mô phỏng <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 2-column layout ── */}
      <div id="lotrinh-content" className={!reduced ? "lt-enter flex gap-6 items-start" : "flex gap-6 items-start"}
        style={!reduced ? { animationDelay: "60ms" } : {}}>

        {/* Lesson groups */}
        {lessons.length > 0 ? (
          <div className="flex-1 min-w-0 space-y-8">
            {sortedPhaseNums.map((ph, i) => (
              <PhaseGroup
                key={ph}
                phaseNum={ph}
                lessons={phaseGroups[ph]}
                completedIds={completedLessonIds}
                onOpen={id => navigate(`/nguoi-dung/bai-hoc/${id}`)}
                onLockedClick={() => setShowUpgradeModal(true)}
                delay={i * 50}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 text-center p-12 rounded-2xl"
            style={{ border: "1px dashed rgba(99,102,241,0.2)", background: "linear-gradient(135deg,#FAFAFF,#F5F3FF)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#EEF2FF" }}>
              <BookOpen size={24} className="text-indigo-300" />
            </div>
            <p className="text-slate-600 font-semibold">Chưa có bài học nào được giao.</p>
            <p className="text-slate-400 text-xs mt-1">Bài học xuất hiện khi bạn được giao campaign.</p>
          </div>
        )}

        {/* Sidebar */}
        <ProgressSidebar
          lessons={lessons}
          completedIds={completedLessonIds}
          onGoToSimulation={() => navigate("/nguoi-dung/mo-phong")}
        />
      </div>

      {/* ── Upgrade modal ── */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 shrink-0"
              style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)" }}>
              <button onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)" }}>
                <X size={15} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white" style={{ fontSize: "1rem" }}>Nâng cấp để mở khoá</p>
                  <p style={{ color: "rgba(165,180,252,0.85)", fontSize: "0.78rem" }}>Chọn gói phù hợp với nhu cầu của bạn</p>
                </div>
              </div>
            </div>

            {/* Plan list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin text-indigo-300 mx-auto mb-2" size={20} />
                  <p className="text-slate-400 text-sm">Đang tải gói dịch vụ...</p>
                </div>
              ) : (
                plans.map((plan: any, idx: number) => {
                  const isFeatured = idx === 0;
                  const priceLabel = plan.price != null
                    ? plan.price === 0 ? "Miễn phí" : `${Number(plan.price).toLocaleString("vi-VN")}đ`
                    : "Liên hệ";
                  return (
                    <button
                      key={plan.planId ?? idx}
                      onClick={() => {
                        setShowUpgradeModal(false);
                        navigate("/nguoi-dung/mua-goi", { state: { planId: plan.planId } });
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        border: isFeatured ? "1.5px solid #6366F1" : "1px solid #E2E8F0",
                        background: isFeatured ? "linear-gradient(135deg,#F5F3FF,#EEF2FF)" : "#FAFAFA",
                        boxShadow: isFeatured ? "0 4px 16px rgba(99,102,241,0.12)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isFeatured ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "#F1F5F9",
                          boxShadow: isFeatured ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                        }}>
                        {isFeatured
                          ? <Star size={17} className="text-white" />
                          : <Zap size={17} style={{ color: "#94A3B8" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold" style={{ fontSize: "0.9rem", color: "#0F172A" }}>
                            {plan.planName || plan.name || `Gói ${idx + 1}`}
                          </p>
                          <p className="font-extrabold shrink-0"
                            style={{ color: isFeatured ? "#6366F1" : "#334155", fontSize: "0.9rem" }}>
                            {priceLabel}
                          </p>
                        </div>
                        {plan.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{plan.description}</p>
                        )}
                      </div>
                      <ChevronRight size={14} style={{ color: isFeatured ? "#6366F1" : "#CBD5E1", flexShrink: 0 }} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 shrink-0 space-y-2">
              <button
                onClick={() => { setShowUpgradeModal(false); navigate("/nguoi-dung/mua-goi"); }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
              >
                Xem tất cả gói & nâng cấp
              </button>
              <button onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-50 transition-colors">
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
