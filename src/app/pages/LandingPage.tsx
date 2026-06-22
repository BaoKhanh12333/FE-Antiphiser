import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { authService } from "../services/authService";
import {
  Brain, Zap, Mail, Star, Check, ChevronDown, ChevronRight,
  ArrowRight, Play, TrendingUp, Award, AlertTriangle,
  Eye, Cpu, Globe, CheckCircle, Target,
} from "lucide-react";
import { motion } from "motion/react";
import logoNgang from "../../data/logo ngang.png";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Lợi ích", href: "#benefits" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const STATS = [
  { value: "94%", label: "Độ chính xác AI scoring", icon: Brain, color: "#6366F1" },
  { value: "3.2×", label: "Giảm tỷ lệ click phishing", icon: TrendingUp, color: "#10B981" },
  { value: "<48h", label: "Onboarding toàn tổ chức", icon: Zap, color: "#F59E0B" },
  { value: "ISO 27001", label: "Chuẩn tuân thủ bảo mật", icon: Award, color: "#818CF8" },
];

const AI_FEATURES = [
  {
    icon: Mail,
    color: "#6366F1",
    title: "Mô phỏng Email Phishing",
    desc: "Hàng nghìn kịch bản tấn công phishing thực tế được cập nhật liên tục theo xu hướng mới nhất từ các tổ chức tội phạm mạng toàn cầu.",
    tag: "Simulation Engine",
  },
  {
    icon: Brain,
    color: "#10B981",
    title: "AI Scoring & Phân tích Hành vi",
    desc: "Mô hình AI phân tích từng quyết định của người dùng — từ giây click đến tốc độ phản ứng — để tạo báo cáo rủi ro cá nhân hóa chính xác đến 94%.",
    tag: "Behavioral AI",
  },
  {
    icon: Eye,
    color: "#F59E0B",
    title: "Phát hiện Rủi ro Thời gian thực",
    desc: "Plugin email tích hợp quét và cảnh báo ngay lập tức khi phát hiện dấu hiệu phishing trong hộp thư đến của nhân viên.",
    tag: "Real-time Detection",
  },
  {
    icon: Cpu,
    color: "#818CF8",
    title: "Adaptive Learning Path",
    desc: "Lộ trình huấn luyện tự điều chỉnh theo điểm yếu riêng của từng nhân viên — không phải khóa học cứng nhắc áp dụng đại trà.",
    tag: "Personalized Training",
  },
  {
    icon: Globe,
    color: "#10B981",
    title: "Dashboard Doanh nghiệp",
    desc: "Quản lý toàn bộ tổ chức — từ phòng ban đến cá nhân — với bảng điều khiển trực quan theo chuẩn compliance NIST & ISO 27001.",
    tag: "Enterprise Control",
  },
  {
    icon: Target,
    color: "#6366F1",
    title: "Báo cáo Tuân thủ (Compliance)",
    desc: "Xuất báo cáo kiểm toán bảo mật theo định dạng chuẩn phục vụ ban lãnh đạo, kiểm toán viên và các cơ quan quản lý nhà nước.",
    tag: "Compliance Export",
  },
];

const TESTIMONIALS = [
  {
    quote: "Chỉ sau 3 tháng dùng AntiPhisher, tỷ lệ nhân viên click vào email giả giảm từ 34% xuống còn 8%. Kết quả vượt xa kỳ vọng.",
    name: "Nguyễn Minh Tuấn",
    role: "IT Manager · Công ty TNHH Logistics Vina",
    avatar: "NMT",
    color: "#6366F1",
  },
  {
    quote: "Giao diện đơn giản, nhân viên không rành công nghệ cũng dùng được ngay. AI giải thích rõ tại sao email đó nguy hiểm — rất trực quan.",
    name: "Trần Thị Lan Anh",
    role: "HR Director · Nhà phân phối SME Miền Bắc",
    avatar: "TLA",
    color: "#10B981",
  },
  {
    quote: "Dashboard của Manager cho phép tôi theo dõi từng nhóm nhân viên. Báo cáo compliance tự động xuất ra đúng format kiểm toán — tiết kiệm cả tuần làm việc.",
    name: "Phạm Đức Khoa",
    role: "CISO · Fintech StartupVN",
    avatar: "PDK",
    color: "#F59E0B",
  },
];

interface PlanFeature { text: string; }

interface Plan {
  id: string; tier: string; label: string; price: string; unit: string;
  cycle: string; target: string; badge: string | null; glow: boolean;
  accent: "emerald" | "indigo" | "amber"; cta: string;
  ctaStyle: "outline-emerald" | "outline-indigo" | "solid-amber";
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    id: "free", tier: "FREE", label: "Dùng thử", price: "0", unit: "VND",
    cycle: "/ 14 ngày", target: "Giảm rào cản tiếp cận — không cần thẻ tín dụng",
    badge: null, glow: false, accent: "emerald", cta: "Bắt đầu miễn phí",
    ctaStyle: "outline-emerald",
    features: [
      { text: "1 chiến dịch phishing mẫu" }, { text: "Khóa học nền tảng bảo mật cơ bản" },
      { text: "Báo cáo kết quả cá nhân" }, { text: "Tối đa 5 người dùng" },
    ],
  },
  {
    id: "individual", tier: "INDIVIDUAL", label: "Cá nhân", price: "39.000", unit: "VND",
    cycle: "/tháng", target: "Dành riêng cho 1 cá nhân sử dụng",
    badge: null, glow: false, accent: "indigo", cta: "Chọn gói này",
    ctaStyle: "outline-indigo",
    features: [
      { text: "Chỉ dành cho 1 người dùng" }, { text: "1–2 chiến dịch phishing/tháng" },
      { text: "Cảnh báo rủi ro email thời gian thực" }, { text: "Báo cáo điểm AI cá nhân hóa" },
      { text: "Dashboard theo dõi tiến độ" },
    ],
  },
  {
    id: "basic", tier: "BASIC", label: "Doanh nghiệp nhỏ", price: "79.000", unit: "VND",
    cycle: "/tháng", target: "SME nhạy cảm về chi phí — tối đa 50 nhân viên",
    badge: null, glow: false, accent: "indigo", cta: "Chọn gói này",
    ctaStyle: "outline-indigo",
    features: [
      { text: "1 tài khoản Manager riêng" }, { text: "Tối đa 50 nhân viên" },
      { text: "2–3 chiến dịch phishing/tháng" }, { text: "Dashboard doanh nghiệp tùy chỉnh" },
      { text: "Cảnh báo rủi ro theo nhóm" }, { text: "Xuất báo cáo PDF hàng tháng" },
    ],
  },
  {
    id: "pro", tier: "PRO", label: "Enterprise", price: "99.000", unit: "VND",
    cycle: "/tháng", target: "SME từ 20–150 nhân viên",
    badge: "PHỔ BIẾN NHẤT", glow: true, accent: "amber", cta: "Liên hệ tư vấn ngay",
    ctaStyle: "solid-amber",
    features: [
      { text: "1 tài khoản Manager riêng" }, { text: "Không giới hạn nhân viên" },
      { text: "Chiến dịch phishing không giới hạn" }, { text: "AI scoring & phản hồi cá nhân hóa" },
      { text: "Báo cáo rủi ro nâng cao theo bộ phận" }, { text: "Xuất báo cáo tuân thủ (Compliance)" },
      { text: "Tích hợp SSO & Active Directory" }, { text: "Hỗ trợ ưu tiên 24/7" },
    ],
  },
];

const FAQS = [
  { q: "Tôi có thể hủy gói bất kỳ lúc nào không?", a: "Có. AntiPhisher không ràng buộc hợp đồng dài hạn. Bạn có thể hủy hoặc thay đổi gói vào bất kỳ thời điểm nào — quyền lợi vẫn được giữ nguyên đến hết chu kỳ thanh toán hiện tại." },
  { q: "Tôi có thể nâng cấp từ Free lên gói trả phí như thế nào?", a: "Chỉ cần vào Cài đặt tài khoản → Quản lý gói → Chọn gói mới. Hệ thống sẽ tính toán phần chênh lệch theo ngày và thanh toán qua cổng VNPay hoặc thẻ quốc tế." },
  { q: "Dữ liệu nhân viên của tôi có được bảo mật không?", a: "Toàn bộ dữ liệu được mã hóa AES-256 khi lưu trữ và TLS 1.3 khi truyền tải. Chúng tôi tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân tại Việt Nam và không bán dữ liệu cho bên thứ ba." },
  { q: "Gói PRO có hỗ trợ tích hợp với hệ thống HR/Active Directory không?", a: "Có. Gói PRO hỗ trợ đồng bộ người dùng qua LDAP/Active Directory, SAML 2.0 SSO, và REST API để tích hợp với hệ thống HR hiện có của doanh nghiệp." },
  { q: "Tôi cần bao nhiêu thời gian để onboarding toàn bộ nhân viên?", a: "Với doanh nghiệp dưới 50 người, quá trình setup thường mất dưới 2 giờ. Với tổ chức lớn hơn, đội ngũ Customer Success của chúng tôi sẽ hỗ trợ onboarding toàn bộ trong vòng 48 giờ." },
  { q: "Báo cáo compliance xuất ra theo định dạng nào?", a: "Hỗ trợ xuất PDF có chữ ký số, Excel, và JSON cho các hệ thống SIEM. Báo cáo được cấu trúc theo chuẩn NIST CSF, ISO 27001 Annex A, và PCI DSS có thể tùy chỉnh theo yêu cầu kiểm toán." },
];

// ─── Accent helpers ────────────────────────────────────────────────────────────

const accentMap = {
  emerald: { tierText: "text-emerald-400" },
  indigo:  { tierText: "text-indigo-400" },
  amber:   { tierText: "text-amber-400" },
};

// ─── ScrollReveal — dùng cho các section bên dưới fold ───────────────────────

function ScrollReveal({
  children, delay = 0, className = "", y = 28,
}: {
  children: React.ReactNode; delay?: number; className?: string; y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Browser Mockup ───────────────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <motion.div
      className="relative z-10 mt-16 max-w-4xl w-full mx-auto px-4"
      initial={{ opacity: 0, y: 56, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow beneath */}
      <div
        className="pointer-events-none absolute rounded-3xl blur-3xl opacity-30"
        style={{ inset: "10% 5%", background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(16,185,129,0.3))", transform: "translateY(10%)" }}
      />

      {/* Browser frame */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 36px 90px rgba(0,0,0,0.15), 0 0 0 1px rgba(99,102,241,0.14)", border: "1px solid rgba(255,255,255,0.9)" }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: "linear-gradient(180deg,#F3F4F6 0%,#EAECEF 100%)", borderBottom: "1px solid #D1D5DB" }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
          </div>
          {/* Active tab */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium shrink-0"
            style={{ background: "#fff", borderRadius: "6px 6px 0 0", color: "#374151", boxShadow: "0 -1px 4px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(0,0,0,0.07)", marginBottom: "-1px", minWidth: 160 }}
          >
            🛡️ AntiPhisher — Tổng quan
          </div>
          {/* Address bar */}
          <div
            className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]"
            style={{ background: "#fff", border: "1px solid #E5E7EB", maxWidth: 320, color: "#6B7280" }}
          >
            <span style={{ color: "#34D399", fontSize: 10 }}>🔒</span>
            <span style={{ color: "#374151", fontWeight: 500 }}>localhost</span>
            <span>:5173/nguoi-dung</span>
          </div>
          {/* Icons + avatar */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-gray-400 text-sm select-none">⊞</span>
            <span className="text-gray-400 text-sm select-none">⋮</span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", fontSize: 10 }}
            >K</div>
          </div>
        </div>

        {/* App content */}
        <div className="flex" style={{ height: 360, background: "#F0F2FF" }}>
          {/* Sidebar */}
          <div className="flex flex-col w-48 shrink-0" style={{ background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#3730a3 100%)" }}>
            <div className="px-4 py-3 border-b border-white/10">
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 11, fontFamily: "'Be Vietnam Pro',sans-serif", letterSpacing: "-0.01em" }}>
                Anti<span style={{ color: "#67e8f9" }}>Phisher</span>
              </div>
              <div style={{ color: "rgba(165,180,252,0.7)", fontSize: 8, letterSpacing: "0.14em", fontWeight: 700 }}>AI PHISHING PROTECTION</div>
            </div>
            <div className="mx-3 mt-3 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", fontSize: 9 }}>NB</div>
                <div>
                  <div style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>Bảo Khánh</div>
                  <div style={{ color: "rgba(165,180,252,0.8)", fontSize: 8 }}>Nhân viên</div>
                </div>
              </div>
            </div>
            <nav className="px-2.5 py-3 flex flex-col gap-0.5">
              {[
                { label: "Tổng quan", active: true },
                { label: "Bài học", active: false },
                { label: "Mô phỏng", active: false },
                { label: "Báo cáo AI", active: false, soon: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: item.active ? "linear-gradient(135deg,#6366F1,#818CF8)" : "transparent",
                    color: item.active ? "#fff" : "rgba(165,180,252,0.75)",
                    fontSize: 10, fontWeight: item.active ? 600 : 400, opacity: item.soon ? 0.5 : 1,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.active ? "#fff" : "rgba(165,180,252,0.4)" }} />
                  {item.label}
                  {item.soon && <span className="ml-auto text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)" }}>Soon</span>}
                </div>
              ))}
            </nav>
          </div>

          {/* Main dashboard */}
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
            {/* Topbar */}
            <div className="flex items-center justify-between shrink-0">
              <div>
                <div style={{ color: "#0F172A", fontSize: 12, fontWeight: 700 }}>Chào buổi sáng, Bảo Khánh 👋</div>
                <div style={{ color: "#94A3B8", fontSize: 10 }}>2 bài học mới đang chờ bạn</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 10, color: "#F59E0B", fontWeight: 700 }}>
                  🔥 7 ngày
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", fontSize: 9 }}>NB</div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              {[
                { label: "Điểm bảo mật", value: "82", unit: "/100", color: "#6366F1" },
                { label: "Bài hoàn thành", value: "12", unit: " bài", color: "#10B981" },
                { label: "Tỷ lệ phát hiện", value: "94%", unit: "", color: "#F59E0B" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ color: "#94A3B8", fontSize: 9, marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: 20, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {stat.value}<span style={{ color: "#CBD5E1", fontSize: 10, fontWeight: 400 }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress + Activity */}
            <div className="grid grid-cols-5 gap-2.5 flex-1 min-h-0">
              <div className="col-span-3 p-3 rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ color: "#374151", fontSize: 10, fontWeight: 600, marginBottom: 8 }}>Tiến trình học tập</div>
                {[
                  { label: "Module 1: Nền tảng phishing", pct: 100, color: "#10B981" },
                  { label: "Module 2: Email giả mạo", pct: 75, color: "#6366F1" },
                  { label: "Module 3: URL nguy hiểm", pct: 30, color: "#818CF8" },
                ].map((mod) => (
                  <div key={mod.label} className="mb-2.5">
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: "#64748B", fontSize: 9 }}>{mod.label}</span>
                      <span style={{ color: mod.color, fontSize: 9, fontWeight: 600 }}>{mod.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${mod.pct}%`, background: `linear-gradient(90deg,${mod.color},${mod.color}99)` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-2 p-3 rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ color: "#374151", fontSize: 10, fontWeight: 600, marginBottom: 8 }}>Hoạt động gần đây</div>
                {[
                  { label: "Phishing Test L3", status: "Vượt qua", color: "#10B981", time: "2h trước" },
                  { label: "Module 2 hoàn thành", status: "✓", color: "#6366F1", time: "Hôm qua" },
                  { label: "Cảnh báo: URL giả", status: "Chặn", color: "#F59E0B", time: "3 ngày" },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: "#F8FAFF" }}>
                    <div>
                      <div style={{ color: "#374151", fontSize: 9, fontWeight: 500 }}>{act.label}</div>
                      <div style={{ color: "#94A3B8", fontSize: 8 }}>{act.time}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: `${act.color}18`, color: act.color, fontSize: 8, fontWeight: 700 }}>{act.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ onLogin, isAuth }: { onLogin: () => void; isAuth?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span
          className="font-black text-xl select-none"
          style={{ color: "#1e1b4b", letterSpacing: "-0.03em", fontFamily: "'Be Vietnam Pro', sans-serif" }}
        >
          Anti<span style={{ color: "#6366F1" }}>Phisher</span>
        </span>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium transition-colors duration-200 hover:text-slate-200" style={{ color: "#64748B" }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuth ? (
            <button onClick={onLogin} className="text-sm font-bold px-5 py-2 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", boxShadow: "0 0 18px rgba(99,102,241,0.4)" }}>
              Vào ứng dụng →
            </button>
          ) : (
            <>
              <button onClick={onLogin} className="hidden md:block text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{ color: "#64748B", border: "1px solid rgba(99,102,241,0.18)" }}>
                Đăng nhập
              </button>
              <button onClick={onLogin} className="text-sm font-bold px-5 py-2 rounded-lg transition-all duration-200 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", boxShadow: "0 0 18px rgba(99,102,241,0.4)" }}>
                Dùng thử miễn phí
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden"
      style={{ background: "#F8FAFF" }}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Badge */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34D399" }}>
          <CheckCircle size={11} />
          Nền tảng huấn luyện bảo mật #1 cho SME Việt Nam
        </span>
      </motion.div>

      {/* H1 */}
      <motion.h1
        className="relative z-10 text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl leading-[1.05]"
        style={{ color: "#0F172A", letterSpacing: "-0.03em", fontFamily: "'Be Vietnam Pro', sans-serif" }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.28 }}
      >
        Biến Nhân Viên Thành{" "}
        <span className="block" style={{ background: "linear-gradient(135deg, #6366F1 0%, #10B981 60%, #34D399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Bức Tường Bảo Mật
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
        style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42 }}
      >
        AntiPhisher huấn luyện nhân viên nhận diện email phishing bằng AI — thay thế
        toàn bộ quy trình đào tạo thủ công với chi phí thấp hơn{" "}
        <span style={{ color: "#0F172A", fontWeight: 600 }}>80%</span>.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mb-16"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.56 }}
      >
        <button onClick={onLogin}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", boxShadow: "0 0 30px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
          Dùng thử miễn phí 14 ngày <ArrowRight size={18} />
        </button>
        <button
          className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.18)", color: "#334155" }}>
          <Play size={15} fill="currentColor" /> Xem Demo 2 phút
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.78 + i * 0.08 }}
              whileHover={{ y: -3, boxShadow: `0 8px 20px ${stat.color}25` }}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl cursor-default"
              style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}
            >
              <Icon size={16} style={{ color: stat.color }} />
              <span className="text-2xl font-extrabold" style={{ color: stat.color, letterSpacing: "-0.02em" }}>{stat.value}</span>
              <span className="text-[11px] text-center leading-snug" style={{ color: "#94A3B8" }}>{stat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>

      <BrowserMockup />
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: "#F8FAFF" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#6366F1" }}>AI Core</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ color: "#0F172A", letterSpacing: "-0.025em", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Sức mạnh{" "}
            <span style={{ background: "linear-gradient(90deg, #6366F1, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI-native
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
            Không phải khóa học tĩnh. AntiPhisher là hệ thống thích ứng sinh học — học từ
            hành vi thực tế của từng nhân viên để liên tục cải thiện phòng thủ.
          </p>
        </ScrollReveal>

        {/* Feature cards — motion wrapper for scroll reveal, inner div for hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: "easeOut" }}
              >
                <div
                  className="p-7 rounded-2xl transition-all duration-300 cursor-default h-full"
                  style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.12)", backdropFilter: "blur(12px)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = `1px solid ${feat.color}40`;
                    el.style.boxShadow = `0 0 32px ${feat.color}18`;
                    el.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = "1px solid rgba(99,102,241,0.12)";
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                    <Icon size={20} style={{ color: feat.color }} />
                  </div>
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase mb-2 px-2 py-0.5 rounded"
                    style={{ background: `${feat.color}12`, color: feat.color }}>
                    {feat.tag}
                  </span>
                  <h3 className="text-base font-bold mb-2 mt-1"
                    style={{ color: "#1E293B", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section id="benefits" className="py-28 px-6 relative overflow-hidden" style={{ background: "#F0F4FF" }}>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#10B981" }}>Social Proof</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ color: "#0F172A", letterSpacing: "-0.025em", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Kết quả thực tế từ{" "}
            <span style={{ color: "#10B981" }}>khách hàng</span>
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "#94A3B8" }}>
            Hơn 480 doanh nghiệp SME Việt Nam đã chọn AntiPhisher để bảo vệ tổ chức của họ.
          </p>
        </ScrollReveal>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(99,102,241,0.1)" }}
              className="p-7 rounded-2xl flex flex-col cursor-default"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(99,102,241,0.12)" }}
            >
              <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "#64748B" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}30` }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk warning block */}
        <ScrollReveal y={20}>
          <div className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(255,252,240,0.95) 100%)", border: "1px solid rgba(245,158,11,0.18)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <AlertTriangle size={28} style={{ color: "#F59E0B" }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2" style={{ color: "#92400E", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                91% các vụ tấn công mạng bắt đầu từ email phishing
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#92400E" }}>
                Nhân viên là điểm yếu lớn nhất — và cũng là lá chắn mạnh nhất nếu được huấn luyện đúng cách.
                Một click sai có thể khiến doanh nghiệp tổn thất hàng trăm triệu đồng.
              </p>
            </div>
            <button onClick={onLogin}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap hover:bg-amber-500/20 hover:scale-[1.02]"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#F59E0B" }}>
              Đánh giá rủi ro miễn phí <ChevronRight size={16} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PricingSection({ onPlanClick }: { onPlanClick: (planId: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-28 px-6 relative" style={{ background: "#F8FAFF" }}>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent 70%)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.35em] uppercase mb-3" style={{ color: "#6366F1" }}>Chiến lược định giá</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            PRICING{" "}
            <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              STRATEGY
            </span>
          </h2>
          <p className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "#94A3B8" }}>Tiered PaaS Model</p>
          <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
            Từ cá nhân đến doanh nghiệp — AntiPhisher cung cấp mức bảo vệ phù hợp
            với quy mô và ngân sách của tổ chức bạn.
          </p>
        </ScrollReveal>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => {
            const accent = accentMap[plan.accent];
            const isHovered = hovered === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <div
                  onMouseEnter={() => setHovered(plan.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative flex flex-col rounded-2xl transition-all duration-300 h-full"
                  style={{
                    background: plan.glow ? "linear-gradient(145deg, #ffffff, #fafbff)" : "linear-gradient(145deg, #ffffff, #f8faff)",
                    backdropFilter: "blur(20px)",
                    border: plan.glow
                      ? `1.5px solid rgba(245,158,11,${isHovered ? "0.7" : "0.4"})`
                      : `1px solid rgba(99,102,241,${isHovered ? "0.18" : "0.12"})`,
                    boxShadow: plan.glow
                      ? `0 0 ${isHovered ? "52px" : "28px"} rgba(245,158,11,${isHovered ? "0.22" : "0.14"}), 0 2px 8px rgba(245,158,11,0.08)`
                      : isHovered ? "0 0 32px rgba(99,102,241,0.1), 0 1px 4px rgba(99,102,241,0.06)" : "0 1px 4px rgba(99,102,241,0.06)",
                    transform: isHovered ? "translateY(-5px)" : "translateY(0)",
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0B0F19", boxShadow: "0 0 18px rgba(245,158,11,0.65)" }}>
                        <Star size={10} fill="currentColor" /> {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-7 pt-8">
                    <div className="mb-5">
                      <p className={`text-[11px] font-bold tracking-[0.28em] uppercase mb-1 ${accent.tierText}`}>{plan.tier}</p>
                      <p className="text-lg font-bold" style={{ color: "#1E293B" }}>{plan.label}</p>
                    </div>
                    <div className="mb-1 flex items-end gap-1">
                      <span className="text-3xl font-extrabold leading-none" style={{ color: "#0F172A", letterSpacing: "-0.03em" }}>{plan.price}</span>
                      <span className="text-sm font-semibold mb-0.5" style={{ color: "#64748B" }}>{plan.unit}</span>
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{plan.cycle}</p>
                    <div className="my-5 h-px w-full"
                      style={{ background: plan.glow ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)" : "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)" }} />
                    <p className="text-xs leading-relaxed mb-5 italic" style={{ color: "#94A3B8" }}>{plan.target}</p>
                    <ul className="flex flex-col gap-3 flex-1 mb-7">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm" style={{ color: "#64748B" }}>
                          <span className={`mt-0.5 shrink-0 ${accent.tierText}`}><Check size={13} strokeWidth={2.5} /></span>
                          <span className="leading-snug">{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => onPlanClick(plan.id)}
                      className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                      style={
                        plan.ctaStyle === "solid-amber"
                          ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0B0F19", boxShadow: "0 0 22px rgba(245,158,11,0.4)", border: "none" }
                          : plan.ctaStyle === "outline-emerald"
                          ? { background: "transparent", color: "#10B981", border: "1.5px solid rgba(16,185,129,0.45)" }
                          : { background: "transparent", color: "#818CF8", border: "1.5px solid rgba(99,102,241,0.35)" }
                      }>
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-xs" style={{ color: "#CBD5E1" }}>
          SSL bảo mật · Không ràng buộc hợp đồng · Nâng cấp / hủy bất kỳ lúc nào · Hỗ trợ VNPay & thẻ quốc tế
        </p>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-28 px-6 relative" style={{ background: "#F0F4FF" }}>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)" }} />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#10B981" }}>FAQ</p>
          <h2 className="text-4xl font-extrabold mb-4"
            style={{ color: "#0F172A", letterSpacing: "-0.025em", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Câu hỏi thường gặp
          </h2>
          <p className="text-base" style={{ color: "#94A3B8" }}>Mọi thứ bạn cần biết về chính sách, bảo mật và tích hợp.</p>
        </ScrollReveal>

        {/* FAQ items */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: isOpen ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.12)",
                  boxShadow: isOpen ? "0 0 24px rgba(99,102,241,0.08)" : "none",
                }}
              >
                <button className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenIdx(isOpen ? null : i)}>
                  <span className="text-sm font-semibold pr-4" style={{ color: isOpen ? "#A5B4FC" : "#334155" }}>
                    {faq.q}
                  </span>
                  <ChevronDown size={18}
                    style={{ color: "#6366F1", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", flexShrink: 0 }} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="w-full h-px mb-4" style={{ background: "rgba(99,102,241,0.15)" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{faq.a}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer({ onLogin }: { onLogin: () => void }) {
  return (
    <footer className="py-12 px-6 relative" style={{ background: "#EEF2FF", borderTop: "1px solid rgba(99,102,241,0.08)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <img src={logoNgang} alt="AntiPhisher" style={{ height: 30 }} />
        <p className="text-xs text-center" style={{ color: "#94A3B8" }}>
          © 2025 AntiPhisher. Bảo lưu mọi quyền. · Chính sách bảo mật · Điều khoản dịch vụ
        </p>
        <button onClick={onLogin}
          className="text-sm font-bold px-5 py-2.5 rounded-lg transition-all duration-200 active:scale-95 hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}>
          Bắt đầu ngay →
        </button>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const isAuth   = authService.isAuthenticated();
  const appPath  = (() => {
    const role = authService.getCurrentRole()?.toLowerCase() || "";
    if (role === "manager") return "/quan-ly";
    if (role === "admin")   return "/quan-tri";
    return "/nguoi-dung";
  })();

  const handleCTA = () => navigate(isAuth ? appPath : "/dang-nhap");
  const handlePlanClick = (planId: string) => {
    if (planId === "free") navigate(isAuth ? appPath : "/dang-nhap");
    else navigate(isAuth ? "/nguoi-dung/mua-goi" : "/dang-nhap");
  };

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', Inter, sans-serif", background: "#F8FAFF" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F8FAFF; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
      <Navbar onLogin={handleCTA} isAuth={isAuth} />
      <HeroSection onLogin={handleCTA} />
      <FeaturesSection />
      <BenefitsSection onLogin={handleCTA} />
      <PricingSection onPlanClick={handlePlanClick} />
      <FAQSection />
      <Footer onLogin={handleCTA} />
    </div>
  );
}
