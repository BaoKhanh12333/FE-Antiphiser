import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { CheckCircle2, BookOpen, BarChart3, Target, ArrowRight, Sparkles } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  durationInMonths: number;
  maxSlots?: number;
}

interface Props {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
}

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 5 + Math.random() * 7;
  return (
    <motion.div
      className="fixed pointer-events-none z-[160]"
      style={{ left: `${left}%`, top: -16, width: size, height: size, borderRadius: "2px", background: color }}
      initial={{ y: -16, opacity: 1, rotate: 0 }}
      animate={{
        y: typeof window !== "undefined" ? window.innerHeight + 40 : 800,
        opacity: [1, 1, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 140,
      }}
      transition={{ duration: 2 + Math.random() * 1.5, delay, ease: "easeIn" }}
    />
  );
}

const CONFETTI_COLORS = ["#10B981", "#34D399", "#6EE7B7", "#6366F1", "#A5B4FC", "#F59E0B", "#FCD34D"];

const UNLOCKED = [
  { icon: BookOpen, color: "#6366F1", label: "Toàn bộ bài học 4 Phase" },
  { icon: Target,   color: "#F59E0B", label: "Mô phỏng email thực chiến" },
  { icon: BarChart3, color: "#10B981", label: "Báo cáo phân tích AI" },
];

export function IndividualPlanSuccessModal({ open, plan, onClose }: Props) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open || !plan) return null;

  function goLearn() {
    onClose();
    navigate("/nguoi-dung/lo-trinh");
  }

  function goDashboard() {
    onClose();
    navigate("/nguoi-dung");
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}
    >
      {showConfetti &&
        Array.from({ length: 55 }).map((_, i) => (
          <ConfettiPiece key={i} delay={i * 0.035} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
        ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #ECFDF5 0%, #F0FFF4 40%, #ECFDF5 100%)",
          border: "1.5px solid #A7F3D0",
          boxShadow: "0 0 60px rgba(16,185,129,0.15), 0 30px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.7), transparent)" }}
        />

        <div className="px-7 pt-8 pb-7 flex flex-col items-center text-center">
          {/* Hero icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
              border: "2px solid rgba(16,185,129,0.35)",
              boxShadow: "0 0 40px rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle2 size={38} style={{ color: "#10B981" }} strokeWidth={2} />
          </motion.div>

          {/* Badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={12} style={{ color: "#059669" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669", letterSpacing: "0.12em" }}>
              GÓI ĐÃ KÍCH HOẠT
            </span>
            <Sparkles size={12} style={{ color: "#059669" }} />
          </div>

          <h1 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#064E3B", lineHeight: 1.25, marginBottom: 6 }}>
            {plan.name}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>
            Gói{" "}
            <span style={{ fontWeight: 700, color: "#047857" }}>{plan.durationInMonths} tháng</span>{" "}
            của bạn đã sẵn sàng. Bắt đầu học ngay để tận dụng tối đa!
          </p>

          {/* Unlocked features */}
          <div className="w-full space-y-2 mb-7">
            {UNLOCKED.map(({ icon: Icon, color, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(16,185,129,0.15)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1E293B" }}>
                  ✓ {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="w-full space-y-2.5">
            <button
              onClick={goLearn}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#fff",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              }}
            >
              <BookOpen size={15} /> Bắt đầu học ngay
            </button>
            <button
              onClick={goDashboard}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-emerald-50"
              style={{ border: "1px solid #A7F3D0", color: "#064E3B" }}
            >
              Xem tổng quan <ArrowRight size={13} className="inline ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
