import { useNavigate } from "react-router";
import { useState } from "react";
import {
  PlayCircle, Lock, CheckCircle2, Clock, Award,
  Mail, Target, Zap, ChevronRight, BarChart3,
  X, Sparkles, ArrowRight, Shield,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const campaigns = [
  {
    id: 1,
    tag: "NGÂN HÀNG",
    tagColor: "#6366F1",
    tagBg: "#EEF2FF",
    icon: "🏦",
    title: "Basic Banking Phishing Awareness",
    desc: "Nhận biết email giả mạo tổ chức tài chính — Vietcombank, VietinBank, MBBank với kỹ thuật Urgency & Fake Domain.",
    totalEmails: 10,
    doneEmails: 4,
    difficulty: "Trung bình",
    diffColor: "#F59E0B",
    status: "active",
    assignedBy: "Manager Trần Minh Khoa",
    deadline: "20/03/2026",
  },
  {
    id: 2,
    tag: "NỘI BỘ",
    tagColor: "#10B981",
    tagBg: "#ECFDF5",
    icon: "🏢",
    title: "CEO Fraud & BEC Simulation",
    desc: "Nhận biết email mạo danh CEO/CFO yêu cầu chuyển khoản khẩn cấp — Business Email Compromise phổ biến nhất trong SME.",
    totalEmails: 8,
    doneEmails: 8,
    difficulty: "Cao",
    diffColor: "#EF4444",
    status: "done",
    assignedBy: "Hệ thống AntiPhisher AI",
    deadline: "10/03/2026",
  },
  {
    id: 3,
    tag: "THƯƠNG MẠI",
    tagColor: "#F59E0B",
    tagBg: "#FFFBEB",
    icon: "🛒",
    title: "E-commerce Phishing: Shopee & Lazada",
    desc: "Phân biệt email xác nhận đơn hàng thật/giả từ các sàn TMĐT — đặc biệt là kỹ thuật Lookalike Domain và Clone Site.",
    totalEmails: 12,
    doneEmails: 0,
    difficulty: "Dễ",
    diffColor: "#10B981",
    status: "pending",
    assignedBy: "Manager Trần Minh Khoa",
    deadline: "31/03/2026",
  },
  {
    id: 4,
    tag: "CHÍNH PHỦ",
    tagColor: "#8B5CF6",
    tagBg: "#F5F3FF",
    icon: "🏛️",
    title: "Gov & Tax Authority Impersonation",
    desc: "Nhận diện email giả mạo Tổng cục Thuế, Bộ Công an yêu cầu nộp phạt hoặc cập nhật thông tin cá nhân khẩn cấp.",
    totalEmails: 6,
    doneEmails: 0,
    difficulty: "Cao",
    diffColor: "#EF4444",
    status: "locked",
    assignedBy: "Yêu cầu hoàn thành chiến dịch 3 trước",
    deadline: "—",
  },
];

const totalEmailsAll = campaigns.filter(c => c.status !== "locked").reduce((a, c) => a + c.totalEmails, 0);
const doneEmailsAll = campaigns.reduce((a, c) => a + c.doneEmails, 0);
const overallPct = Math.round((doneEmailsAll / totalEmailsAll) * 100);

// ─── Paywall Modal ─────────────────────────────────────────────────────────────

const paywallPlans = [
  {
    name: "Individual",
    price: "99.000",
    period: "/ tháng",
    color: "#6366F1",
    features: ["2 chiến dịch / tháng", "20 email mô phỏng", "AI Feedback cơ bản", "Báo cáo cá nhân"],
    cta: "Dùng thử 7 ngày",
    highlight: false,
  },
  {
    name: "Pro",
    price: "249.000",
    period: "/ tháng",
    color: "#F59E0B",
    features: ["Không giới hạn chiến dịch", "Toàn bộ thư viện email", "AI Analytics nâng cao", "Xuất báo cáo PDF", "Ưu tiên hỗ trợ"],
    cta: "Nâng cấp ngay",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "",
    color: "#10B981",
    features: ["Toàn bộ tính năng Pro", "Quản lý đội nhóm không giới hạn", "Tùy chỉnh kịch bản", "Tích hợp SSO / LDAP", "SLA 99.9%"],
    cta: "Liên hệ tư vấn",
    highlight: false,
  },
];

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: "0 24px 80px rgba(99,102,241,0.18), 0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-8 py-7 text-center relative"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #3730A3 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(99,102,241,0.3)" }}>
            <Lock size={22} className="text-indigo-200" />
          </div>
          <h2 className="text-white font-extrabold" style={{ fontSize: "1.25rem" }}>
            Bạn đã đạt giới hạn gói Free
          </h2>
          <p className="text-indigo-300 mt-1" style={{ fontSize: "0.82rem" }}>
            Nâng cấp để mở khóa tất cả chiến dịch và tính năng AI nâng cao
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-4 p-6">
          {paywallPlans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-5 flex flex-col relative transition-all"
              style={{
                background: plan.highlight ? "linear-gradient(160deg, #FFFBEB, #FEF3C7)" : "#F8FAFF",
                border: plan.highlight
                  ? "2px solid #F59E0B"
                  : "1.5px solid rgba(99,102,241,0.1)",
                boxShadow: plan.highlight ? "0 8px 24px rgba(245,158,11,0.15)" : "none",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white font-extrabold whitespace-nowrap"
                  style={{ background: "#F59E0B", fontSize: "0.65rem", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }}
                >
                  PHỔ BIẾN NHẤT ⭐
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${plan.color}15` }}>
                  <Shield size={14} style={{ color: plan.color }} />
                </div>
                <span className="font-extrabold" style={{ color: plan.color, fontSize: "0.88rem" }}>{plan.name}</span>
              </div>

              <div className="mb-4">
                <span className="font-extrabold" style={{ fontSize: plan.price === "Liên hệ" ? "1.1rem" : "1.4rem", color: "#0F172A" }}>
                  {plan.price}
                </span>
                {plan.period && <span className="text-slate-400 ml-1" style={{ fontSize: "0.72rem" }}>{plan.period}</span>}
              </div>

              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Sparkles size={11} style={{ color: plan.color, flexShrink: 0, marginTop: 3 }} />
                    <span className="text-slate-600" style={{ fontSize: "0.72rem", lineHeight: 1.6 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  background: plan.highlight ? "#F59E0B" : `${plan.color}15`,
                  color: plan.highlight ? "#fff" : plan.color,
                  boxShadow: plan.highlight ? "0 4px 16px rgba(245,158,11,0.35)" : "none",
                }}
              >
                {plan.cta} <ArrowRight size={13} className="inline ml-1" />
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 text-center">
          <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>
            Không cần thẻ tín dụng · Hủy bất cứ lúc nào · Hỗ trợ 24/7
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Card ─────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onPaywall }: { campaign: typeof campaigns[0]; onPaywall: () => void }) {
  const navigate = useNavigate();
  const { status, totalEmails, doneEmails } = campaign;
  const isDone = status === "done";
  const isActive = status === "active";
  const isPending = status === "pending";
  const isLocked = status === "locked";
  const pct = totalEmails > 0 ? Math.round((doneEmails / totalEmails) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-6 flex gap-5 transition-all duration-300 relative overflow-hidden"
      style={{
        background: isLocked ? "rgba(248,250,252,0.7)" : "#fff",
        border: isActive
          ? "1.5px solid rgba(99,102,241,0.25)"
          : isDone
          ? "1.5px solid rgba(16,185,129,0.2)"
          : "1px solid rgba(99,102,241,0.08)",
        boxShadow: isActive
          ? "0 0 0 4px rgba(99,102,241,0.06), 0 8px 32px rgba(99,102,241,0.08)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div
          className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
          style={{
            background: "#6366F1",
            boxShadow: "0 0 0 4px rgba(99,102,241,0.2)",
          }}
        />
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl relative"
        style={{ background: isDone ? "#ECFDF5" : isActive ? "#EEF2FF" : "#F8FAFC" }}
      >
        {campaign.icon}
        {isDone && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.5)" }}
          >
            <CheckCircle2 size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: campaign.tagBg, color: campaign.tagColor }}
          >
            {campaign.tag}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: `${campaign.diffColor}12`,
              color: campaign.diffColor,
            }}
          >
            {campaign.difficulty}
          </span>
          {isActive && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
            >
              ● Đang thực hành
            </span>
          )}
          {isDone && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#ECFDF5", color: "#059669" }}>
              ✓ Hoàn thành
            </span>
          )}
        </div>

        <h3 className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.4 }}>
          {campaign.title}
        </h3>
        <p className="text-slate-500 mb-3" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
          {campaign.desc}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.75rem" }}>
            <Mail size={12} />
            <strong style={{ color: "#0F172A" }}>{totalEmails}</strong> email thử nghiệm
          </span>
          <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.75rem" }}>
            <Clock size={12} />
            Hạn: <strong style={{ color: "#0F172A" }}>{campaign.deadline}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.75rem" }}>
            <Target size={12} />
            {campaign.assignedBy}
          </span>
        </div>

        {/* Progress bar */}
        {!isLocked && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Đã xử lý</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: isDone ? "#059669" : "#6366F1" }}>
                {doneEmails}/{totalEmails} Email {isDone ? "✓" : ""}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#EEF2FF" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: isDone
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #6366F1, #818CF8)",
                  boxShadow: isDone
                    ? "0 0 6px rgba(16,185,129,0.3)"
                    : "0 0 6px rgba(99,102,241,0.3)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="shrink-0 self-center">
        {isLocked ? (
          <div
            className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl"
            style={{ background: "#F1F5F9" }}
          >
            <Lock size={16} className="text-slate-400" />
            <span className="text-slate-400" style={{ fontSize: "0.7rem", fontWeight: 600 }}>Chưa mở</span>
          </div>
        ) : isDone ? (
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: "#ECFDF5",
              color: "#059669",
              fontWeight: 600,
              fontSize: "0.82rem",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <BarChart3 size={15} />
            Xem kết quả
          </button>
        ) : isPending ? (
            <button
              onClick={onPaywall}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #64748B, #475569)",
                fontWeight: 700,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              <Lock size={16} />
              Mở khóa
            </button>
          ) : (
            <button
              onClick={() => navigate("/nguoi-dung/mo-phong")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                fontWeight: 700,
                fontSize: "0.85rem",
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              <PlayCircle size={16} />
              Vào thực hành ngay
            </button>
          )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function LoTrinh() {
  const activeCampaign = campaigns.find(c => c.status === "active");
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-7" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: "#0F172A" }}>
          Chiến dịch được giao
        </h1>
        <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
          Assigned Campaigns · {campaigns.filter(c => c.status !== "locked").length} chiến dịch đang mở
        </p>
      </div>

      {/* Overall progress banner */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 60%, #3730A3 100%)",
          boxShadow: "0 8px 32px rgba(30,27,75,0.22)",
        }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-indigo-300" />
            <p className="text-indigo-200" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Tiến độ tổng thể</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-white font-bold" style={{ fontSize: "1.1rem" }}>{doneEmailsAll}</p>
              <p className="text-indigo-400" style={{ fontSize: "0.65rem" }}>Email hoàn thành</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-white font-bold" style={{ fontSize: "1.1rem" }}>{totalEmailsAll}</p>
              <p className="text-indigo-400" style={{ fontSize: "0.65rem" }}>Tổng email</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-1">
              <Award size={15} className="text-amber-400" />
              <span className="text-amber-300 font-bold" style={{ fontSize: "1.1rem" }}>{overallPct}%</span>
            </div>
          </div>
        </div>

        <div className="h-3 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${overallPct}%`,
              background: "linear-gradient(90deg, #6366F1, #8B5CF6, #10B981)",
              boxShadow: "0 0 14px rgba(99,102,241,0.5)",
            }}
          />
          {/* Glow tip */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{
              left: `calc(${overallPct}% - 10px)`,
              background: "#10B981",
              boxShadow: "0 0 10px rgba(16,185,129,0.9), 0 0 20px rgba(16,185,129,0.4)",
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-indigo-300" style={{ fontSize: "0.72rem" }}>
            {campaigns.filter(c => c.status === "done").length} chiến dịch hoàn thành
          </span>
          <span className="text-indigo-300" style={{ fontSize: "0.72rem" }}>
            {campaigns.filter(c => c.status === "active" || c.status === "pending").length} đang chờ thực hành
          </span>
        </div>
      </div>

      {/* Active campaign highlight */}
      {activeCampaign && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <p className="text-indigo-700" style={{ fontSize: "0.82rem" }}>
            <strong>Đang thực hành:</strong> {activeCampaign.title} — Tiến độ {activeCampaign.doneEmails}/{activeCampaign.totalEmails} email
          </p>
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} onPaywall={() => setShowPaywall(true)} />
        ))}
      </div>
    </div>
  );
}
