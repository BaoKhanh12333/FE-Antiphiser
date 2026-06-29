import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Building2, Users, X, ChevronRight, CheckCircle2,
  ShieldCheck, BarChart3, Sparkles, Trophy, Plus, Loader2,
  Mail, ArrowRight,
} from "lucide-react";
import { companyService } from "../services/companyService";
import { authService } from "../services/authService";
import { toast } from "sonner";

interface Plan {
  id: number;
  name: string;
  maxSlots?: number;
}

interface InviteEntry {
  id: number;
  email: string;
  name: string;
}

interface Props {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
}

const FEATURES = [
  { icon: Users,      color: "#6366F1", label: "Quản lý toàn bộ nhân viên & phân quyền" },
  { icon: ShieldCheck, color: "#10B981", label: "Tạo chiến dịch phishing mô phỏng thực chiến" },
  { icon: Sparkles,   color: "#F59E0B", label: "Sinh kịch bản bằng AI (OpenRouter)" },
  { icon: BarChart3,  color: "#8B5CF6", label: "Dashboard phân tích & báo cáo AI chuyên sâu" },
  { icon: Trophy,     color: "#EF4444", label: "Bảng xếp hạng theo nhóm & cá nhân" },
];

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 5 + Math.random() * 7;
  return (
    <motion.div
      className="fixed pointer-events-none z-[200]"
      style={{ left: `${left}%`, top: -20, width: size, height: size, borderRadius: "2px", background: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: window.innerHeight + 50, opacity: [1, 1, 0], rotate: 360 * (Math.random() > 0.5 ? 1 : -1), x: (Math.random() - 0.5) * 160 }}
      transition={{ duration: 2.5 + Math.random() * 1.5, delay, ease: "easeIn" }}
    />
  );
}

const CONFETTI_COLORS = ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#3B82F6"];

export function BusinessOnboardingModal({ open, plan, onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [nameErr, setNameErr] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [invites, setInvites] = useState<InviteEntry[]>([]);
  const [inviteErr, setInviteErr] = useState("");

  const [submitting, setSubmitting] = useState(false);

  if (!open || !plan) return null;

  function addInvite() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteErr("Email không hợp lệ");
      return;
    }
    if (invites.some(i => i.email === email)) {
      setInviteErr("Email này đã được thêm");
      return;
    }
    setInvites(prev => [...prev, { id: Date.now(), email, name: nameInput.trim() || email.split("@")[0] }]);
    setEmailInput("");
    setNameInput("");
    setInviteErr("");
  }

  function removeInvite(id: number) {
    setInvites(prev => prev.filter(i => i.id !== id));
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      if (companyName.trim().length >= 2) {
        await companyService.updateCompanyName(companyName.trim());
      }

      // Refresh JWT để lấy role Manager mới từ DB (sau khi webhook đã chạy)
      await authService.refreshToken();

      // Gửi lời mời (nếu có) — dùng Manager token mới
      const results = await Promise.allSettled(
        invites.map(inv => companyService.inviteEmployee({ email: inv.email, fullName: inv.name }))
      );
      const failed = results.filter(r => r.status === "rejected").length;
      if (failed > 0) {
        toast.warning(`Đã gửi ${invites.length - failed}/${invites.length} lời mời. ${failed} email gặp lỗi.`);
      } else if (invites.length > 0) {
        toast.success(`Đã gửi ${invites.length} lời mời thành công!`);
      }

      navigate("/quan-ly");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { label: "Chào mừng" },
    { label: "Công ty" },
    { label: "Nhân viên" },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}>

      {/* Confetti — only step 0 */}
      {step === 0 && Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle key={i} delay={i * 0.04} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 0 80px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }} />

        {/* Step indicator */}
        <div className="flex items-center justify-between px-8 pt-6 pb-0">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i < step ? "#10B981" : i === step ? "#6366F1" : "rgba(255,255,255,0.15)",
                  }}
                />
              </div>
            ))}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Bỏ qua">
            <X size={16} style={{ color: "#475569" }} />
          </button>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* ── STEP 0: WELCOME ── */}
          {step === 0 && (
            <motion.div key="step0"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="px-8 pt-6 pb-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.3)" }}>
                  <span style={{ fontSize: "2rem" }}>🎉</span>
                </div>
                <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#F1F5F9", lineHeight: 1.3 }}>
                  Chào mừng bạn!
                </h1>
                <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginTop: 8, lineHeight: 1.7 }}>
                  Bạn vừa nâng cấp lên <span style={{ color: "#A5B4FC", fontWeight: 700 }}>{plan.name}</span>.<br />
                  Hãy cùng thiết lập để bắt đầu ngay!
                </p>
              </div>

              <div className="space-y-2.5 mb-8">
                {FEATURES.map(({ icon: Icon, color, label }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#CBD5E1", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
                Thiết lập công ty <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── STEP 1: COMPANY NAME ── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="px-8 pt-6 pb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <Building2 size={22} style={{ color: "#818CF8" }} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F1F5F9" }}>Tên tổ chức</h2>
                  <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>Hiển thị trong email mời nhân viên</p>
                </div>
              </div>

              <div className="mb-6">
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                  Tên công ty
                </label>
                <div className="relative">
                  <Building2 size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: companyName ? "#818CF8" : "#334155" }} />
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); setNameErr(""); }}
                    placeholder="VD: Công ty TNHH ABC Technology"
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: nameErr ? "1.5px solid #EF4444" : companyName ? "1.5px solid rgba(99,102,241,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
                      color: "#E2E8F0",
                      fontFamily: "inherit",
                    }}
                    onKeyDown={e => e.key === "Enter" && handleStepOneNext()}
                  />
                </div>
                {nameErr && <p style={{ fontSize: "0.72rem", color: "#EF4444", marginTop: 6 }}>{nameErr}</p>}
                <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: 6 }}>
                  Bạn có thể thay đổi tên này sau trong Cài đặt.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#64748B" }}>
                  Quay lại
                </button>
                <button onClick={handleStepOneNext}
                  className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
                  Tiếp theo <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: INVITE EMPLOYEES ── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="px-8 pt-6 pb-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Users size={22} style={{ color: "#34D399" }} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F1F5F9" }}>Mời nhân viên</h2>
                  <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>
                    Tối đa {plan.maxSlots ?? "?"} thành viên — có thể bỏ qua và làm sau
                  </p>
                </div>
              </div>

              {/* Add email row */}
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#334155" }} />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => { setEmailInput(e.target.value); setInviteErr(""); }}
                    onKeyDown={e => e.key === "Enter" && addInvite()}
                    placeholder="Email nhân viên"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#E2E8F0", fontFamily: "inherit" }}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addInvite()}
                    placeholder="Họ tên (tuỳ chọn)"
                    className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontFamily: "inherit" }}
                  />
                  <button onClick={addInvite}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all hover:opacity-90"
                    style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#A5B4FC" }}>
                    <Plus size={14} /> Thêm
                  </button>
                </div>
                {inviteErr && <p style={{ fontSize: "0.72rem", color: "#EF4444" }}>{inviteErr}</p>}
              </div>

              {/* Invited chips */}
              {invites.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {invites.map(inv => (
                    <div key={inv.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#6EE7B7" }}>
                      <CheckCircle2 size={11} />
                      <span>{inv.name !== inv.email.split("@")[0] ? `${inv.name} (${inv.email})` : inv.email}</span>
                      <button onClick={() => removeInvite(inv.id)} className="ml-1 hover:opacity-70 transition-opacity">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {invites.length === 0 && (
                <div className="text-center py-4 mb-4 rounded-xl" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <p style={{ fontSize: "0.78rem", color: "#475569" }}>Chưa có nhân viên nào được thêm</p>
                </div>
              )}

              <p style={{ fontSize: "0.72rem", color: "#334155", marginBottom: 16, lineHeight: 1.6 }}>
                Nhân viên sẽ nhận email với link xác nhận. Bạn cũng có thể mời thêm bất kỳ lúc nào từ trang Nhân viên.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#64748B" }}>
                  Quay lại
                </button>
                <button onClick={handleFinish} disabled={submitting}
                  className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", boxShadow: "0 8px 24px rgba(16,185,129,0.35)" }}>
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Đang thiết lập...</>
                    : <><ArrowRight size={15} /> Vào Dashboard Manager</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  function handleStepOneNext() {
    if (companyName.trim().length > 0 && companyName.trim().length < 2) {
      setNameErr("Tên công ty phải có ít nhất 2 ký tự");
      return;
    }
    setStep(2);
  }
}
