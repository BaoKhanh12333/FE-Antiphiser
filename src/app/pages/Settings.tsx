import { useState } from "react";
import {
  User, Mail, Building2, Lock, Eye, EyeOff, Bot, Globe,
  Bell, Shield, CheckCircle2, ChevronDown, Save, Zap, FileText,
  Crown, Sparkles, AlertTriangle, RefreshCw, Infinity, Building,
  MessageSquare, CalendarClock, Flame,
} from "lucide-react";

// ─── Subscription variants ─────────────────────────────────────────────────────

type PlanVariant = "free" | "individual" | "enterprise";

const planVariantLabel: Record<PlanVariant, string> = {
  free: "Free Trial",
  individual: "Individual",
  enterprise: "Enterprise",
};

function SubscriptionBlock({ variant }: { variant: PlanVariant }) {
  const daysLeft = 3;
  const campaignUsed = 1;
  const campaignTotal = 1;
  const indivUsed = 2;
  const indivTotal = 2;

  /* ── FREE ──────────────────────────────────────────── */
  if (variant === "free") {
    const pct = Math.round((campaignUsed / campaignTotal) * 100);
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1a1200 0%, #0B0F19 60%)",
          border: "1.5px solid rgba(245,158,11,0.35)",
          boxShadow: "0 0 0 1px rgba(245,158,11,0.08), 0 8px 40px rgba(245,158,11,0.12)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Top ribbon */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ background: "rgba(245,158,11,0.12)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: "#F59E0B" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#F59E0B", letterSpacing: "0.1em" }}>
              GÓI DỊCH VỤ & THỜI HẠN
            </span>
          </div>
          <span
            className="px-2.5 py-0.5 rounded-full font-extrabold"
            style={{ background: "rgba(245,158,11,0.2)", color: "#FCD34D", fontSize: "0.65rem", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            DÙNG THỬ
          </span>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Plan name */}
          <div className="sm:col-span-1">
            <p style={{ fontSize: "0.68rem", color: "#78716C", fontWeight: 600, letterSpacing: "0.08em" }}>TÊN GÓI</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Crown size={16} style={{ color: "#F59E0B" }} />
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#FDE68A" }}>Free Trial</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#92400E", marginTop: 2 }}>14 ngày dùng thử</p>
          </div>

          {/* Expiry */}
          <div className="sm:col-span-1">
            <p style={{ fontSize: "0.68rem", color: "#78716C", fontWeight: 600, letterSpacing: "0.08em" }}>THỜI HẠN</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <CalendarClock size={14} style={{ color: "#F59E0B" }} />
              <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#E2E8F0" }}>Hết hạn: 24/05/2026</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle size={12} style={{ color: "#EF4444" }} />
              <span style={{ fontSize: "0.72rem", color: "#EF4444", fontWeight: 700 }}>Còn lại {daysLeft} ngày!</span>
            </div>
          </div>

          {/* Campaign quota */}
          <div className="sm:col-span-1">
            <p style={{ fontSize: "0.68rem", color: "#78716C", fontWeight: 600, letterSpacing: "0.08em" }}>HẠN MỨC CHIẾN DỊCH</p>
            <div className="flex items-center justify-between mt-1.5 mb-1.5">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#EF4444" }}>{campaignUsed}/{campaignTotal}</span>
              <span style={{ fontSize: "0.68rem", color: "#6B7280" }}>đã sử dụng</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #EF4444, #F87171)", boxShadow: "0 0 8px rgba(239,68,68,0.5)" }}
              />
            </div>
            <p style={{ fontSize: "0.65rem", color: "#6B7280", marginTop: 3 }}>Đã đạt giới hạn gói Free</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-5">
          <button
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#0B0F19",
              fontSize: "0.92rem",
              boxShadow: "0 0 24px rgba(245,158,11,0.45), 0 4px 16px rgba(0,0,0,0.3)",
              letterSpacing: "0.01em",
            }}
          >
            <Flame size={17} />
            Nâng cấp gói ngay
            <span
              className="px-2 py-0.5 rounded-full text-xs font-extrabold"
              style={{ background: "rgba(0,0,0,0.2)", color: "#FDE68A" }}
            >
              ⚡
            </span>
          </button>
        </div>
      </div>
    );
  }

  /* ── INDIVIDUAL ────────────────────────────────────── */
  if (variant === "individual") {
    const pct = Math.round((indivUsed / indivTotal) * 100);
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Top ribbon */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ background: "rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: "#818CF8" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#818CF8", letterSpacing: "0.1em" }}>
              GÓI DỊCH VỤ & THỜI HẠN
            </span>
          </div>
          <span
            className="px-2.5 py-0.5 rounded-full font-extrabold"
            style={{ background: "rgba(99,102,241,0.2)", color: "#A5B4FC", fontSize: "0.65rem", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            CÁ NHÂN
          </span>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Plan name */}
          <div>
            <p style={{ fontSize: "0.68rem", color: "#475569", fontWeight: 600, letterSpacing: "0.08em" }}>TÊN GÓI</p>
            <div className="flex items-center gap-2 mt-1.5">
              <User size={15} style={{ color: "#818CF8" }} />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#E2E8F0" }}>Gói Cá Nhân</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#6366F1", marginTop: 2, fontWeight: 600 }}>39.000 VNĐ / Tháng</p>
          </div>

          {/* Renewal */}
          <div>
            <p style={{ fontSize: "0.68rem", color: "#475569", fontWeight: 600, letterSpacing: "0.08em" }}>GIA HẠN TIẾP THEO</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <RefreshCw size={13} style={{ color: "#818CF8" }} />
              <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#E2E8F0" }}>21/06/2026</span>
            </div>
            <p style={{ fontSize: "0.68rem", color: "#475569", marginTop: 2 }}>Tự động gia hạn hàng tháng</p>
          </div>

          {/* Quota */}
          <div>
            <p style={{ fontSize: "0.68rem", color: "#475569", fontWeight: 600, letterSpacing: "0.08em" }}>HẠN MỨC THÁNG NÀY</p>
            <div className="flex items-center justify-between mt-1.5 mb-1.5">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F87171" }}>{indivUsed}/{indivTotal}</span>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", fontSize: "0.62rem" }}
              >
                Đã đạt giới hạn
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366F1, #818CF8)" }}
              />
            </div>
            <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: 3 }}>Reset vào 21/06/2026</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-5 flex items-center gap-4">
          <button
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8",
            }}
          >
            Đổi gói dịch vụ
          </button>
          <button
            className="text-sm transition-all hover:opacity-80"
            style={{ color: "#475569", textDecoration: "underline", textDecorationStyle: "dotted", fontSize: "0.78rem" }}
          >
            Hủy gia hạn
          </button>
        </div>
      </div>
    );
  }

  /* ── ENTERPRISE ────────────────────────────────────── */
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #001a0d 0%, #0B0F19 55%)",
        border: "1.5px solid rgba(0,230,118,0.28)",
        boxShadow: "0 0 0 1px rgba(0,230,118,0.06), 0 8px 40px rgba(0,230,118,0.1)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top ribbon */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(0,230,118,0.08)", borderBottom: "1px solid rgba(0,230,118,0.12)" }}
      >
        <div className="flex items-center gap-2">
          <Crown size={13} style={{ color: "#00E676" }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#00E676", letterSpacing: "0.1em" }}>
            GÓI DỊCH VỤ & THỜI HẠN
          </span>
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full font-extrabold"
          style={{ background: "rgba(0,230,118,0.15)", color: "#00E676", fontSize: "0.65rem", border: "1px solid rgba(0,230,118,0.3)" }}
        >
          ENTERPRISE ✦
        </span>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Plan */}
        <div>
          <p style={{ fontSize: "0.68rem", color: "#1F4E2B", fontWeight: 600, letterSpacing: "0.08em" }}>TÊN GÓI</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Crown size={15} style={{ color: "#00E676" }} />
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#D1FAE5" }}>Enterprise Member</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Building size={11} style={{ color: "#34D399" }} />
            <p style={{ fontSize: "0.7rem", color: "#34D399", fontWeight: 600 }}>Tài trợ bởi: FPT Software</p>
          </div>
        </div>

        {/* Duration */}
        <div>
          <p style={{ fontSize: "0.68rem", color: "#1F4E2B", fontWeight: 600, letterSpacing: "0.08em" }}>TRẠNG THÁI</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Infinity size={14} style={{ color: "#00E676" }} />
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#D1FAE5" }}>Vô thời hạn</span>
          </div>
          <p style={{ fontSize: "0.68rem", color: "#1F4E2B", marginTop: 2 }}>Theo hợp đồng doanh nghiệp</p>
        </div>

        {/* Quota */}
        <div>
          <p style={{ fontSize: "0.68rem", color: "#1F4E2B", fontWeight: 600, letterSpacing: "0.08em" }}>HẠN MỨC THỰC CHIẾN</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Infinity size={18} style={{ color: "#00E676" }} />
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#D1FAE5" }}>Không giới hạn</span>
          </div>
          <p style={{ fontSize: "0.68rem", color: "#1F4E2B", marginTop: 2 }}>Chiến dịch & AI Feedback</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-5">
        <button
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
          style={{
            background: "rgba(0,230,118,0.08)",
            border: "1px solid rgba(0,230,118,0.2)",
            color: "#34D399",
            fontSize: "0.82rem",
          }}
        >
          <MessageSquare size={15} />
          Liên hệ quản trị viên IT của công ty
        </button>
      </div>
    </div>
  );
}

// ─── Glass card wrapper ────────────────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Styled input ──────────────────────────────────────────────────────────────

function DarkInput({
  label, icon: Icon, type = "text", defaultValue = "", placeholder = "", suffix,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: "#94A3B8" }}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#475569" }}
        />
        <input
          type={isPassword ? (showPw ? "text" : "password") : type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 40px 10px 38px",
            color: "#E2E8F0",
            fontSize: "0.875rem",
            fontFamily: "'Be Vietnam Pro', sans-serif",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,230,118,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
            onClick={() => setShowPw((v) => !v)}
            style={{ color: "#475569" }}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {!isPassword && suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, title, description, accentColor = "#6366F1",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
      >
        <Icon size={18} style={{ color: accentColor }} />
      </div>
      <div>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#F1F5F9" }}>{title}</h2>
        {description && (
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2, lineHeight: 1.6 }}>{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function Settings() {
  const [feedbackTiming, setFeedbackTiming] = useState<"instant" | "summary">("instant");
  const [bgSimEnabled, setBgSimEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [planVariant, setPlanVariant] = useState<PlanVariant>("free");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        background: "linear-gradient(160deg, #0B0F19 0%, #0D1320 60%, #0A0E18 100%)",
        margin: "-24px",
        padding: "24px",
      }}
    >
      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: "#F1F5F9" }}>
          User Settings
        </h1>
        <p style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>
          Manage your account, AI preferences, and simulation behavior
        </p>
      </div>

      <div className="max-w-3xl space-y-6">

        {/* ── Demo variant switcher (prototype only) ──────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: "0.68rem", color: "#334155", fontWeight: 600, letterSpacing: "0.08em" }}>
            XEM TRẠNG THÁI GÓI:
          </span>
          {(["free", "individual", "enterprise"] as PlanVariant[]).map((v) => (
            <button
              key={v}
              onClick={() => setPlanVariant(v)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                background: planVariant === v ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.05)",
                border: planVariant === v ? "1px solid rgba(0,230,118,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: planVariant === v ? "#00E676" : "#475569",
              }}
            >
              {planVariantLabel[v]}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            SUBSCRIPTION BLOCK
        ══════════════════════════════════════════════════ */}
        <SubscriptionBlock variant={planVariant} />

        {/* ══════════════════════════════════════════════════
            SECTION 1 — Personal Profile
        ══════════════════════════════════════════════════ */}
        <GlassCard>
          <SectionHeader
            icon={User}
            title="Account Information"
            description="Your identity within the AntiPhisher platform"
            accentColor="#6366F1"
          />

          {/* Two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <DarkInput label="FULL NAME" icon={User} defaultValue="Nguyễn Thị Lan" />
            <DarkInput label="EMAIL ADDRESS" icon={Mail} type="email" defaultValue="lan.nguyen@congty.vn" />
            <DarkInput label="DEPARTMENT" icon={Building2} defaultValue="Customer Service" />
            <DarkInput
              label="EMPLOYEE ID"
              icon={Shield}
              defaultValue="EMP-2024-0047"
              suffix={
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34D399", fontSize: "0.65rem" }}
                >
                  Verified
                </span>
              }
            />
          </div>

          {/* Divider */}
          <div
            className="flex items-center gap-3 my-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}
          >
            <Lock size={14} style={{ color: "#475569" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em" }}>
              CHANGE PASSWORD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DarkInput label="CURRENT PASSWORD" icon={Lock} type="password" placeholder="••••••••" />
            <DarkInput label="NEW PASSWORD" icon={Lock} type="password" placeholder="Min. 8 characters" />
            <DarkInput label="CONFIRM NEW PASSWORD" icon={Lock} type="password" placeholder="Repeat new password" />
            <div className="flex items-end">
              <div
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-center cursor-pointer transition-all hover:opacity-90"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#818CF8",
                  fontSize: "0.82rem",
                }}
              >
                Update Password
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — AI Configuration
        ══════════════════════════════════════════════════ */}
        <GlassCard>
          <SectionHeader
            icon={Bot}
            title="AI Diagnostics Preferences"
            description="Configure how OpenAI evaluates your phishing simulation performance."
            accentColor="#8B5CF6"
          />

          {/* Feedback Timing */}
          <div className="mb-6">
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 12 }}>
              AI FEEDBACK TIMING
            </p>
            <div className="space-y-3">
              {[
                {
                  id: "instant" as const,
                  icon: Zap,
                  label: "Instant Analysis",
                  desc: "AI explains phishing indicators immediately after each action",
                  badge: "Recommended",
                  badgeColor: "#00E676",
                },
                {
                  id: "summary" as const,
                  icon: FileText,
                  label: "Summary Report",
                  desc: "AI explains all flaws together after completing the 10-email campaign",
                  badge: null,
                  badgeColor: "",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFeedbackTiming(opt.id)}
                  className="w-full text-left rounded-xl px-4 py-4 flex items-start gap-4 transition-all"
                  style={{
                    background: feedbackTiming === opt.id
                      ? "rgba(0,230,118,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: feedbackTiming === opt.id
                      ? "1.5px solid rgba(0,230,118,0.35)"
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: feedbackTiming === opt.id
                      ? "0 0 0 3px rgba(0,230,118,0.06)"
                      : "none",
                  }}
                >
                  {/* Radio dot */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      border: feedbackTiming === opt.id
                        ? "2px solid #00E676"
                        : "2px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                    }}
                  >
                    {feedbackTiming === opt.id && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#00E676" }} />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: feedbackTiming === opt.id ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <opt.icon
                      size={16}
                      style={{ color: feedbackTiming === opt.id ? "#00E676" : "#475569" }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#E2E8F0" }}>
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-extrabold"
                          style={{ background: "rgba(0,230,118,0.15)", color: "#00E676", fontSize: "0.62rem" }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 2, lineHeight: 1.6 }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language dropdown */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 10 }}>
              AI RESPONSE LANGUAGE
            </p>
            <div className="relative" style={{ maxWidth: 280 }}>
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
              <select
                defaultValue="vi"
                className="w-full appearance-none outline-none cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "10px 36px 10px 38px",
                  color: "#E2E8F0",
                  fontSize: "0.875rem",
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              >
                <option value="vi" style={{ background: "#1E293B" }}>🇻🇳 Tiếng Việt</option>
                <option value="en" style={{ background: "#1E293B" }}>🇺🇸 English</option>
                <option value="zh" style={{ background: "#1E293B" }}>🇨🇳 中文</option>
                <option value="ja" style={{ background: "#1E293B" }}>🇯🇵 日本語</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
            </div>
          </div>
        </GlassCard>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — Simulation & Notifications
        ══════════════════════════════════════════════════ */}
        <GlassCard>
          <SectionHeader
            icon={Bell}
            title="Simulation Preferences"
            description="Control how and when phishing simulations reach your workspace"
            accentColor="#00E676"
          />

          {/* Background simulation toggle */}
          <div
            className="rounded-xl px-5 py-5 flex items-start gap-5"
            style={{
              background: bgSimEnabled ? "rgba(0,230,118,0.05)" : "rgba(255,255,255,0.03)",
              border: bgSimEnabled ? "1px solid rgba(0,230,118,0.2)" : "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.3s ease",
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bgSimEnabled ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.05)" }}
            >
              <Zap size={18} style={{ color: bgSimEnabled ? "#00E676" : "#475569" }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#E2E8F0" }}>
                Enable Background Simulations
              </p>
              <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 3, lineHeight: 1.7 }}>
                Allow the platform to occasionally drop unannounced phishing simulations
                into your workspace inbox to test real-world awareness reflex.
              </p>
              {bgSimEnabled && (
                <div
                  className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.2)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#00E676" }}>ACTIVE — Monitoring enabled</span>
                </div>
              )}
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => setBgSimEnabled((v) => !v)}
              className="shrink-0 relative transition-all duration-300"
              style={{
                width: 52,
                height: 28,
                borderRadius: 14,
                background: bgSimEnabled ? "#00E676" : "rgba(255,255,255,0.1)",
                border: bgSimEnabled ? "none" : "1px solid rgba(255,255,255,0.15)",
                boxShadow: bgSimEnabled ? "0 0 16px rgba(0,230,118,0.4)" : "none",
                cursor: "pointer",
              }}
            >
              <span
                className="absolute top-1 transition-all duration-300"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  left: bgSimEnabled ? 28 : 4,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          {/* Session security footer */}
          <div
            className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Shield size={14} style={{ color: "#00E676", flexShrink: 0 }} />
            <p style={{ fontSize: "0.75rem", color: "#475569" }}>
              <span style={{ color: "#94A3B8", fontWeight: 600 }}>Session Security:</span>{" "}
              Protected by JWT Authentication. Session expires in{" "}
              <span style={{ color: "#00E676", fontWeight: 700 }}>2 hours</span>.
            </p>
          </div>
        </GlassCard>

        {/* ── Save bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p style={{ fontSize: "0.75rem", color: "#334155" }}>
            Changes are applied to your profile immediately upon saving.
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: saved
                ? "rgba(0,230,118,0.2)"
                : "#00E676",
              color: saved ? "#00E676" : "#0B0F19",
              boxShadow: saved
                ? "0 0 0 1px rgba(0,230,118,0.4)"
                : "0 6px 24px rgba(0,230,118,0.35), 0 2px 8px rgba(0,0,0,0.2)",
              border: saved ? "1px solid rgba(0,230,118,0.4)" : "none",
              minWidth: 160,
              justifyContent: "center",
              transition: "all 0.25s ease",
            }}
          >
            {saved ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
