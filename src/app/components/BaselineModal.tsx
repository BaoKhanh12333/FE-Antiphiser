import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import mascotWave from "../../data/mascot/wave.png";
import mascotPoint from "../../data/mascot/point.png";
import mascotSad from "../../data/mascot/sad.png";
import mascotIdle from "../../data/mascot/idle.png";

interface Scenario {
  scenarioId: number;
  subject: string;
  senderName: string;
  senderEmail: string;
  emailBodyHtml: string;
  difficultyId: number;
}

type Phase = "loading" | "intro" | "quiz" | "result";

const SCORE_MAP = [
  { score: 0,   color: "#EF4444", label: "Nguy hiểm",    icon: "🚨", text: "Bạn đang ở mức rủi ro cao! Hãy bắt đầu luyện tập ngay hôm nay." },
  { score: 33,  color: "#F97316", label: "Cần cải thiện", icon: "⚠️", text: "Bạn dễ bị lừa hơn hầu hết mọi người. Luyện tập thêm sẽ giúp bạn nhiều đó." },
  { score: 67,  color: "#EAB308", label: "Khá tốt",       icon: "🙂", text: "Bạn đang tiến bộ! Chỉ cần luyện thêm một chút là sẽ rất tốt." },
  { score: 100, color: "#10B981", label: "Xuất sắc",      icon: "🏆", text: "Bạn có khả năng phát hiện phishing rất tốt. Tiếp tục duy trì nhé!" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  onComplete: () => void;
}

export function BaselineModal({ onComplete }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("loading");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    (axiosInstance as any)
      .get("Scenarios")
      .then((data: any) => {
        const all: Scenario[] = data?.result ?? [];
        const easy = all.filter((s: Scenario) => s.difficultyId === 1);
        if (easy.length < 3) {
          onComplete();
          return;
        }
        setScenarios(shuffle(easy).slice(0, 3));
        setPhase("intro");
      })
      .catch(() => onComplete());
  }, []);

  useEffect(() => {
    if (phase !== "result") return;
    const correctCount = results.filter(Boolean).length;
    const target = SCORE_MAP[Math.min(correctCount, 3)].score;
    setDisplayScore(0);
    let elapsed = 0;
    const step = 20;
    const duration = 1200;
    const timer = setInterval(() => {
      elapsed += step;
      if (elapsed >= duration) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round((elapsed / duration) * target));
      }
    }, step);
    return () => clearInterval(timer);
  }, [phase, results]);

  const handleChoice = async (isReported: boolean, isClickedLink: boolean, isCredentialLeaked: boolean, choiceLabel: string) => {
    if (submitting) return;
    setSubmitting(true);
    setSelectedChoice(choiceLabel);
    const sc = scenarios[index];
    let correct = false;
    try {
      const resp: any = await (axiosInstance as any).post("Scenarios/submit-attempt", {
        scenarioId: sc.scenarioId,
        campaignId: null,
        timeTakenSeconds: 30,
        isReported,
        isClickedLink,
        isCredentialLeaked,
      });
      correct = resp?.result?.isCorrect ?? false;
    } catch (_e) {
      correct = false;
    }
    const newResults = [...results, correct];
    setResults(newResults);
    setSubmitting(false);
    if (newResults.length < 3) {
      setIndex(index + 1);
    } else {
      setPhase("result");
    }
  };

  const correctCount = results.filter(Boolean).length;
  const scoreInfo = SCORE_MAP[Math.min(correctCount, 3)];
  const sc = scenarios[index];

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8"
        style={{ fontFamily: "'Be Vietnam Pro', Inter, sans-serif" }}
      >
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
          title="Bỏ qua"
        >
          <X size={16} />
        </button>
        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="text-center space-y-6">
            <div>
              <motion.img
                src={mascotWave}
                alt="mascot"
                className="w-20 h-20 object-contain mx-auto"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <h2 className="mt-3 text-xl text-slate-900" style={{ fontWeight: 800 }}>
                Kiểm tra điểm xuất phát của bạn 🎯
              </h2>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                Làm 3 câu nhanh để biết bạn đang ở mức nào.<br />Chỉ mất 2 phút!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPhase("quiz")}
                className="w-full py-3 rounded-xl text-white text-sm transition-all hover:opacity-90"
                style={{ fontWeight: 700, background: "linear-gradient(135deg, #6366F1, #818CF8)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
              >
                Bắt đầu ngay
              </button>
              <button
                onClick={onComplete}
                className="w-full py-2 rounded-xl text-slate-400 text-sm hover:text-slate-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && sc && (
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500" style={{ fontWeight: 700 }}>
                    Câu {index + 1} / 3
                  </span>
                  <span className="text-xs text-slate-400">
                    {Math.round(((index + 1) / 3) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${((index + 1) / 3) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ background: "linear-gradient(90deg, #6366F1, #818CF8)" }}
                  />
                </div>
              </div>

              {/* Email preview */}
              <div className="rounded-xl border border-slate-100 overflow-hidden" style={{ background: "#FAFAFF" }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-500">
                    <span className="text-slate-700" style={{ fontWeight: 600 }}>{sc.senderName}</span>
                    {" "}
                    <span className="font-mono text-slate-400">&lt;{sc.senderEmail}&gt;</span>
                  </p>
                  <p className="text-slate-800 text-sm mt-1" style={{ fontWeight: 700 }}>{sc.subject}</p>
                </div>
                <div
                  className="px-4 py-3 text-sm text-slate-600 overflow-y-auto"
                  style={{ maxHeight: 200, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: sc.emailBodyHtml ?? "" }}
                />
              </div>

              {/* Action buttons / loading */}
              <AnimatePresence mode="wait">
                {submitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="py-5 flex flex-col items-center gap-3"
                  >
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: "#6366F1" }}
                          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      Đang phân tích{" "}
                      <span style={{ fontWeight: 600, color: "#6366F1" }}>"{selectedChoice}"</span>
                      ...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="buttons"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <p
                      className="text-center text-slate-400"
                      style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      Bạn sẽ làm gì với email này?
                    </p>
                    <button
                      onClick={() => handleChoice(true, false, false, "Báo cáo phishing")}
                      className="w-full py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                      style={{ fontWeight: 600, background: "#FEF2F2", color: "#991B1B", border: "1.5px solid rgba(239,68,68,0.2)" }}
                    >
                      🚨 Báo cáo phishing
                    </button>
                    <button
                      onClick={() => handleChoice(false, true, false, "Click vào link")}
                      className="w-full py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                      style={{ fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid rgba(59,130,246,0.2)" }}
                    >
                      🔗 Click vào link
                    </button>
                    <button
                      onClick={() => handleChoice(false, false, false, "Bỏ qua")}
                      className="w-full py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                      style={{ fontWeight: 600, background: "#F0FDF4", color: "#166534", border: "1.5px solid rgba(16,185,129,0.2)" }}
                    >
                      ✅ Bỏ qua (email bình thường)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div>
              <motion.img
                src={correctCount === 3 ? mascotPoint : correctCount <= 1 ? mascotSad : mascotIdle}
                alt="mascot"
                className="w-24 h-24 object-contain mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              />
              <p className="mt-4" style={{ fontSize: "4rem", fontWeight: 900, lineHeight: 1, color: scoreInfo.color }}>
                {displayScore}
                <span className="text-slate-300" style={{ fontSize: "1.5rem", fontWeight: 400 }}>/100</span>
              </p>
              <p className="mt-1" style={{ fontWeight: 700, fontSize: "1rem", color: scoreInfo.color }}>
                {scoreInfo.label}
              </p>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">{scoreInfo.text}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { onComplete(); navigate("/nguoi-dung/bao-cao-ai"); }}
                className="w-full py-3 rounded-xl text-white text-sm transition-all hover:opacity-90"
                style={{ fontWeight: 700, background: "linear-gradient(135deg, #6366F1, #818CF8)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
              >
                Xem báo cáo của tôi
              </button>
              <button
                onClick={onComplete}
                className="w-full py-2 rounded-xl text-slate-400 text-sm hover:text-slate-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
