import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Shield, BookOpen, Target, BarChart3, Trophy,
  ChevronRight, X, Sparkles,
} from "lucide-react";

const STORAGE_KEY = "ap_welcome_done";

interface Props {
  open: boolean;
  onClose: () => void;
}

const JOURNEY_STEPS = [
  {
    icon: BookOpen,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.12)",
    title: "Học lý thuyết",
    desc: "4 phase bài học từ cơ bản đến nâng cao",
  },
  {
    icon: Target,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    title: "Mô phỏng thực chiến",
    desc: "Đối mặt với email phishing giống thật 100%",
  },
  {
    icon: BarChart3,
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    title: "Phân tích & Báo cáo AI",
    desc: "AI đánh giá điểm yếu và gợi ý cải thiện",
  },
  {
    icon: Trophy,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
    title: "Thành tích & Chứng chỉ",
    desc: "Mở khoá huy hiệu, xuất chứng chỉ an toàn thông tin",
  },
];

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 5 + Math.random() * 6;
  return (
    <motion.div
      className="fixed pointer-events-none z-[220]"
      style={{ left: `${left}%`, top: -16, width: size, height: size, borderRadius: "2px", background: color }}
      initial={{ y: -16, opacity: 1, rotate: 0 }}
      animate={{
        y: typeof window !== "undefined" ? window.innerHeight + 40 : 800,
        opacity: [1, 1, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 120,
      }}
      transition={{ duration: 2.2 + Math.random() * 1.5, delay, ease: "easeIn" }}
    />
  );
}

const CONFETTI_COLORS = ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#34D399", "#A78BFA"];

export function OnboardingWelcomeModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  if (!open) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  function handleStart() {
    dismiss();
    navigate("/nguoi-dung/lo-trinh");
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.9)", backdropFilter: "blur(10px)" }}
    >
      {/* Confetti only on last slide */}
      {slide === 2 &&
        Array.from({ length: 45 }).map((_, i) => (
          <ConfettiPiece key={i} delay={i * 0.04} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
        ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0A0F24 0%, #111827 60%, #0A0F24 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow:
            "0 0 100px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
          minHeight: 480,
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)" }}
        />

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 500px 300px at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10"
          title="Bỏ qua"
        >
          <X size={15} style={{ color: "#475569" }} />
        </button>

        {/* Slide dots */}
        <div className="flex justify-center gap-2 pt-6 pb-0">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                height: 6,
                width: i === slide ? 24 : 6,
                borderRadius: 3,
                background:
                  i < slide
                    ? "#10B981"
                    : i === slide
                    ? "#6366F1"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">

          {/* ── Slide 0: Chào mừng ── */}
          {slide === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.32 }}
              className="px-8 pt-6 pb-8 flex flex-col items-center text-center"
            >
              {/* Icon hero */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(99,102,241,0.35)",
                  boxShadow: "0 0 40px rgba(99,102,241,0.2)",
                }}
              >
                <Shield size={36} style={{ color: "#818CF8" }} strokeWidth={1.5} />
              </motion.div>

              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={12} style={{ color: "#F59E0B" }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#F59E0B", letterSpacing: "0.12em" }}>
                  CHÀO MỪNG ĐẾN VỚI
                </span>
                <Sparkles size={12} style={{ color: "#F59E0B" }} />
              </div>

              <h1 style={{ fontWeight: 900, fontSize: "1.75rem", color: "#F1F5F9", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                AntiPhisher
              </h1>
              <p style={{ fontSize: "0.88rem", color: "#94A3B8", marginTop: 10, lineHeight: 1.75, maxWidth: 340 }}>
                Nền tảng đào tạo nhận diện & phòng chống lừa đảo qua email cho{" "}
                <span style={{ color: "#A5B4FC" }}>cá nhân</span> và{" "}
                <span style={{ color: "#A5B4FC" }}>doanh nghiệp</span>.
              </p>

              {/* Quick stats pills */}
              <div className="flex flex-wrap gap-2 justify-center mt-6 mb-8">
                {[
                  { label: "4 Phase học tập", color: "#6366F1" },
                  { label: "Email thực chiến", color: "#10B981" },
                  { label: "Báo cáo AI", color: "#F59E0B" },
                  { label: "Chứng chỉ số", color: "#EC4899" },
                ].map(({ label, color }) => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSlide(1)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "#fff",
                  boxShadow: "0 8px 28px rgba(99,102,241,0.45)",
                }}
              >
                Tìm hiểu thêm <ChevronRight size={16} />
              </button>

              <button onClick={dismiss} className="mt-3 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Bỏ qua, tôi tự khám phá
              </button>
            </motion.div>
          )}

          {/* ── Slide 1: Hành trình ── */}
          {slide === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.32 }}
              className="px-8 pt-6 pb-8"
            >
              <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#F1F5F9", marginBottom: 4 }}>
                Hành trình của bạn
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: 24 }}>
                4 bước để trở thành chuyên gia nhận diện phishing
              </p>

              <div className="space-y-3 mb-8">
                {JOURNEY_STEPS.map(({ icon: Icon, color, bg, title, desc }, idx) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    className="flex items-start gap-4 p-3.5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: bg, border: `1px solid ${color}30` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold rounded-full px-2 py-0.5"
                          style={{ background: bg, color }}
                        >
                          Bước {idx + 1}
                        </span>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#E2E8F0" }}>{title}</p>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 3 }}>{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSlide(0)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#64748B" }}
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setSlide(2)}
                  className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}
                >
                  Tiếp theo <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Slide 2: Sẵn sàng ── */}
          {slide === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.32 }}
              className="px-8 pt-6 pb-8 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                style={{ fontSize: "4rem", marginBottom: 12, lineHeight: 1 }}
              >
                🚀
              </motion.div>

              <h2 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#F1F5F9", lineHeight: 1.3, marginBottom: 10 }}>
                Sẵn sàng chinh phục phishing!
              </h2>
              <p style={{ fontSize: "0.83rem", color: "#94A3B8", lineHeight: 1.75, maxWidth: 320, marginBottom: 28 }}>
                Chúng tôi sẽ dẫn dắt bạn từng bước. Bắt đầu bằng bài học đầu tiên — chỉ mất{" "}
                <span style={{ color: "#A5B4FC", fontWeight: 700 }}>5–10 phút</span>.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "#fff",
                    boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
                  }}
                >
                  <BookOpen size={15} /> Bắt đầu học ngay
                </button>
                <button
                  onClick={dismiss}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/8"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#64748B" }}
                >
                  Khám phá dashboard trước
                </button>
              </div>

              <p style={{ fontSize: "0.68rem", color: "#334155", marginTop: 16 }}>
                Hướng dẫn này sẽ không xuất hiện lại sau khi bạn đóng.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Kiểm tra xem có nên hiển thị welcome modal không */
export function shouldShowWelcome(): boolean {
  return !localStorage.getItem(STORAGE_KEY);
}
