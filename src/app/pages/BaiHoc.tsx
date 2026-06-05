import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import DOMPurify from "dompurify";
import { lessonService } from "../services/lessonService";
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, BookOpen,
  ChevronDown, ChevronUp, RotateCcw,
} from "lucide-react";
import quizData from "../../data/quiz_seed.json";
import { getCurrentUserId } from "../utils/currentUser";

// ─── CSS bảng + nội dung lý thuyết (GIỮ NGUYÊN) ─────────────────────────────
const theoryCSS = `
  .theory-content h1,.theory-content h2,.theory-content h3{font-weight:700;color:#0F172A;margin:1.5rem 0 0.75rem}
  .theory-content h2{font-size:1.15rem;border-bottom:2px solid #EEF2FF;padding-bottom:0.4rem}
  .theory-content h3{font-size:1rem;color:#4F46E5}
  .theory-content p{margin:0.6rem 0;line-height:1.8;color:#334155}
  .theory-content ul,.theory-content ol{padding-left:1.5rem;margin:0.6rem 0}
  .theory-content li{margin:0.35rem 0;line-height:1.7;color:#334155}
  .theory-content strong{color:#0F172A;font-weight:600}
  .theory-content table{width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:0.875rem;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
  .theory-content th{background:#EEF2FF;color:#3730A3;font-weight:700;padding:10px 14px;text-align:left;border-bottom:2px solid #C7D2FE}
  .theory-content td{padding:9px 14px;border-bottom:1px solid #F1F5F9;color:#334155;vertical-align:top}
  .theory-content tr:last-child td{border-bottom:none}
  .theory-content tr:nth-child(even) td{background:#F8FAFF}
  .theory-content blockquote{border-left:4px solid #6366F1;background:#EEF2FF;padding:0.75rem 1rem;margin:1rem 0;border-radius:0 8px 8px 0;color:#3730A3;font-style:italic}
  .theory-content code{background:#F1F5F9;color:#7C3AED;padding:2px 6px;border-radius:4px;font-size:0.82em;font-family:monospace}
`;

// ─── Kiểu dữ liệu quiz ────────────────────────────────────────────────────────
type MCQuestion   = { id:string; type:"multiple_choice"; prompt:string; options:string[]; correctIndex:number; explanation:string };
type SpotQuestion = { id:string; type:"spot_the_flag"; autoGradable:false; prompt:string; emailSample:string; flags:string[]; explanation?:string };
type MatchQuestion= { id:string; type:"matching"; autoGradable:false; prompt:string; pairs:{term:string;desc:string}[]; explanation?:string };
type OrderQuestion= { id:string; type:"ordering"; autoGradable:false; prompt:string; items:{label:string;text:string}[]; correctOrder:string[]; explanation?:string };
type Question = MCQuestion | SpotQuestion | MatchQuestion | OrderQuestion;

// ─── Helper: khớp quiz entry theo title-prefix ────────────────────────────────
function findQuizForLesson(dbTitle: string) {
  if (!dbTitle) return null;
  return (quizData as any).lessons.find((l: any) =>
    dbTitle.startsWith(l.title)
  ) ?? null;
}

// ─── Màu trạng thái (design guide) ───────────────────────────────────────────
const STATUS = {
  done:    { bg: "#ECFDF5", border: "rgba(16,185,129,0.25)", text: "#059669" },
  active:  { bg: "#EEF2FF", border: "rgba(99,102,241,0.3)",  text: "#4F46E5" },
  neutral: { bg: "#F8FAFC", border: "#E2E8F0",               text: "#64748B" },
};

// ─── ScrollReveal (IntersectionObserver, 1 lần, không phá DOMPurify) ─────────
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} data-motion-entrance
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(10px)",
        transition: `opacity 0.32s ${delay}ms ease-out, transform 0.32s ${delay}ms ease-out`,
        willChange: "opacity, transform",
      }}>
      {children}
    </div>
  );
}

// ─── Animated SVG checkmark on completion ─────────────────────────────────────
function DrawCheckmark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="12" stroke="#10B981" strokeWidth="2" opacity="0.2" />
      <path d="M8 14.5l4.5 4.5 7.5-8"
        stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="56" className="check-draw" />
    </svg>
  );
}

// ─── Micro confetti (6 dots, học thuật, 1 lần) ────────────────────────────────
function Confetti() {
  return (
    <span className="relative inline-block" aria-hidden>
      <span className="conf-dot conf-a" style={{ top: -4, left: 2 }} />
      <span className="conf-dot conf-b" style={{ top: -2, left: 10 }} />
      <span className="conf-dot conf-c" style={{ top: 0, left: 18 }} />
      <span className="conf-dot conf-d" style={{ top: -4, left: -4 }} />
      <span className="conf-dot conf-e" style={{ top: 2, left: 6 }} />
      <span className="conf-dot conf-f" style={{ top: 0, left: 14 }} />
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Multiple Choice ──────────────────────────────────────────────────────────
function MultipleChoice({ q, submitted, userAnswer, onPick }:
  { q: MCQuestion; submitted: boolean; userAnswer: number | null; onPick: (i: number) => void }) {
  const reduced = useReducedMotion();
  return (
    <div className="space-y-2">
      {q.options.map((opt, i) => {
        const picked  = userAnswer === i;
        const correct = i === q.correctIndex;
        let bg = "#fff", border = "#E2E8F0", textCol = "#334155";
        if (submitted) {
          if (correct)     { bg = "#ECFDF5"; border = "rgba(16,185,129,0.4)"; textCol = "#065F46"; }
          else if (picked) { bg = "#FEF2F2"; border = "rgba(239,68,68,0.4)";  textCol = "#991B1B"; }
        } else if (picked) {
          bg = "#EEF2FF"; border = "rgba(99,102,241,0.5)"; textCol = "#3730A3";
        }
        const feedbackClass = submitted && picked && !correct ? "ans-wrong"
          : submitted && correct && picked ? "ans-correct" : "";
        return (
          <motion.button
            key={i}
            disabled={submitted}
            onClick={() => onPick(i)}
            whileHover={!submitted && !reduced ? { y: -1, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" } : {}}
            whileTap={!submitted && !reduced ? { scale: 0.98 } : {}}
            transition={{ duration: 0.15 }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-start gap-3 ${feedbackClass}`}
            style={{ background: bg, border: `1.5px solid ${border}`, color: textCol,
              cursor: submitted ? "default" : "pointer",
              transition: "background 0.2s, border-color 0.2s, color 0.2s" }}
          >
            <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{
                background: submitted && correct ? "#10B981" : submitted && picked ? "#EF4444"
                  : picked ? "#6366F1" : "#E2E8F0",
                color: (submitted && (correct || picked)) || (!submitted && picked) ? "#fff" : "#64748B",
                transition: "background 0.2s",
              }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span style={{ lineHeight: 1.6 }}>{opt}</span>
            {submitted && correct && <CheckCircle2 size={16} className="ml-auto shrink-0 mt-0.5 text-emerald-500" />}
            {submitted && picked && !correct && <XCircle size={16} className="ml-auto shrink-0 mt-0.5 text-red-400" />}
          </motion.button>
        );
      })}

      {/* Explanation slide-down khi submit */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="explanation"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-3 py-2.5 rounded-lg text-xs leading-relaxed mt-1"
              style={{ background: "#F8FAFC", color: "#475569", borderLeft: "3px solid #CBD5E1" }}>
              {q.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Spot the Flag ────────────────────────────────────────────────────────────
function SpotTheFlag({ q, revealed, onReveal }:
  { q: SpotQuestion; revealed: boolean; onReveal: () => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 text-sm font-mono leading-relaxed"
        style={{ background: "#0F172A", color: "#94A3B8", whiteSpace: "pre-wrap" }}>
        {q.emailSample}
      </div>
      {!revealed ? (
        <button onClick={onReveal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-amber-100"
          style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}>
          Hiện đáp án / Flags
        </button>
      ) : (
        <div className="space-y-2">
          {q.flags.map((f, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: "#FFFBEB", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span className="shrink-0 mt-0.5 text-amber-500">🚩</span>
              <span style={{ color: "#78350F", lineHeight: 1.6 }}>{f}</span>
            </div>
          ))}
          {q.explanation && (
            <p className="text-xs text-slate-400 mt-2 italic">{q.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Matching ─────────────────────────────────────────────────────────────────
function Matching({ q, revealed, onReveal }:
  { q: MatchQuestion; revealed: boolean; onReveal: () => void }) {
  return (
    <div className="space-y-3">
      {!revealed ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Thuật ngữ</p>
              {q.pairs.map((p, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700"
                  style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.2)" }}>{p.term}</div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Mô tả</p>
              {[...q.pairs].sort(() => Math.random() - 0.5).map((p, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-sm text-slate-600"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>{p.desc}</div>
              ))}
            </div>
          </div>
          <button onClick={onReveal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-amber-100"
            style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}>
            Hiện đáp án ghép đôi
          </button>
        </>
      ) : (
        <div className="space-y-2">
          {q.pairs.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "#ECFDF5", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="font-semibold text-emerald-700 shrink-0">{p.term}</span>
              <span className="text-slate-400 shrink-0">→</span>
              <span style={{ color: "#065F46" }}>{p.desc}</span>
            </div>
          ))}
          {q.explanation && <p className="text-xs text-slate-400 italic">{q.explanation}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Ordering ─────────────────────────────────────────────────────────────────
function Ordering({ q, revealed, onReveal }:
  { q: OrderQuestion; revealed: boolean; onReveal: () => void }) {
  const [order, setOrder] = useState<string[]>(() =>
    [...q.items.map(it => it.label)].sort(() => Math.random() - 0.5)
  );

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  };

  const isCorrect = revealed && order.join(",") === q.correctOrder.join(",");

  return (
    <div className="space-y-2">
      {order.map((label, i) => {
        const item = q.items.find(it => it.label === label)!;
        const correctPos = revealed ? q.correctOrder.indexOf(label) === i : null;
        return (
          <div key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: revealed ? (correctPos ? "#ECFDF5" : "#FEF2F2") : "#fff",
              border: `1.5px solid ${revealed ? (correctPos ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)") : "#E2E8F0"}`,
            }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#EEF2FF", color: "#4F46E5" }}>{label}</span>
            <span className="flex-1" style={{ color: "#334155", lineHeight: 1.5 }}>{item.text}</span>
            {!revealed && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp size={14} /></button>
                <button onClick={() => move(i, order.length - 1)} disabled={i === order.length - 1}
                  className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown size={14} /></button>
              </div>
            )}
            {revealed && (correctPos
              ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              : <XCircle size={14} className="text-red-400 shrink-0" />)}
          </div>
        );
      })}
      {!revealed && (
        <button onClick={onReveal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-amber-100"
          style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid rgba(180,83,9,0.2)" }}>
          Kiểm tra thứ tự
        </button>
      )}
      {revealed && (
        <p className="text-xs text-slate-400 italic">
          {isCorrect ? "✓ Thứ tự đúng!" : `Thứ tự đúng: ${q.correctOrder.join(" → ")}`}
          {q.explanation && ` — ${q.explanation}`}
        </p>
      )}
    </div>
  );
}

// ─── Animation CSS ────────────────────────────────────────────────────────────
const animCSS = `
  /* ── Entrance ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .quiz-fadeup { animation: fadeUp 0.3s ease-out both; }

  /* ── Quiz feedback ── */
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    20%    { transform:translateX(-5px); }
    40%    { transform:translateX(5px); }
    60%    { transform:translateX(-3px); }
    80%    { transform:translateX(3px); }
  }
  .ans-wrong { animation: shake 0.32s ease-out; }

  @keyframes pulseDot {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
    70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }
  .ans-correct { animation: pulseDot 0.5s ease-out; }

  /* ── Checkmark SVG draw ── */
  @keyframes drawCheck {
    from { stroke-dashoffset: 56; }
    to   { stroke-dashoffset: 0; }
  }
  .check-draw { animation: drawCheck 0.5s 0.1s cubic-bezier(.4,0,.2,1) both; }

  /* ── Confetti (6 dots, 1-time, học thuật) ── */
  @keyframes confettiA {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(-22px,-36px) scale(0); opacity:0; }
  }
  @keyframes confettiB {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(18px,-40px) scale(0); opacity:0; }
  }
  @keyframes confettiC {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(30px,-28px) scale(0); opacity:0; }
  }
  @keyframes confettiD {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(-30px,-20px) scale(0); opacity:0; }
  }
  @keyframes confettiE {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(-8px,-48px) scale(0); opacity:0; }
  }
  @keyframes confettiF {
    0%  { transform:translate(0,0) scale(1); opacity:1; }
    100%{ transform:translate(10px,-44px) scale(0); opacity:0; }
  }
  .conf-dot { position:absolute; width:6px; height:6px; border-radius:50%; pointer-events:none; }
  .conf-a { background:#6366F1; animation:confettiA 0.65s ease-out forwards; }
  .conf-b { background:#10B981; animation:confettiB 0.65s 0.05s ease-out forwards; }
  .conf-c { background:#F59E0B; animation:confettiC 0.65s 0.1s ease-out forwards; }
  .conf-d { background:#818CF8; animation:confettiD 0.65s 0.03s ease-out forwards; }
  .conf-e { background:#34D399; animation:confettiE 0.65s 0.08s ease-out forwards; }
  .conf-f { background:#A78BFA; animation:confettiF 0.65s 0.12s ease-out forwards; }

  /* ── prefers-reduced-motion: tắt mọi animation không thiết yếu ── */
  @media (prefers-reduced-motion: reduce) {
    .quiz-fadeup, .ans-wrong, .ans-correct, .check-draw,
    .conf-dot, [data-motion-entrance] {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function QuizSection({ questions, lessonId, onQuizDone }:
  { questions: Question[]; lessonId: number; onQuizDone: () => void }) {
  const navigate = useNavigate();
  const [answers, setAnswers]         = useState<Record<number, number>>({});
  const [submitted, setSubmitted]     = useState(false);
  const [revealed, setRevealed]       = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);

  const mcQuestions = questions.filter(q => q.type === "multiple_choice") as MCQuestion[];
  const mcIndices   = questions.reduce<number[]>((acc, q, i) => q.type === "multiple_choice" ? [...acc, i] : acc, []);
  const allMCAnswered = mcIndices.every(i => answers[i] !== undefined);

  const score = submitted
    ? mcIndices.filter(i => answers[i] === (questions[i] as MCQuestion).correctIndex).length
    : 0;

  const handleSubmit = useCallback(async () => {
    if (!allMCAnswered || submitted || submitting) return;
    setSaveError(null);
    setSubmitting(true);
    // Reveal all non-gradable câu hỏi
    const allRevealed: Record<number, boolean> = {};
    questions.forEach((_, i) => { allRevealed[i] = true; });
    setRevealed(allRevealed);
    try {
      await lessonService.trackProgress({ lessonId, isCompleted: true });
      // Chỉ set submitted = true SAU KHI API thành công → tránh báo "hoàn thành" giả
      setSubmitted(true);
      onQuizDone();
    } catch (err: any) {
      const msg = err?.message || "Không thể lưu tiến độ. Vui lòng thử lại.";
      console.error("[QuizSection] trackProgress thất bại:", err);
      setSaveError(msg);
      // Reset reveal để không lộ đáp án khi chưa lưu được
      setRevealed({});
    } finally {
      setSubmitting(false);
    }
  }, [allMCAnswered, submitted, submitting, questions, lessonId, onQuizDone]);

  const handleReset = () => {
    setAnswers({}); setSubmitted(false); setRevealed({}); setSaveError(null);
  };

  const maxLessonId = 19; // max lessonId trong seed — dùng cho nút "Bài tiếp theo"

  return (
    <section id="quiz-section" className="space-y-5">
      <style>{animCSS}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800" style={{ fontSize: "1rem" }}>Kiểm tra kiến thức</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {mcQuestions.length} câu trắc nghiệm · {questions.length - mcQuestions.length} câu tự đánh giá
          </p>
        </div>
        {submitted && (
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm" style={{ color: score === mcQuestions.length ? "#059669" : "#F59E0B" }}>
              {score}/{mcQuestions.length} đúng
            </span>
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all">
              <RotateCcw size={13} /> Làm lại
            </button>
          </div>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          {/* Question header */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ background: "#EEF2FF", color: "#4F46E5" }}>{i + 1}</span>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider mr-2"
                style={{ color: q.type === "multiple_choice" ? "#6366F1"
                  : q.type === "spot_the_flag" ? "#F59E0B"
                  : q.type === "matching" ? "#10B981" : "#8B5CF6" }}>
                {q.type === "multiple_choice" ? "Trắc nghiệm"
                  : q.type === "spot_the_flag" ? "Spot the Flag"
                  : q.type === "matching" ? "Ghép đôi" : "Sắp xếp"}
              </span>
              <p className="text-slate-700 text-sm mt-1 font-medium leading-relaxed">{q.prompt}</p>
            </div>
          </div>

          {/* Render by type */}
          {q.type === "multiple_choice" && (
            <MultipleChoice q={q} submitted={submitted}
              userAnswer={answers[i] ?? null}
              onPick={idx => !submitted && setAnswers(prev => ({ ...prev, [i]: idx }))} />
          )}
          {q.type === "spot_the_flag" && (
            <SpotTheFlag q={q} revealed={!!revealed[i]}
              onReveal={() => setRevealed(prev => ({ ...prev, [i]: true }))} />
          )}
          {q.type === "matching" && (
            <Matching q={q} revealed={!!revealed[i]}
              onReveal={() => setRevealed(prev => ({ ...prev, [i]: true }))} />
          )}
          {q.type === "ordering" && (
            <Ordering q={q} revealed={!!revealed[i]}
              onReveal={() => setRevealed(prev => ({ ...prev, [i]: true }))} />
          )}

          {/* Explanation moved into MultipleChoice component */}
        </div>
      ))}

      {/* Lỗi lưu tiến độ */}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.25)", color: "#991B1B" }}>
          <XCircle size={15} className="shrink-0 text-red-400" />
          <span>{saveError}</span>
          <button onClick={handleReset} className="ml-auto text-xs font-semibold underline hover:no-underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Submit / Done bar */}
      {!submitted ? (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <span className="text-sm text-slate-400">
            {allMCAnswered
              ? "Đã trả lời hết câu trắc nghiệm — sẵn sàng nộp bài"
              : `Còn ${mcIndices.length - Object.keys(answers).length} câu trắc nghiệm chưa trả lời`}
          </span>
          <button onClick={handleSubmit} disabled={!allMCAnswered || submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Đang lưu…</> : "Nộp bài"}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: score === mcQuestions.length ? "#ECFDF5" : "#FFFBEB",
            border: `1px solid ${score === mcQuestions.length ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}` }}>
          {/* Score row */}
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              {score === mcQuestions.length ? (
                <><DrawCheckmark /><Confetti /></>
              ) : (
                <span className="text-2xl">💪</span>
              )}
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: score === mcQuestions.length ? "#065F46" : "#92400E" }}>
                {score === mcQuestions.length
                  ? "Xuất sắc! Bạn đã nắm vững bài học này."
                  : `${score}/${mcQuestions.length} câu đúng — xem lại giải thích bên trên.`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: score === mcQuestions.length ? "#10B981" : "#B45309" }}>
                Bài học đã được ghi nhận hoàn thành.
              </p>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/nguoi-dung/lo-trinh")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.7)", color: "#334155", border: "1px solid rgba(0,0,0,0.08)" }}>
              <ArrowLeft size={14} /> Về danh sách
            </motion.button>
            {lessonId < maxLessonId && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/nguoi-dung/bai-hoc/${lessonId + 1}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                Bài tiếp theo <ArrowLeft size={14} className="rotate-180" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function BaiHoc() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate     = useNavigate();
  const reduced      = useReducedMotion();

  const [lesson,      setLesson]      = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [readPct,     setReadPct]     = useState(0); // reading progress 0-100

  const numId = lessonId ? parseInt(lessonId, 10) : null;

  // Thanh tiến độ đọc — scroll trong <main> của DashboardLayout
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || reduced) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = main;
      const pct = scrollHeight > clientHeight
        ? Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100) : 0;
      setReadPct(pct);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // Fetch lesson + completed status
  useEffect(() => {
    if (!numId) return;
    lessonService.getLessonById(numId)
      .then(setLesson)
      .catch(() => setError("Không tải được bài học. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, [numId]);

  useEffect(() => {
    if (!numId) return;
    const userId = getCurrentUserId();
    if (!userId) return;
    lessonService.getUserProgress(userId)
      .then((prog: any[]) => {
        setIsCompleted((prog || []).some((p: any) => p.lessonId === numId && p.isCompleted));
      })
      .catch(() => {});
  }, [numId]);

  const handleMarkComplete = async () => {
    if (!numId || isCompleted || markingDone) return;
    setMarkingDone(true);
    try {
      await lessonService.trackProgress({ lessonId: numId, isCompleted: true });
      setIsCompleted(true);
    } catch {}
    finally { setMarkingDone(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
      <span className="text-slate-400 text-sm">Đang tải bài học…</span>
    </div>
  );

  if (error || !lesson) return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500 font-medium">{error || "Không tìm thấy bài học."}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline text-sm font-semibold">
        ← Quay lại
      </button>
    </div>
  );

  const quizEntry    = findQuizForLesson(lesson.title);
  const quizQuestions: Question[] = quizEntry?.questions ?? [];
  const status       = isCompleted ? STATUS.done : STATUS.active;

  // Stagger helper — dùng CSS transition thay vì motion để không bị race với AnimatePresence
  const stagger = (n: number) => reduced ? {} : {
    style: {
      opacity: 1, // handled by CSS transition below
      animationDelay: `${n * 65}ms`,
      animationFillMode: "both" as const,
      animationName: "fadeUp",
      animationDuration: "0.3s",
      animationTimingFunction: "ease-out",
    } as React.CSSProperties
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{theoryCSS}</style>
      <style>{animCSS}</style>

      {/* ── Reading progress bar (sticky top, 3px, indigo) ── */}
      {!reduced && (
        <div className="sticky top-0 z-10 -mx-4 lg:-mx-6 mb-6" style={{ height: 3 }}>
          <div
            style={{
              height: "100%",
              width: `${readPct}%`,
              background: "linear-gradient(90deg, #6366F1, #818CF8)",
              transition: "width 0.1s linear",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>
      )}

      <div className="space-y-5">
        {/* Back */}
        <div {...stagger(0)}>
          <button onClick={() => navigate("/nguoi-dung/lo-trinh")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={15} /> Bài học
          </button>
        </div>

        {/* Header card — entrance stagger 1 */}
        <div {...stagger(1)}>
          <div className="bg-white rounded-2xl border p-6 space-y-3 transition-shadow duration-200"
            style={{ borderColor: status.border, boxShadow: isCompleted ? "0 2px 16px rgba(16,185,129,0.08)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              {lesson.phaseNumber && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                  Phase {lesson.phaseNumber} · Module {lesson.moduleNumber}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                {isCompleted
                  ? <><CheckCircle2 size={10} /> Hoàn thành</>
                  : <><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#6366F1" }} /> Đang học</>}
              </span>
            </div>
            <h1 className="text-slate-900 font-bold leading-snug" style={{ fontSize: "1.25rem" }}>
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Theory content — scroll-reveal wrapper (KHÔNG đụng DOMPurify bên trong) */}
        <ScrollReveal delay={reduced ? 0 : 80}>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm theory-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content || "") }} />
        </ScrollReveal>

        {/* Mark complete (no quiz) */}
        {quizQuestions.length === 0 && (
          <ScrollReveal delay={reduced ? 0 : 140}>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-slate-700 text-sm">Đã đọc xong bài học?</p>
                <p className="text-slate-400 text-xs mt-0.5">Đánh dấu hoàn thành để ghi nhận tiến độ</p>
              </div>
              {isCompleted ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "#ECFDF5", color: "#059669" }}>
                  <DrawCheckmark /> Hoàn thành
                </div>
              ) : (
                <motion.button
                  whileHover={!reduced ? { scale: 1.02 } : {}}
                  whileTap={!reduced ? { scale: 0.97 } : {}}
                  onClick={handleMarkComplete} disabled={markingDone}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  {markingDone
                    ? <><Loader2 size={14} className="animate-spin" /> Đang lưu…</>
                    : <><CheckCircle2 size={14} /> Hoàn thành bài học</>}
                </motion.button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Divider + quiz */}
        {quizQuestions.length > 0 && (
          <>
            <ScrollReveal delay={reduced ? 0 : 120}>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kiểm tra kiến thức</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </ScrollReveal>
            <QuizSection
              questions={quizQuestions}
              lessonId={numId!}
              onQuizDone={() => setIsCompleted(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}
