import { useState } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Mail, Star, Paperclip, Inbox, Archive, Trash2, Bot,
  Shield, ChevronRight, ArrowRight, Sparkles, ExternalLink,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const phishingEmails = [
  {
    id: 1,
    from: "no-reply@vcb-secure.info",
    fromName: "Vietcombank",
    fromAvatar: "VB",
    avatarColor: "#EF4444",
    subject: "🚨 Tài khoản bị đình chỉ – Xác nhận ngay!",
    time: "08:42",
    bodyParts: [
      { type: "text", content: "Kính gửi Quý khách,\n\nTài khoản của bạn đã bị hạn chế do vi phạm điều khoản sử dụng. Hệ thống ghi nhận 3 lần đăng nhập bất thường từ thiết bị lạ.\n\nVui lòng cung cấp thông tin xác thực trong " },
      { type: "highlight", content: "24 giờ", style: "urgency" },
      { type: "text", content: " để mở khóa tài khoản. Quá thời hạn, tài khoản sẽ bị vô hiệu hóa vĩnh viễn.\n\n" },
      { type: "link", content: "→ Xác minh tài khoản ngay", fakeUrl: "http://vcb-secure-info.xyz/login?ref=urgent" },
    ],
    isPhishing: true,
    hasAttachment: false,
    starred: false,
    aiVerdict: {
      correct: {
        headline: "Chính xác! Bạn đã phát hiện email phishing.",
        summary: "Email này giả mạo Vietcombank thông qua địa chỉ người gửi lừa đảo và áp dụng kỹ thuật thúc ép thời gian để thao túng tâm lý nạn nhân.",
        clues: [
          { flag: "🚩", label: "Fake Domain", text: "vcb-secure.info ≠ vietcombank.com.vn — tên miền giả mạo điển hình" },
          { flag: "🚩", label: "Urgency Tactic", text: '"24 giờ", "vô hiệu hóa vĩnh viễn" — tạo áp lực thời gian để làm mờ tư duy' },
          { flag: "🚩", label: "Fake Link", text: "URL ẩn dẫn đến vcb-secure-info.xyz không phải vietcombank.com.vn" },
          { flag: "🚩", label: "Data Harvesting", text: "Yêu cầu cung cấp thông tin xác thực qua email — ngân hàng không bao giờ làm vậy" },
        ],
        points: "+15",
        pointColor: "#10B981",
      },
      wrong: {
        headline: "Chưa đúng! Đây là email phishing.",
        summary: "Email này đã đánh lừa bạn. Hãy để AI phân tích lý do để bạn không mắc bẫy lần sau.",
        clues: [
          { flag: "🚩", label: "Fake Domain", text: "vcb-secure.info ≠ vietcombank.com.vn — tên miền giả mạo điển hình" },
          { flag: "🚩", label: "Urgency Tactic", text: '"24 giờ", "vô hiệu hóa vĩnh viễn" — tạo áp lực thời gian để làm mờ tư duy' },
          { flag: "🚩", label: "Fake Link", text: "URL ẩn dẫn đến vcb-secure-info.xyz không phải vietcombank.com.vn" },
        ],
        points: "-5",
        pointColor: "#EF4444",
      },
    },
  },
  {
    id: 2,
    from: "hr@congty.vn",
    fromName: "Phòng Nhân sự",
    fromAvatar: "NS",
    avatarColor: "#10B981",
    subject: "Lịch họp toàn công ty tháng 3/2026",
    time: "09:15",
    bodyParts: [
      { type: "text", content: "Kính gửi toàn thể nhân viên,\n\nPhòng Nhân sự thông báo lịch họp Quý I/2026 sẽ được tổ chức vào ngày " },
      { type: "highlight", content: "15/3/2026", style: "safe" },
      { type: "text", content: ", tại hội trường tầng 5, lúc 14:00.\n\nChương trình:\n• Tổng kết Q1/2026\n• Kế hoạch Q2/2026\n• Chương trình đào tạo mới\n\nXin phép xác nhận tham dự qua " },
      { type: "link", content: "hệ thống nội bộ", fakeUrl: "https://intranet.congty.vn/confirm" },
      { type: "text", content: " trước ngày 12/3.\n\nTrân trọng,\nPhòng Nhân sự" },
    ],
    isPhishing: false,
    hasAttachment: false,
    starred: true,
    aiVerdict: {
      correct: {
        headline: "Chính xác! Đây là email hợp lệ.",
        summary: "Email này đến từ domain nội bộ congty.vn, nội dung chuyên nghiệp, không yêu cầu thông tin nhạy cảm và link dẫn về intranet chính thức.",
        clues: [
          { flag: "✅", label: "Legit Domain", text: "@congty.vn — domain chính thức của công ty, không phải tên miền lạ" },
          { flag: "✅", label: "No Sensitive Request", text: "Không yêu cầu mật khẩu, thông tin tài chính hay CCCD" },
          { flag: "✅", label: "Internal Link", text: "Link dẫn đến intranet.congty.vn — hệ thống nội bộ tin cậy" },
        ],
        points: "+10",
        pointColor: "#10B981",
      },
      wrong: {
        headline: "Chưa đúng! Đây là email hợp lệ.",
        summary: "Bạn đã báo nhầm email an toàn. Email từ @congty.vn là domain chính thức, nội dung rõ ràng và không có dấu hiệu lừa đảo.",
        clues: [
          { flag: "✅", label: "Legit Domain", text: "@congty.vn — domain chính thức của công ty" },
          { flag: "✅", label: "Professional Content", text: "Nội dung rõ ràng, đúng ngữ cảnh, không tạo áp lực hay yêu cầu click link lạ" },
        ],
        points: "-3",
        pointColor: "#EF4444",
      },
    },
  },
  {
    id: 3,
    from: "prize@vietlott-lucky.xyz",
    fromName: "Vietlott Chính thức",
    fromAvatar: "VL",
    avatarColor: "#F59E0B",
    subject: "🎉 Chúc mừng! Bạn đã trúng 500 triệu đồng!",
    time: "Hôm qua",
    bodyParts: [
      { type: "text", content: "Xin chúc mừng!\n\nSố điện thoại của bạn đã được hệ thống chọn ngẫu nhiên để nhận giải thưởng đặc biệt trị giá " },
      { type: "highlight", content: "500.000.000 VNĐ", style: "urgency" },
      { type: "text", content: "!\n\nĐể nhận tiền thưởng, vui lòng:\n1. Nhấp vào link bên dưới\n2. Cung cấp thông tin CCCD và số tài khoản ngân hàng\n3. Thanh toán phí xử lý 500.000đ\n\n" },
      { type: "link", content: "→ Nhận thưởng ngay tại đây", fakeUrl: "http://vietlott-win.xyz/claim?prize=500M" },
      { type: "text", content: "\n\n⚠️ Giải thưởng chỉ có hiệu lực trong 48 giờ!" },
    ],
    isPhishing: true,
    hasAttachment: true,
    starred: false,
    aiVerdict: {
      correct: {
        headline: "Chính xác! Đây là email lừa đảo trắng trợn.",
        summary: "Kỹ thuật lòng tham (Greed Bait) kết hợp Urgency — phần thưởng quá hấp dẫn, yêu cầu CCCD và phí xử lý là dấu hiệu lừa đảo điển hình.",
        clues: [
          { flag: "🚩", label: "Fake Domain", text: "vietlott-lucky.xyz — Vietlott chính thức chỉ dùng vietlott.vn" },
          { flag: "🚩", label: "Greed Bait", text: "500 triệu — phần thưởng quá tốt để là thật, không có cơ sở thực tế" },
          { flag: "🚩", label: "Data + Fee Harvesting", text: "Yêu cầu CCCD, tài khoản ngân hàng VÀ phí xử lý — combo lừa đảo 3 lớp" },
          { flag: "🚩", label: "Urgency", text: '"48 giờ" — tạo áp lực thời gian để nạn nhân không kịp suy nghĩ' },
        ],
        points: "+15",
        pointColor: "#10B981",
      },
      wrong: {
        headline: "Chưa đúng! Email này là phishing nghiêm trọng.",
        summary: "Đây là kỹ thuật Greed Bait + Urgency — phần thưởng 500 triệu là mồi nhử để lấy CCCD, tài khoản ngân hàng và tiền phí.",
        clues: [
          { flag: "🚩", label: "Fake Domain", text: "vietlott-lucky.xyz — Vietlott chính thức chỉ dùng vietlott.vn" },
          { flag: "🚩", label: "Greed Bait + Fee", text: "Yêu cầu phí xử lý 500.000đ để nhận thưởng — đây là chiêu lừa đảo cổ điển" },
        ],
        points: "-5",
        pointColor: "#EF4444",
      },
    },
  },
];

// ─── Email Body Renderer ───────────────────────────────────────────────────────

function EmailBodyRenderer({
  parts,
  isPhishing,
  answered,
  isCorrect,
}: {
  parts: typeof phishingEmails[0]["bodyParts"];
  isPhishing: boolean;
  answered: boolean | null;
  isCorrect: boolean | null;
}) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const wrongOnPhishing = answered !== null && isCorrect === false && isPhishing;

  return (
    <div className="relative" style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.85, fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part.content}</span>;
        }

        if (part.type === "highlight") {
          const isUrgency = part.style === "urgency";
          const blaze = wrongOnPhishing && isUrgency;
          return (
            <span
              key={i}
              className="font-bold px-1 rounded"
              style={{
                background: blaze ? "#DC2626" : isUrgency ? "#FEF2F2" : "#ECFDF5",
                color: blaze ? "#fff" : isUrgency ? "#DC2626" : "#059669",
                boxShadow: blaze ? "0 0 0 2px rgba(220,38,38,0.35)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {part.content}
            </span>
          );
        }

        if (part.type === "link") {
          const isReal = !isPhishing;
          const blazeLink = wrongOnPhishing;
          return (
            <span key={i} className="relative inline-block">
              <span
                className="cursor-pointer font-semibold underline"
                style={{
                  color: blazeLink ? "#DC2626" : isReal ? "#6366F1" : "#2563EB",
                  background: blazeLink ? "#FEF2F2" : "transparent",
                  borderRadius: 4,
                  padding: blazeLink ? "0 4px" : undefined,
                  boxShadow: blazeLink ? "0 0 0 2px rgba(220,38,38,0.25)" : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={() => setHoveredLink(part.fakeUrl ?? null)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {part.content}
              </span>

              {/* Tooltip on hover */}
              {hoveredLink === part.fakeUrl && (
                <span
                  className="absolute left-0 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap"
                  style={{
                    bottom: "calc(100% + 6px)",
                    background: isPhishing ? "#1E293B" : "#F0FDF4",
                    border: isPhishing ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(16,185,129,0.3)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    color: isPhishing ? "#FCA5A5" : "#166534",
                  }}
                >
                  <ExternalLink size={11} />
                  {part.fakeUrl}
                  {isPhishing && answered === null && (
                    <span className="ml-1 text-amber-400 font-bold" style={{ fontFamily: "sans-serif" }}>⚠ Nguy hiểm!</span>
                  )}
                </span>
              )}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}

// ─── AI Feedback Panel ─────────────────────────────────────────────────────────

function AIFeedbackPanel({
  verdict,
  correct,
  onNext,
  isLast,
}: {
  verdict: typeof phishingEmails[0]["aiVerdict"];
  correct: boolean;
  onNext: () => void;
  isLast: boolean;
}) {
  const data = correct ? verdict.correct : verdict.wrong;
  const isPhishingEmail = verdict.correct.clues.some(c => c.flag === "🚩");

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "#FAFAFF",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
      }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{
          background: correct
            ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)"
            : "linear-gradient(135deg, #FEF2F2, #FEE2E2)",
          borderBottom: `1px solid ${correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: correct ? "#10B981" : "#EF4444",
            boxShadow: `0 4px 12px ${correct ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
          }}
        >
          {correct ? <CheckCircle2 size={20} className="text-white" /> : <XCircle size={20} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontWeight: 700, fontSize: "0.88rem", color: correct ? "#065F46" : "#991B1B", lineHeight: 1.3 }}>
            {data.headline}
          </p>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-sm font-extrabold shrink-0"
          style={{ background: `${data.pointColor}15`, color: data.pointColor }}
        >
          {data.points} pts
        </div>
      </div>

      {/* AI analysis */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* AI bot header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
            <Bot size={16} className="text-indigo-500" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0F172A" }}>AI Security Analysis</p>
            <p className="text-slate-400" style={{ fontSize: "0.68rem" }}>Powered by OpenAI GPT-4o</p>
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#ECFDF5", color: "#059669" }}>● Live</div>
        </div>

        {/* Summary bubble */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "#EEF2FF",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <p className="text-indigo-800" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
            {data.summary}
          </p>
        </div>

        {/* Clue list */}
        <div>
          <p className="text-slate-500 mb-2.5" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            {isPhishingEmail ? "DẤU HIỆU PHISHING PHÁT HIỆN" : "DẤU HIỆU EMAIL HỢP LỆ"}
          </p>
          <div className="space-y-2">
            {data.clues.map((clue, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                style={{
                  background: "#fff",
                  border: `1px solid ${clue.flag === "🚩" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)"}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <span className="text-base shrink-0">{clue.flag}</span>
                <div className="min-w-0">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-bold mb-1"
                    style={{
                      background: clue.flag === "🚩" ? "#FEF2F2" : "#ECFDF5",
                      color: clue.flag === "🚩" ? "#DC2626" : "#059669",
                    }}
                  >
                    {clue.label}
                  </span>
                  <p className="text-slate-500" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>{clue.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk score update */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: `${data.pointColor}08`,
            border: `1px solid ${data.pointColor}20`,
          }}
        >
          <Sparkles size={16} style={{ color: data.pointColor, flexShrink: 0 }} />
          <p style={{ fontSize: "0.78rem", color: "#374151" }}>
            Risk Score cập nhật:{" "}
            <strong style={{ color: data.pointColor }}>
              {data.points} điểm
            </strong>{" "}
            {correct ? "được cộng vào hồ sơ của bạn" : "bị trừ — làm lại để lấy lại điểm"}
          </p>
        </div>
      </div>

      {/* Next button */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          {isLast ? (
            <><Shield size={16} /> Xem kết quả chiến dịch</>
          ) : (
            <>Email tiếp theo <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
  const pct = Math.round((score / total) * 100);
  const isPassing = pct >= 67;

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 text-center space-y-6">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{
          background: isPassing ? "linear-gradient(135deg, #10B981, #34D399)" : "linear-gradient(135deg, #F59E0B, #FBBF24)",
          boxShadow: isPassing ? "0 12px 40px rgba(16,185,129,0.3)" : "0 12px 40px rgba(245,158,11,0.3)",
        }}
      >
        {isPassing ? <Shield size={40} className="text-white" /> : <AlertTriangle size={40} className="text-white" />}
      </div>

      <div>
        <h2 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
          {isPassing ? "Xuất sắc! 🎉" : "Cần luyện thêm! 💪"}
        </h2>
        <p className="text-slate-500 mt-2" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
          Bạn trả lời đúng <strong style={{ color: "#6366F1" }}>{score}/{total}</strong> email ({pct}%)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {[
          { label: "Chính xác", value: `${score}/${total}`, color: "#10B981" },
          { label: "Độ chính xác", value: `${pct}%`, color: "#6366F1" },
          { label: "Risk Score", value: isPassing ? "+35" : "+10", color: "#F59E0B" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.08)" }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</p>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
        style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)", fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}
      >
        <RefreshCw size={16} /> Thử lại chiến dịch
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function MoPhong() {
  const [current, setCurrent] = useState(0);
  const [decision, setDecision] = useState<"phishing" | "safe" | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const email = phishingEmails[current];
  const answered = decision !== null;
  const isCorrect = answered
    ? (decision === "phishing") === email.isPhishing
    : null;

  function handleDecision(pick: "phishing" | "safe") {
    if (answered) return;
    setDecision(pick);
    const correct = (pick === "phishing") === email.isPhishing;
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= phishingEmails.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setDecision(null);
    }
  }

  if (finished) {
    return <ResultsScreen score={score} total={phishingEmails.length} onRestart={() => { setCurrent(0); setDecision(null); setScore(0); setFinished(false); }} />;
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0F172A" }}>
            Mô phỏng Phishing
          </h1>
          <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
            Basic Banking Phishing Awareness · Email {current + 1}/{phishingEmails.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {phishingEmails.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  background: i < current ? "#10B981" : i === current ? "#6366F1" : "#E2E8F0",
                }}
              />
            ))}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5" style={{ background: "#EEF2FF" }}>
            <Sparkles size={13} className="text-indigo-500" />
            <span className="text-indigo-700 font-bold" style={{ fontSize: "0.82rem" }}>{score} điểm</span>
          </div>
        </div>
      </div>

      {/* ── Action Bar (pre-answer) ────────────────────── */}
      {!answered && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{
            background: "linear-gradient(135deg, #F8FAFF, #EEF2FF)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Bot size={16} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold" style={{ fontSize: "0.82rem" }}>Đây là email thật hay giả?</p>
              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Di chuột vào link để kiểm tra URL thực — rồi đưa ra quyết định</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecision("safe")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                color: "#065F46",
                border: "1.5px solid rgba(16,185,129,0.3)",
                boxShadow: "0 2px 8px rgba(16,185,129,0.1)",
              }}
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              Xác nhận An toàn
            </button>
            <button
              onClick={() => handleDecision("phishing")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #FEF2F2, #FEE2E2)",
                color: "#991B1B",
                border: "1.5px solid rgba(239,68,68,0.3)",
                boxShadow: "0 2px 8px rgba(239,68,68,0.1)",
              }}
            >
              <AlertTriangle size={16} className="text-red-500" />
              Báo cáo lừa đảo
            </button>
          </div>
        </div>
      )}

      {/* ── Main workspace: Email + AI Panel ──────────── */}
      <div className={`grid gap-5 ${answered ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"}`}>

        {/* Email client */}
        <div className={answered ? "lg:col-span-3" : ""}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            {/* Toolbar chrome */}
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ background: "#FAFAFF", borderColor: "rgba(99,102,241,0.06)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-3.5 ml-2">
                <Inbox size={14} className="text-slate-400" />
                <Archive size={14} className="text-slate-400" />
                <Trash2 size={14} className="text-slate-400" />
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Mail size={13} className="text-indigo-400" />
                <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Hộp thư mô phỏng</span>
                {/* Decision outcome badge */}
                {answered && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: isCorrect ? "#ECFDF5" : "#FEF2F2",
                      color: isCorrect ? "#059669" : "#DC2626",
                    }}
                  >
                    {isCorrect ? "✓ Đúng" : "✗ Sai"}
                  </span>
                )}
              </div>
            </div>

            {/* Email header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(99,102,241,0.06)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 font-bold"
                  style={{ background: email.avatarColor, fontSize: "0.85rem" }}
                >
                  {email.fromAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold" style={{ fontSize: "0.95rem" }}>{email.fromName}</span>
                    <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>· {email.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>Từ:</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-mono"
                      style={{
                        fontSize: "0.72rem",
                        background: email.isPhishing ? "#FEF2F2" : "#F0FDF4",
                        color: email.isPhishing ? "#DC2626" : "#166534",
                        fontWeight: 600,
                      }}
                    >
                      {email.from}
                    </span>
                    {answered && email.isPhishing && (
                      <span className="text-red-500 font-bold" style={{ fontSize: "0.68rem" }}>⚠ Giả mạo!</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Star size={15} className={email.starred ? "text-amber-400" : "text-slate-300"} fill={email.starred ? "#FBBF24" : "transparent"} />
                  {email.hasAttachment && <Paperclip size={15} className="text-red-400" />}
                </div>
              </div>
              <p className="mt-4 text-slate-800 font-bold" style={{ fontSize: "1.05rem", lineHeight: 1.5 }}>
                {email.subject}
              </p>
            </div>

            {/* Email body with link hover */}
            <div className="px-6 py-5">
              <EmailBodyRenderer
                parts={email.bodyParts}
                isPhishing={email.isPhishing}
                answered={answered ? isCorrect : null}
                isCorrect={isCorrect}
              />

              {/* Hint: hover links */}
              {!answered && (
                <div
                  className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.08)" }}
                >
                  <ChevronRight size={12} className="text-indigo-400" />
                  <p className="text-indigo-500" style={{ fontSize: "0.72rem" }}>
                    Gợi ý: Di chuột vào link trong email để xem URL thực ẩn bên dưới
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Feedback Panel — appears after answer */}
        {answered && isCorrect !== null && (
          <div className="lg:col-span-2 min-h-[500px] flex flex-col">
            <AIFeedbackPanel
              verdict={email.aiVerdict}
              correct={isCorrect}
              onNext={handleNext}
              isLast={current + 1 >= phishingEmails.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
