import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Quote,
  Loader2,
} from "lucide-react";

type Role = "user" | "manager" | "admin";

const roles: {
  value: Role;
  label: string;
  emoji: string;
  path: string;
}[] = [
  { value: "user", label: "Nhân viên", emoji: "👤", path: "/nguoi-dung" },
  { value: "manager", label: "Quản lý", emoji: "👔", path: "/quan-ly" },
  { value: "admin", label: "Quản trị", emoji: "⚙️", path: "/quan-tri" },
];

const quotes = [
  {
    text: "Bảo mật không phải là sản phẩm, mà là một quá trình.",
    author: "Bruce Schneier",
    role: "Chuyên gia mật mã học",
  },
  {
    text: "Mắt xích yếu nhất trong chuỗi bảo mật luôn là con người.",
    author: "Kevin Mitnick",
    role: "Cựu hacker huyền thoại",
  },
  {
    text: "Phòng thủ tốt nhất là sự chuẩn bị kỹ lưỡng.",
    author: "AntiPhisher",
    role: "Triết lý đào tạo",
  },
];

/* ── Floating Label Input ─────────────────────────── */
function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  isValid,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  isValid?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;
  const borderColor = isValid
    ? "#10B981"
    : focused
    ? "#6366F1"
    : "rgba(99,102,241,0.18)";
  const labelColor = isValid
    ? "#10B981"
    : focused
    ? "#6366F1"
    : "#94A3B8";

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-5 pt-6 pb-2 outline-none transition-all duration-200 peer"
        style={{
          borderRadius: 16,
          border: `1.5px solid ${borderColor}`,
          background: focused ? "#FAFAFF" : "#F8FAFF",
          fontSize: "0.95rem",
          color: "#1E293B",
          boxShadow: focused
            ? isValid
              ? "0 0 0 3px rgba(16,185,129,0.1)"
              : "0 0 0 3px rgba(99,102,241,0.08)"
            : "none",
        }}
      />
      {/* Floating label */}
      <label
        htmlFor={id}
        className="absolute left-5 transition-all duration-200 pointer-events-none"
        style={{
          top: floated ? 8 : "50%",
          transform: floated ? "none" : "translateY(-50%)",
          fontSize: floated ? "0.7rem" : "0.9rem",
          fontWeight: floated ? 700 : 500,
          color: labelColor,
          letterSpacing: floated ? "0.02em" : "0",
        }}
      >
        {label}
      </label>

      {/* Valid check */}
      {isValid && (
        <CheckCircle2
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
        />
      )}

      {/* Suffix (like eye toggle) */}
      {suffix && !isValid && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

/* ── Segmented Control ────────────────────────────── */
function SegmentedControl({
  selected,
  onChange,
}: {
  selected: Role;
  onChange: (r: Role) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = roles.findIndex((r) => r.value === selected);
    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>(
      "[data-segment]"
    );
    if (buttons[idx]) {
      const btn = buttons[idx];
      setIndicatorStyle({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      });
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="relative flex p-1"
      style={{
        borderRadius: 16,
        background: "#F1F5F9",
        border: "1px solid rgba(99,102,241,0.08)",
      }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          borderRadius: 12,
          background: "#fff",
          boxShadow:
            "0 2px 8px rgba(99,102,241,0.12), 0 1px 2px rgba(0,0,0,0.06)",
        }}
      />

      {roles.map(({ value, label, emoji }) => (
        <button
          key={value}
          data-segment
          onClick={() => onChange(value)}
          className="flex-1 relative z-10 flex items-center justify-center gap-2 py-3 transition-colors duration-200"
          style={{
            borderRadius: 12,
            fontWeight: selected === value ? 700 : 500,
            fontSize: "0.85rem",
            color: selected === value ? "#4F46E5" : "#64748B",
          }}
        >
          <span style={{ fontSize: "1rem" }}>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Quote Rotator ────────────────────────────────── */
function QuoteRotator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, []);
  const q = quotes[idx];

  return (
    <div className="relative">
      <Quote
        size={48}
        className="mb-6"
        style={{ color: "rgba(255,255,255,0.15)" }}
      />
      <blockquote
        key={idx}
        className="transition-opacity duration-700"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)",
          lineHeight: 1.6,
          color: "#fff",
          letterSpacing: "-0.01em",
        }}
      >
        "{q.text}"
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: "#fff",
          }}
        >
          {q.author.charAt(0)}
        </div>
        <div>
          <p className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            {q.author}
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
            {q.role}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {quotes.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setIdx(i)}
            className="transition-all duration-300"
            style={{
              width: i === idx ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background:
                i === idx
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Spinner Overlay ──────────────────────────────── */
function LoginSpinnerOverlay({ role, visible }: { role: Role; visible: boolean }) {
  const roleColors: Record<Role, string> = {
    user: "#10B981",
    manager: "#6366F1",
    admin: "#F59E0B",
  };
  const roleNames: Record<Role, string> = {
    user: "Nhân viên",
    manager: "Quản lý",
    admin: "Quản trị",
  };
  const color = roleColors[role];

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "rgba(11,15,25,0.96)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Outer ring */}
      <div className="relative mb-8">
        <div
          className="w-24 h-24 rounded-full"
          style={{
            border: `2px solid rgba(255,255,255,0.06)`,
            boxShadow: `0 0 40px ${color}22`,
          }}
        />
        {/* Spinning arc */}
        <svg
          className="absolute inset-0 w-24 h-24 animate-spin"
          style={{ animationDuration: "0.9s" }}
          viewBox="0 0 96 96"
        >
          <circle
            cx="48" cy="48" r="44"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="120 160"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center icon */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <Shield size={28} style={{ color }} />
        </div>
      </div>

      <p
        className="text-lg font-bold mb-2"
        style={{ color: "#F1F5F9", fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        Đang xác thực...
      </p>
      <p className="text-sm" style={{ color: "#64748B" }}>
        Đang tải dashboard{" "}
        <span style={{ color, fontWeight: 600 }}>{roleNames[role]}</span>
      </p>

      {/* Progress bar */}
      <div
        className="mt-8 w-48 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 8px ${color}`,
            animation: "progressBar 1.2s ease-in-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          0% { width: 0%; }
          40% { width: 55%; }
          70% { width: 78%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ── MAIN LOGIN PAGE ──────────────────────────────── */
export function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<"idle" | "loading" | "success">("idle");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPassValid = password.length >= 6;
  const loginSuccess = loginState === "success";

  const handleLogin = () => {
    if (!isEmailValid || !isPassValid) return;
    setLoginState("loading");
    // Simulate JWT verification delay
    setTimeout(() => {
      setLoginState("success");
      setTimeout(() => {
        const target =
          roles.find((r) => r.value === selectedRole)?.path ?? "/nguoi-dung";
        navigate(target);
      }, 600);
    }, 1400);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}
    >
      <LoginSpinnerOverlay role={selectedRole} visible={loginState === "loading" || loginState === "success"} />
      {/* ── LEFT PANEL: Quote + Blurred Background ── */}
      <div
        className="hidden lg:flex relative flex-col justify-between overflow-hidden"
        style={{ width: "46%", minHeight: "100vh" }}
      >
        {/* Background image (blurred) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1684488624316-774ea1824d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGFyayUyMG9mZmljZSUyMG1vbml0b3IlMjBnbG93fGVufDF8fHx8MTc3MjczMjI1OHww&ixlib=rb-4.1.0&q=80&w=1080)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px) brightness(0.35)",
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(30,27,75,0.92) 0%, rgba(49,46,129,0.88) 50%, rgba(67,56,202,0.85) 100%)",
          }}
        />

        {/* Mesh accents */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-15%",
            right: "-15%",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(129,140,248,0.2), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "5%",
            left: "-10%",
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 flex items-center justify-center"
              style={{
                borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Shield size={22} className="text-white" />
            </div>
            <span
              className="text-white"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
              }}
            >
              AntiPhisher
            </span>
          </div>

          {/* Quote */}
          <div style={{ maxWidth: 420 }}>
            <QuoteRotator />
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8">
            {[
              { val: "200+", label: "Doanh nghiệp" },
              { val: "10K+", label: "Nhân viên" },
              { val: "98%", label: "Hiệu quả" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p
                  className="text-white"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.3rem",
                  }}
                >
                  {val}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", fontWeight: 500 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div
        className="flex-1 flex items-center justify-center relative px-6 py-12"
        style={{ background: "#FAFAFF" }}
      >
        {/* Subtle mesh */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            right: "10%",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(99,102,241,0.04), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Back button (mobile) */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
          style={{ fontSize: "0.85rem", fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Trang chủ
        </button>

        {/* Form container */}
        <div className="w-full" style={{ maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 flex items-center justify-center"
              style={{
                borderRadius: 14,
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              <Shield size={22} className="text-white" />
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "#1E1B4B",
              }}
            >
              AntiPhisher
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "1.8rem",
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              Chào mừng trở lại!
            </h1>
            <p
              className="mt-2 text-slate-400"
              style={{ fontSize: "0.95rem", lineHeight: 1.7 }}
            >
              Đăng nhập để tiếp tục hành trình bảo mật của bạn
            </p>
          </div>

          {/* Role Segmented Control */}
          <div className="mb-8">
            <label
              className="block text-slate-500 mb-3"
              style={{ fontWeight: 600, fontSize: "0.82rem" }}
            >
              Đăng nhập với tư cách
            </label>
            <SegmentedControl
              selected={selectedRole}
              onChange={setSelectedRole}
            />
          </div>

          {/* Email input */}
          <div className="mb-5">
            <FloatingInput
              id="email"
              label="Email công ty"
              type="email"
              value={email}
              onChange={setEmail}
              isValid={isEmailValid && email.length > 0}
            />
          </div>

          {/* Password input */}
          <div className="mb-3">
            <FloatingInput
              id="password"
              label="Mật khẩu"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={setPassword}
              isValid={isPassValid && password.length > 0}
              suffix={
                <button
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end mb-8">
            <a
              href="#"
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
              style={{ fontSize: "0.82rem", fontWeight: 600 }}
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Login button — 3 states: idle / loading / success */}
          <button
            onClick={handleLogin}
            disabled={!isEmailValid || !isPassValid || loginState !== "idle"}
            className="w-full flex items-center justify-center gap-2 py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed"
            style={{
              borderRadius: 16,
              background:
                loginState === "success"
                  ? "linear-gradient(135deg, #10B981, #34D399)"
                  : loginState === "loading"
                  ? "linear-gradient(135deg, #4338CA, #6366F1)"
                  : !isEmailValid || !isPassValid
                  ? "linear-gradient(135deg, #6366F1, #818CF8)"
                  : "linear-gradient(135deg, #6366F1, #818CF8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              opacity: (!isEmailValid || !isPassValid) && loginState === "idle" ? 0.5 : 1,
              boxShadow:
                loginState === "success"
                  ? "0 8px 32px rgba(16,185,129,0.4)"
                  : loginState === "loading"
                  ? "0 8px 32px rgba(99,102,241,0.5)"
                  : "0 8px 32px rgba(99,102,241,0.35)",
            }}
          >
            {loginState === "success" ? (
              <>
                <CheckCircle2 size={20} /> Đăng nhập thành công!
              </>
            ) : loginState === "loading" ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Đang xác thực...
              </>
            ) : (
              <>
                Đăng nhập <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Validation hints */}
          {(email.length > 0 || password.length > 0) && (
            <div
              className="mt-5 rounded-2xl p-4 space-y-2"
              style={{
                background: "rgba(99,102,241,0.03)",
                border: "1px solid rgba(99,102,241,0.06)",
              }}
            >
              {[
                {
                  ok: isEmailValid,
                  text: "Email hợp lệ",
                },
                {
                  ok: isPassValid,
                  text: "Mật khẩu ít nhất 6 ký tự",
                },
              ].map(({ ok, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300"
                    style={{
                      background: ok ? "#10B981" : "#E2E8F0",
                    }}
                  >
                    {ok && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="transition-colors duration-300"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: ok ? "#10B981" : "#94A3B8",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom link */}
          <p
            className="text-center text-slate-400 mt-8"
            style={{ fontSize: "0.85rem" }}
          >
            Chưa có tài khoản?{" "}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
              style={{ fontWeight: 700 }}
            >
              Liên hệ IT để được cấp phép
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
