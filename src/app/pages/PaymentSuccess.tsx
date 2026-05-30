import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Copy, Shield, Sparkles, Home, Receipt } from "lucide-react";

/* ── Confetti Particle ──────────────────────────────── */
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 6 + Math.random() * 8;
  const duration = 2.5 + Math.random() * 2;

  return (
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: `${left}%`,
        top: -20,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        background: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight + 50,
        opacity: [1, 1, 0.8, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{
        duration,
        delay,
        ease: "easeIn",
      }}
    />
  );
}

/* ── Info Row ───────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>{label}</span>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: "0.85rem", color: "#E2E8F0", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
          title="Sao chép"
        >
          {copied ? (
            <CheckCircle2 size={13} style={{ color: "#10B981" }} />
          ) : (
            <Copy size={13} style={{ color: "#475569" }} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  const txnRef = searchParams.get("vnp_TxnRef") || "—";
  const responseCode = searchParams.get("vnp_ResponseCode") || "00";
  const amount = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode") || "—";
  const orderInfo = searchParams.get("vnp_OrderInfo") || "Thanh toán gói dịch vụ AntiPhisher";

  // Format amount: VNPAY trả về đơn vị x100, chia lại
  const formattedAmount = amount
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parseInt(amount) / 100)
    : "—";

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = ["#10B981", "#34D399", "#6EE7B7", "#F59E0B", "#FBBF24", "#6366F1", "#818CF8", "#EC4899"];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #020617 0%, #0F172A 40%, #0D1424 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: 60 }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={Math.random() * 1.5}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(20,24,40,0.92) 0%, rgba(10,14,28,0.95) 100%)",
          border: "1px solid rgba(16,185,129,0.15)",
          backdropFilter: "blur(32px)",
          boxShadow:
            "0 0 80px rgba(16,185,129,0.08), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)",
              border: "2px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 40px rgba(16,185,129,0.15)",
            }}
          >
            <CheckCircle2 size={40} style={{ color: "#10B981" }} strokeWidth={2} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 justify-center mb-2">
              <Sparkles size={16} style={{ color: "#F59E0B" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#F59E0B", letterSpacing: "0.1em" }}>
                GIAO DỊCH THÀNH CÔNG
              </span>
              <Sparkles size={16} style={{ color: "#F59E0B" }} />
            </div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "1.5rem",
                color: "#F1F5F9",
                lineHeight: 1.3,
              }}
            >
              Thanh toán hoàn tất!
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: 8, lineHeight: 1.7 }}>
              Gói dịch vụ của bạn đã được kích hoạt thành công.
              <br />
              Chúc bạn có trải nghiệm đào tạo tuyệt vời!
            </p>
          </motion.div>

          {/* Amount highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 px-6 py-3 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "#6EE7B7", fontWeight: 600 }}>SỐ TIỀN THANH TOÁN</span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#10B981", marginTop: 2 }}>
              {formattedAmount}
            </p>
          </motion.div>
        </div>

        {/* Transaction details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="px-8 pb-5 space-y-2"
        >
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={14} style={{ color: "#475569" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>
              CHI TIẾT GIAO DỊCH
            </span>
          </div>
          <InfoRow label="Mã giao dịch" value={txnRef} />
          <InfoRow label="Mã phản hồi" value={responseCode} />
          <InfoRow label="Ngân hàng" value={bankCode} />
          <InfoRow label="Nội dung" value={decodeURIComponent(orderInfo)} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="px-8 pb-8 pt-3 flex gap-3"
        >
          <button
            onClick={() => navigate("/nguoi-dung")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            }}
          >
            <Home size={16} />
            Về Tổng quan
            <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Security badge */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-center gap-2 opacity-40">
            <Shield size={12} />
            <span style={{ fontSize: "0.65rem", color: "#64748B" }}>
              Giao dịch được bảo mật bởi VNPAY & AntiPhisher
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
