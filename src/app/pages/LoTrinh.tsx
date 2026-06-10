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
  Lock, X, Star, Zap,
} from "lucide-react";

// ─── Entrance animation CSS ───────────────────────────────────────────────────
const lotrinhCSS = `
  @keyframes ltFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .lt-enter { animation: ltFadeUp 0.32s ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .lt-enter { animation: none !important; }
  }
`;

// ─── Phase config (icon + pastel per phase) ──────────────────────────────────
const PHASE_DEFAULTS: { Icon: React.ElementType; accent: string; iconBg: string }[] = [
  { Icon: Shield,      accent: "#7C3AED", iconBg: "#EDE9FE" },
  { Icon: Mail,        accent: "#2563EB", iconBg: "#DBEAFE" },
  { Icon: Building2,   accent: "#B45309", iconBg: "#FEF3C7" },
  { Icon: ShieldAlert, accent: "#059669", iconBg: "#D1FAE5" },
  { Icon: BookOpen,    accent: "#0891B2", iconBg: "#CFFAFE" },
  { Icon: Shield,      accent: "#7C3AED", iconBg: "#EDE9FE" },
];

function getPhaseConfig(phaseNum: number, phaseName?: string) {
  const idx = (phaseNum - 1) % PHASE_DEFAULTS.length;
  const d = PHASE_DEFAULTS[Math.max(0, idx)];
  return {
    name:    phaseName ?? `Phase ${phaseNum}`,
    Icon:    d.Icon,
    accent:  d.accent,
    iconBg:  d.iconBg,
    border:  `${d.accent}26`,
  };
}

function getPhase(lesson: any) {
  return lesson.phaseNumber ?? 1;
}

// ─── Lesson Card ─────────────────────────────────────────────────────────────
function LessonCard({ lesson, isCompleted, phaseNum, isLocked, onOpen }: {
  lesson: any; isCompleted: boolean; phaseNum: number; isLocked: boolean; onOpen: () => void;
}) {
  const cfg = getPhaseConfig(phaseNum, lesson.phaseName);
  const Icon = cfg.Icon;
  const preview = lesson.content?.replace(/<[^>]*>/g, "").slice(0, 90) || "Nhấn để xem chi tiết bài học...";

  return (
    <div
      onClick={onOpen}
      className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isLocked
          ? "cursor-pointer opacity-60 grayscale"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
      }`}
      style={{
        border: isLocked
          ? "1px solid rgba(0,0,0,0.07)"
          : isCompleted
            ? "1.5px solid rgba(16,185,129,0.3)"
            : "1px solid rgba(0,0,0,0.07)",
        background: isLocked ? "#F8FAFC" : isCompleted ? "#FAFFFE" : "#fff",
      }}
    >
      {/* Phase icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: cfg.iconBg }}
      >
        {isLocked ? <Lock size={20} style={{ color: "#94A3B8" }} /> : <Icon size={22} style={{ color: cfg.accent }} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-semibold text-slate-700 text-sm leading-snug line-clamp-1">
            {lesson.title}
          </h3>
          {isLocked ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              <Lock size={8} /> Cần nâng cấp
            </span>
          ) : isCompleted ? (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} /> Đã học
            </span>
          ) : (
            <span className="shrink-0 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              Chưa học
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 line-clamp-1">{isLocked ? "Nâng cấp gói để mở khoá nội dung này" : preview}</p>
        <p className="text-[10px] text-slate-300 mt-1">{lesson.estimatedMinutes || 10} phút đọc</p>
      </div>

      {/* Arrow / Lock */}
      <ChevronRight
        size={15}
        className="shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors"
      />
    </div>
  );
}

// ─── Phase Group ─────────────────────────────────────────────────────────────
function PhaseGroup({ phaseNum, lessons, completedIds, onOpen, onLockedClick }: {
  phaseNum: number; lessons: any[]; completedIds: number[];
  onOpen: (id: number) => void; onLockedClick: () => void;
}) {
  const phaseName = lessons[0]?.phaseName;
  const cfg       = getPhaseConfig(phaseNum, phaseName);
  const unlocked  = lessons.filter(l => !l.isLocked);
  const done      = unlocked.filter(l => completedIds.includes(l.lessonId)).length;
  const allDone   = unlocked.length > 0 && done === unlocked.length;
  const Icon      = cfg.Icon;
  const lockedCount = lessons.filter(l => l.isLocked).length;

  return (
    <div className="space-y-2">
      {/* Phase header */}
      <div className="flex items-center gap-3 px-1 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconBg }}>
          <Icon size={16} style={{ color: cfg.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800" style={{ fontSize: "0.9rem" }}>
            Phase {phaseNum}: {cfg.name}
          </p>
          <p className="text-xs text-slate-400">
            {done}/{unlocked.length} bài hoàn thành
            {lockedCount > 0 && <span className="ml-2 text-slate-300">· {lockedCount} bài cần nâng cấp</span>}
          </p>
        </div>
        {allDone && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} /> Hoàn thành
          </span>
        )}
      </div>

      {/* Cards */}
      {lessons.map(l => (
        <LessonCard
          key={l.lessonId}
          lesson={l}
          phaseNum={phaseNum}
          isLocked={!!l.isLocked}
          isCompleted={!l.isLocked && completedIds.includes(l.lessonId)}
          onOpen={() => l.isLocked ? onLockedClick() : onOpen(l.lessonId)}
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

  // Build unique sorted phase list from lessons
  const phaseNums = [...new Set(lessons.map(getPhase))].sort((a, b) => a - b);

  return (
    <div className="w-64 shrink-0 space-y-4 hidden lg:block" style={{ position: "sticky", top: "1.5rem" }}>
      {/* Điểm nhấn chính: tiến độ tổng */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ học</p>
        <div>
          <span className="font-extrabold" style={{ fontSize: "2.8rem", color: "#4F46E5", lineHeight: 1 }}>{done}</span>
          <span className="font-bold text-slate-300" style={{ fontSize: "1.5rem" }}>/{total}</span>
          <p className="text-xs text-slate-400 mt-1">bài hoàn thành</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366F1, #818CF8)" }} />
        </div>
        <p className="text-sm font-bold" style={{ color: pct === 100 ? "#059669" : "#6366F1" }}>{pct}%</p>
      </div>

      {/* Phase breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phase</p>
        {phaseNums.map(ph => {
          const phaseLs   = lessons.filter(l => getPhase(l) === ph);
          const phaseName = phaseLs[0]?.phaseName;
          const cfg       = getPhaseConfig(ph, phaseName);
          const Icon      = cfg.Icon;
          const phaseDone = phaseLs.filter(l => completedIds.includes(l.lessonId)).length;
          const phDone    = phaseLs.length > 0 && phaseDone === phaseLs.length;
          return (
            <div key={ph} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: cfg.iconBg }}>
                <Icon size={12} style={{ color: cfg.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-500 truncate">Phase {ph}</span>
                  <span className="font-bold shrink-0 ml-1"
                    style={{ color: phDone ? "#059669" : "#94A3B8" }}>
                    {phaseDone}/{phaseLs.length}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: phaseLs.length > 0
                        ? `${Math.round((phaseDone / phaseLs.length) * 100)}%`
                        : "0%",
                      background: cfg.accent,
                    }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA mô phỏng */}
      {allDone ? (
        <button onClick={onGoToSimulation}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
          <PlayCircle size={16} /> Vào mô phỏng
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            Còn <span style={{ color: "#4F46E5", fontWeight: 700 }}>{total - done} bài</span> nữa
          </p>
          <p className="text-[11px] text-slate-400">để mở khoá mô phỏng thực chiến</p>
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
  // Eligibility per campaign: { campaignId: { name, eligible } }
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
        // Lọc campaign ẩn Test/Verify
        const visibleCampaigns = (myCampaigns || []).filter((c: any) => {
          const name = (c.campaignName || "").toLowerCase();
          return !HIDDEN_KEYWORDS.some((kw: string) => name.includes(kw));
        });
        // Gọi check-eligibility cho từng campaign
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
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
      <p className="text-slate-400 text-sm">Đang tải bài học...</p>
    </div>
  );

  // Nhóm theo phase — dynamic, không hardcode 1-4
  const phaseGroups: Record<number, any[]> = {};
  lessons.forEach(l => {
    const ph = getPhase(l);
    if (!phaseGroups[ph]) phaseGroups[ph] = [];
    phaseGroups[ph].push(l);
  });
  const sortedPhaseNums = Object.keys(phaseGroups).map(Number).sort((a, b) => a - b);

  // Eligibility tổng hợp: tất cả campaign đều đủ điều kiện?
  const allEligible = campaignEligibility.length > 0 && campaignEligibility.every(e => e.eligible);
  const someEligible = campaignEligibility.some(e => e.eligible);
  const noCampaigns = campaignEligibility.length === 0;

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{lotrinhCSS}</style>

      {/* Header — entrance 0 */}
      <div className={!reduced ? "lt-enter mb-6" : "mb-6"}
        style={!reduced ? { animationDelay: "0ms" } : {}}>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#0F172A" }}>Bài học lý thuyết</h1>
        <p className="text-slate-400 mt-0.5 text-sm">Hoàn thành bài học bắt buộc để mở khoá mô phỏng thực chiến</p>
      </div>

      {/* Banner per-campaign eligibility — gọi check-eligibility thật từ backend */}
      {campaignEligibility.map(ce => (
        <div
          key={ce.campaignId}
          className={(!reduced ? "lt-enter " : "") + "mb-4 flex items-center gap-4 p-4 rounded-2xl flex-wrap sm:flex-nowrap"}
          style={{
            background: ce.eligible ? "#ECFDF5" : "#FFFDF5",
            border: ce.eligible
              ? "1.5px solid rgba(16,185,129,0.25)"
              : "1.5px solid rgba(245,158,11,0.25)",
            animationDelay: "20ms",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: ce.eligible ? "#10B981" : "#F59E0B",
              boxShadow: ce.eligible
                ? "0 4px 12px rgba(16,185,129,0.3)"
                : "0 4px 12px rgba(245,158,11,0.3)",
            }}
          >
            {ce.eligible ? (
              <CheckCircle2 size={20} className="text-white" />
            ) : (
              <AlertTriangle size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold" style={{ fontSize: "0.88rem", color: ce.eligible ? "#065F46" : "#92400E" }}>
              {ce.eligible
                ? `Chúc mừng! Bạn đủ điều kiện vào "${ce.campaignName}"`
                : `Hoàn thành bài học để mở khoá "${ce.campaignName}"`}
            </p>
            <p style={{ fontSize: "0.78rem", color: ce.eligible ? "#059669" : "#B45309", marginTop: 2 }}>
              {ce.eligible
                ? "Bấm vào nút bên cạnh để bắt đầu mô phỏng thực chiến."
                : "Vui lòng hoàn thành các bài học bắt buộc ở dưới để mở khoá chiến dịch này."}
            </p>
          </div>
          <button
            onClick={() => {
              if (ce.eligible) {
                navigate("/nguoi-dung/mo-phong");
              } else {
                const element = document.getElementById("lotrinh-content");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }
              }
            }}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: ce.eligible
                ? "linear-gradient(135deg, #10B981, #059669)"
                : "linear-gradient(135deg, #6366F1, #4F46E5)",
              boxShadow: ce.eligible
                ? "0 4px 12px rgba(16,185,129,0.3)"
                : "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            {ce.eligible ? (
              <>
                <PlayCircle size={15} /> Vào mô phỏng <ArrowRight size={13} />
              </>
            ) : (
              <>
                <BookOpen size={15} /> Tiếp tục học <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      ))}


      {/* 2 cột: lesson groups + sidebar — entrance 1 */}
      <div id="lotrinh-content" className={!reduced ? "lt-enter flex gap-6 items-start" : "flex gap-6 items-start"}
        style={!reduced ? { animationDelay: "70ms" } : {}}>

        {/* Cột trái — phase groups */}
        {lessons.length > 0 ? (
          <div className="flex-1 min-w-0 space-y-8">
            {sortedPhaseNums.map(ph => (
              <PhaseGroup
                key={ph}
                phaseNum={ph}
                lessons={phaseGroups[ph]}
                completedIds={completedLessonIds}
                onOpen={id => navigate(`/nguoi-dung/bai-hoc/${id}`)}
                onLockedClick={() => setShowUpgradeModal(true)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 text-center p-10 bg-white rounded-2xl border border-slate-100">
            <BookOpen size={36} className="mx-auto text-indigo-300 mb-3" />
            <p className="text-slate-500 font-medium">Chưa có bài học nào được giao.</p>
            <p className="text-slate-400 text-xs mt-1">Bài học xuất hiện khi bạn được giao campaign có tiên quyết.</p>
          </div>
        )}

        {/* Cột phải — sidebar tiến độ */}
        <ProgressSidebar
          lessons={lessons}
          completedIds={completedLessonIds}
          onGoToSimulation={() => navigate("/nguoi-dung/mo-phong")}
        />
      </div>

      {/* Modal nâng cấp gói */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#fff" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white" style={{ fontSize: "1.05rem" }}>Nội dung yêu cầu nâng cấp</p>
                  <p className="text-indigo-300 text-xs">Chọn gói phù hợp để mở khoá toàn bộ bài học</p>
                </div>
              </div>
            </div>

            {/* Plan list */}
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {plans.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Đang tải danh sách gói...</p>
              ) : (
                plans.map((plan: any, idx: number) => (
                  <div
                    key={plan.planId ?? idx}
                    className="flex items-start gap-4 p-4 rounded-xl border transition-colors"
                    style={{ border: idx === 0 ? "1.5px solid #6366F1" : "1px solid #E2E8F0", background: idx === 0 ? "#F5F3FF" : "#FAFAFA" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: idx === 0 ? "#6366F1" : "#E2E8F0" }}
                    >
                      {idx === 0 ? <Star size={18} className="text-white" /> : <Zap size={18} style={{ color: "#64748B" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800" style={{ fontSize: "0.95rem" }}>
                          {plan.planName || plan.name || `Gói ${idx + 1}`}
                        </p>
                        <p className="font-extrabold shrink-0"
                          style={{ color: idx === 0 ? "#6366F1" : "#334155", fontSize: "0.95rem" }}>
                          {plan.price != null
                            ? plan.price === 0
                              ? "Miễn phí"
                              : `${Number(plan.price).toLocaleString("vi-VN")}đ`
                            : "Liên hệ"}
                        </p>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{plan.description}</p>
                      )}
                      {plan.durationDays && (
                        <p className="text-[11px] text-slate-400 mt-1">{plan.durationDays} ngày · {plan.maxUsers ?? "Không giới hạn"} người dùng</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 mb-3">
                Để đăng ký gói, vui lòng liên hệ quản lý của bạn hoặc bộ phận hỗ trợ.
              </p>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2.5 rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
