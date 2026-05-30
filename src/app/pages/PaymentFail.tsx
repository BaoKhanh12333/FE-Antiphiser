import { useSearchParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { XCircle, ArrowRight, Copy, Shield, AlertTriangle, Home, RefreshCw, Receipt } from "lucide-react";
import { useState } from "react";

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
            <span style={{ fontSize: "0.7rem", color: "#EF4444" }}>Đã copy</span>
          ) : (
            <Copy size={13} style={{ color: "#475569" }} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── VNPAY Error Codes ──────────────────────────────── */
const getErrorMessage = (code: string) => {
  switch (code) {
    case "24":
      return "Giao dịch không thành công do khách hàng hủy giao dịch.";
    case "09":
      return "Thẻ/Tài khoản của bạn chưa đăng ký dịch vụ InternetBanking.";
    case "10":
      return "Bạn đã xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
    case "11":
      return "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.";
    case "12":
      return "Thẻ/Tài khoản của bạn đang bị khóa.";
    case "51":
      return "Tài khoản của bạn không đủ số dư để thực hiện giao dịch.";
    case "65":
      return "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày.";
    case "75":
      return "Ngân hàng thanh toán đang bảo trì.";
    case "99":
      return "Lỗi hệ thống VNPAY. Vui lòng thử lại sau.";
    default:
      return "Giao dịch bị từ chối hoặc đã xảy ra lỗi trong quá trình thanh toán.";
  }
};

export function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const txnRef = searchParams.get("vnp_TxnRef") || "—";
  const responseCode = searchParams.get("vnp_ResponseCode") || "—";
  const amount = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode") || "—";
  const orderInfo = searchParams.get("vnp_OrderInfo") || "Thanh toán gói dịch vụ AntiPhisher";

  const formattedAmount = amount
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parseInt(amount) / 100)
    : "—";

  const errorDesc = getErrorMessage(responseCode);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #020617 0%, #0F172A 40%, #0D1424 100%)",
      }}
    >
      {/* Ambient glow (Red/Orange) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(239,68,68,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(20,24,40,0.92) 0%, rgba(10,14,28,0.95) 100%)",
          border: "1px solid rgba(239,68,68,0.15)",
          backdropFilter: "blur(32px)",
          boxShadow:
            "0 0 80px rgba(239,68,68,0.05), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Error icon */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)",
              border: "2px solid rgba(239,68,68,0.3)",
              boxShadow: "0 0 40px rgba(239,68,68,0.15)",
            }}
          >
            <XCircle size={40} style={{ color: "#EF4444" }} strokeWidth={2} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 justify-center mb-2">
              <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#F59E0B", letterSpacing: "0.1em" }}>
                THANH TOÁN THẤT BẠI
              </span>
              <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
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
              Giao dịch bị từ chối!
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#EF4444", marginTop: 8, fontWeight: 500, lineHeight: 1.5 }}>
              {errorDesc}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 8, lineHeight: 1.6 }}>
              Số tiền chưa được trừ khỏi tài khoản của bạn hoặc sẽ được hoàn lại tự động nếu có sai sót. Vui lòng kiểm tra lại.
            </p>
          </motion.div>

          {/* Amount highlight */}
          {amount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 px-6 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <span style={{ fontSize: "0.68rem", color: "#FCA5A5", fontWeight: 600 }}>SỐ TIỀN THỰC HIỆN</span>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#FCA5A5", marginTop: 2 }}>
                {formattedAmount}
              </p>
            </motion.div>
          )}
        </div>

        {/* Transaction details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
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
          transition={{ delay: 0.9 }}
          className="px-8 pb-8 pt-3 flex gap-3"
        >
          <button
            onClick={() => navigate("/quan-ly/subscription")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] bg-white/5 border border-white/10 hover:bg-white/10"
            style={{ color: "#E2E8F0" }}
          >
            <RefreshCw size={15} />
            Thử lại
          </button>
          
          <button
            onClick={() => navigate("/nguoi-dung")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #475569, #334155)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(51,65,85,0.3)",
            }}
          >
            <Home size={15} />
            Tổng quan
            <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Security badge */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-center gap-2 opacity-40">
            <Shield size={12} style={{ color: "#94A3B8" }} />
            <span style={{ fontSize: "0.65rem", color: "#64748B" }}>
              Giao dịch được bảo mật bởi VNPAY & AntiPhisher
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
