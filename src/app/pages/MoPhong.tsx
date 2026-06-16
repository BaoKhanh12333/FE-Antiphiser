import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Mail, Star, Paperclip, Inbox, Archive, Trash2, Bot,
  Shield, ChevronRight, ArrowRight, ArrowLeft, Sparkles, ExternalLink,
  Loader2, BookOpen, FileText,
} from "lucide-react";
import { scenarioService } from "../services/scenarioService";
import { campaignService } from "../services/campaignService";
import { lessonService } from "../services/lessonService";
import { Lock } from "lucide-react";


const parseHtmlToBodyParts = (html: string, isPhishing: boolean) => {
  if (!html) return [];
  if (!html.includes("<a") && !html.includes("<span")) {
    return [{ type: "text" as const, content: html }];
  }

  const parts: any[] = [];
  const regex = /(<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>|<span\s+class="urgency"[^>]*>(.*?)<\/span>)/gi;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const textBefore = html.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push({ type: "text", content: textBefore.replace(/<[^>]*>/g, "") });
    }
    
    if (match[1].startsWith("<a") || match[1].startsWith("<A")) {
      const href = match[2];
      const linkText = match[3].replace(/<[^>]*>/g, "");
      parts.push({
        type: "link",
        content: linkText,
        fakeUrl: href
      });
    } else {
      const spanText = match[4].replace(/<[^>]*>/g, "");
      parts.push({
        type: "highlight",
        content: spanText,
        style: "urgency"
      });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  const textAfter = html.substring(lastIndex);
  if (textAfter) {
    parts.push({ type: "text", content: textAfter.replace(/<[^>]*>/g, "") });
  }
  
  return parts;
};

const AVATAR_COLORS = [
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#14B8A6", // Teal
  "#F97316"  // Orange
];

const getAvatarColor = (name: string) => {
  if (!name) return "#6366F1";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const mapDbScenario = (s: any) => {
  let bodyParts = [];
  if (s.emailBodyHtml) {
    bodyParts = parseHtmlToBodyParts(s.emailBodyHtml, s.isPhishing);
  } else {
    bodyParts = [{ type: "text" as const, content: s.description || "Nội dung email..." }];
  }

  let clues: any[] = [];
  try {
    if (s.phishingIndicators) {
      const indicators = typeof s.phishingIndicators === "string" ? JSON.parse(s.phishingIndicators) : s.phishingIndicators;
      if (Array.isArray(indicators)) {
        clues = indicators.map((ind: any) => ({
          flag: ind.flag || "🚩",
          label: ind.label || "Indicator",
          text: ind.text || ind.description || ""
        }));
      }
    }
  } catch (e) {}

  if (clues.length === 0) {
    if (s.isPhishing) {
      clues = [
        { flag: "🚩", label: "Fake Domain", text: s.senderEmail || "Tên miền giả mạo" },
        { flag: "🚩", label: "Phishing Attempt", text: s.explanationHint || "Dấu hiệu lừa đảo" }
      ];
    } else {
      clues = [
        { flag: "✅", label: "Legit Sender", text: s.senderEmail || "Địa chỉ tin cậy" },
        { flag: "✅", label: "Safe Email", text: s.explanationHint || "Nội dung hợp lệ" }
      ];
    }
  }

  return {
    id: s.scenarioId,
    from: s.senderEmail,
    fromName: s.senderName || "Hệ thống",
    fromAvatar: (s.senderName || "HT").split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase(),
    avatarColor: getAvatarColor(s.senderName || s.senderEmail || "Hệ thống"),
    subject: s.subject || "Thông báo từ hệ thống",
    time: "Hôm nay",
    bodyParts: bodyParts,
    isPhishing: s.isPhishing,
    hasAttachment: !!s.attachmentUrl,
    starred: false,
    aiVerdict: {
      correct: {
        headline: s.isPhishing ? "Chính xác! Bạn đã phát hiện email phishing." : "Chính xác! Đây là email hợp lệ.",
        summary: s.description || "Hãy xem phân tích chi tiết bên dưới.",
        clues: clues,
        points: s.isPhishing ? "+15" : "+10",
        pointColor: "#10B981",
      },
      wrong: {
        headline: s.isPhishing ? "Chưa đúng! Đây là email phishing." : "Chưa đúng! Đây là email hợp lệ.",
        summary: s.explanationHint || "Xem dấu hiệu nhận biết của email này.",
        clues: clues,
        points: "-5",
        pointColor: "#EF4444",
      }
    }
  };
};

// ─── Email Body Renderer ───────────────────────────────────────────────────────

function EmailBodyRenderer({
  parts,
  isPhishing,
  answered,
  isCorrect,
  onLinkClick,
}: {
  parts: any[];
  isPhishing: boolean;
  answered: boolean | null;
  isCorrect: boolean | null;
  onLinkClick?: () => void;
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
                onClick={() => { onLinkClick?.(); }}
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
  backendFeedback,
}: {
  verdict: any;
  correct: boolean;
  onNext: () => void;
  isLast: boolean;
  backendFeedback?: any;
}) {
  const data = correct ? verdict.correct : verdict.wrong;
  const isPhishingEmail = verdict.correct.clues.some((c: any) => c.flag === "🚩" || c.flag === "💡");
  const pointColor = backendFeedback ? (backendFeedback.scoreEarned >= 0 ? "#10B981" : "#EF4444") : data.pointColor;

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "#FAFAFF",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
      }}
    >
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
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: correct ? "#065F46" : "#991B1B", lineHeight: 1.3 }}>
            {backendFeedback
              ? (correct ? "Chính xác! Bạn đã vượt qua thử thách." : "Chưa chính xác! Bạn đã dính bẫy.")
              : data.headline}
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-sm font-extrabold shrink-0"
          style={{
            background: correct ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: correct ? "#10B981" : "#EF4444"
          }}
        >
          {backendFeedback ? `${backendFeedback.scoreEarned >= 0 ? "+" : ""}${backendFeedback.scoreEarned}` : data.points} pts
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
            {backendFeedback?.feedbackText || data.summary}
          </p>
        </div>

        {/* Clue list */}
        <div>
          <p className="text-slate-500 mb-2.5" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            {isPhishingEmail ? "DẤU HIỆU NHẬN BIẾT" : "DẤU HIỆU EMAIL HỢP LỆ"}
          </p>
          <div className="space-y-2">
            {backendFeedback ? (
              <>
                {backendFeedback.indicatorsExplained && (
                  <div
                    className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                    style={{
                      background: "#fff",
                      border: `1px solid rgba(99,102,241,0.08)`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <span className="text-base shrink-0">💡</span>
                    <div className="min-w-0">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold mb-1" style={{ background: "#EEF2FF", color: "#6366F1" }}>
                        Giải thích dấu hiệu
                      </span>
                      <p className="text-slate-500" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>{backendFeedback.indicatorsExplained}</p>
                    </div>
                  </div>
                )}
                {backendFeedback.improvementTips && (
                  <div
                    className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                    style={{
                      background: "#fff",
                      border: `1px solid rgba(16,185,129,0.08)`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <span className="text-base shrink-0">🛡️</span>
                    <div className="min-w-0">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold mb-1" style={{ background: "#ECFDF5", color: "#059669" }}>
                        Lời khuyên bảo mật
                      </span>
                      <p className="text-slate-500" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>{backendFeedback.improvementTips}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              data.clues.map((clue: any, i: number) => (
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
              ))
            )}
          </div>
        </div>

        {/* Risk score update */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: `${pointColor}08`,
            border: `1px solid ${pointColor}20`,
          }}
        >
          <Sparkles size={16} style={{ color: pointColor, flexShrink: 0 }} />
          <p style={{ fontSize: "0.78rem", color: "#374151" }}>
            Risk Score cập nhật:{" "}
            <strong style={{ color: pointColor }}>
              {backendFeedback ? `${backendFeedback.scoreEarned >= 0 ? "+" : ""}${backendFeedback.scoreEarned}` : data.points} điểm
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

function ResultsScreen({
  score, total, onRestart, onGoBack,
}: {
  score: number; total: number; onRestart: () => void; onGoBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const isPassing = pct >= 67;

  // Vùng KẾT QUẢ rủi ro — màu token, không emoji
  const riskLevel = pct >= 80
    ? { label: "Thấp",      color: "#10B981" }
    : pct >= 60
    ? { label: "Trung bình", color: "#F59E0B" }
    : { label: "Cao",        color: "#F97316" };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 text-center space-y-6">

      {/* Vùng HỌC — icon + tiêu đề động viên */}
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

      {/* 3 ô: 2 ô học (emerald/indigo) + 1 ô rủi ro (token trung lập) */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="rounded-2xl p-4 text-center" style={{ background: "#F0FDF4", border: "1px solid rgba(16,185,129,0.15)" }}>
          <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10B981" }}>{score}/{total}</p>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>Đúng</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.08)" }}>
          <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#6366F1" }}>{pct}%</p>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>Độ chính xác</p>
        </div>
        {/* Vùng KẾT QUẢ rủi ro — trình bày trung lập, không emoji */}
        <div className="rounded-2xl p-4 text-center" style={{ background: "#F8FAFC", border: `1px solid ${riskLevel.color}25` }}>
          <p style={{ fontSize: "1.4rem", fontWeight: 800, color: riskLevel.color }}>{riskLevel.label}</p>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>Mức rủi ro</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", color: "#475569" }}
        >
          <ArrowLeft size={15} /> Về danh sách
        </button>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)", fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}
        >
          <RefreshCw size={16} /> Thử lại chiến dịch
        </button>
      </div>
    </div>
  );
}

// ─── Campaign card CSS ────────────────────────────────────────────────────────
const campaignCSS = `
  @keyframes cpFadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cpProgressFill { from { width:0%; } }
  .cp-enter { animation: cpFadeUp 0.4s ease-out both; }
  .cp-bar   { animation: cpProgressFill 0.9s 0.4s ease-out both; }
  .cp-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(99,102,241,0.14) !important; }
  .cp-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  @media (prefers-reduced-motion: reduce) {
    .cp-enter, .cp-bar { animation: none !important; }
    .cp-card:hover { transform: none !important; }
  }
`;

// ─── Campaign Picker ──────────────────────────────────────────────────────────
function CampaignPicker({
  campaigns, loading, error, onPick, onGoLessons
}: {
  campaigns: any[]; loading: boolean; error: string | null;
  onPick: (id: number) => void; onGoLessons: () => void;
}) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[340px] gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", boxShadow: "0 4px 16px rgba(99,102,241,0.15)" }}>
        <Loader2 className="animate-spin text-indigo-500" size={22} />
      </div>
      <p className="text-slate-400 text-sm font-medium">Đang tải chiến dịch...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "#FFFBEB" }}>
        <AlertTriangle size={28} className="text-amber-400" />
      </div>
      <p className="text-slate-600 font-semibold">{error}</p>
      <button onClick={onGoLessons}
        className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-semibold hover:underline">
        <ArrowLeft size={14} /> Về trang bài học
      </button>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-5">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", boxShadow: "0 8px 24px rgba(99,102,241,0.12)" }}>
        <Shield size={28} className="text-indigo-300" />
      </div>
      <div>
        <p className="text-slate-700 font-bold text-base">Chưa được giao chiến dịch</p>
        <p className="text-slate-400 text-sm mt-1">Hoàn thành bài học lý thuyết để được giao chiến dịch mô phỏng.</p>
      </div>
      <button onClick={onGoLessons}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02]"
        style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
        <BookOpen size={15} /> Về trang bài học
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{campaignCSS}</style>

      {/* Header */}
      <div className="cp-enter flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
            Chiến dịch mô phỏng
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Rèn luyện phản xạ phát hiện email phishing trong môi trường thực tế
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shrink-0 self-start sm:self-auto"
          style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.15)" }}>
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-indigo-700 text-sm font-bold">{campaigns.length} chiến dịch</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((c: any, idx: number) => {
          const total = c._totalEmails ?? 0;
          const completed = c._completedEmails ?? 0;
          const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
          const isDone = completed === total && total > 0;
          const isInProgress = completed > 0 && !isDone;
          const isLocked = c._eligible === false;

          // Status
          const status = isDone
            ? { text: "Hoàn thành", bg: "#ECFDF5", color: "#059669" }
            : isInProgress
            ? { text: "Đang làm", bg: "#EEF2FF", color: "#4F46E5" }
            : { text: "Chưa bắt đầu", bg: "#F8FAFC", color: "#64748B" };

          // Difficulty
          const diff = c._difficulty === "Dễ"
            ? { bg: "#ECFDF5", color: "#059669" }
            : c._difficulty === "Trung bình"
            ? { bg: "#FFFBEB", color: "#D97706" }
            : c._difficulty === "Khó"
            ? { bg: "#FEF2F2", color: "#EF4444" }
            : { bg: "#F1F5F9", color: "#64748B" };

          return (
            <div
              key={c.campaignId}
              onClick={() => { if (!isLocked) onPick(c.campaignId); }}
              className={`cp-enter cp-card flex flex-col rounded-2xl overflow-hidden relative ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                animationDelay: `${idx * 60}ms`,
                border: isDone
                  ? "1.5px solid rgba(16,185,129,0.25)"
                  : isInProgress
                  ? "1.5px solid rgba(99,102,241,0.2)"
                  : "1px solid #E2E8F0",
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                opacity: isLocked ? 0.85 : 1,
              }}
            >
              {/* Top gradient strip */}
              <div style={{
                height: 4,
                background: isDone
                  ? "linear-gradient(90deg,#10B981,#34D399)"
                  : isInProgress
                  ? "linear-gradient(90deg,#6366F1,#818CF8)"
                  : "#F1F5F9",
              }} />

              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: "rgba(248,250,252,0.88)", backdropFilter: "blur(3px)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", boxShadow: "0 4px 16px rgba(245,158,11,0.25)" }}>
                    <Lock size={20} className="text-amber-500" />
                  </div>
                  <p className="font-bold text-amber-700 text-sm">Chưa đủ điều kiện</p>
                  <p className="text-amber-600 text-xs mt-1 text-center px-6 leading-relaxed" style={{ opacity: 0.8 }}>
                    Hoàn thành bài học bắt buộc để mở khoá chiến dịch này
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onGoLessons(); }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ color: "#6366F1", background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    <BookOpen size={12} /> Về bài học <ArrowRight size={11} />
                  </button>
                </div>
              )}

              <div className="flex flex-col flex-1 p-5 space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: isDone
                        ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)"
                        : "linear-gradient(135deg,#EEF2FF,#E0E7FF)",
                      boxShadow: isDone
                        ? "0 4px 12px rgba(16,185,129,0.2)"
                        : "0 4px 12px rgba(99,102,241,0.15)",
                    }}>
                    <Shield size={21} style={{ color: isDone ? "#10B981" : "#6366F1" }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {c._difficulty && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: diff.bg, color: diff.color }}>
                        {c._difficulty}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: status.bg, color: status.color }}>
                      {status.text}
                    </span>
                  </div>
                </div>

                {/* Title + description */}
                <div>
                  <h3 className="font-extrabold leading-snug line-clamp-1 transition-colors"
                    style={{ fontSize: "0.92rem", color: isLocked ? "#94A3B8" : "#0F172A" }}>
                    {c.campaignName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed"
                    style={{ minHeight: "2.5rem" }}>
                    {c.description || "Thực hành nhận biết hành vi lừa đảo với các tình huống email giả lập thực tế."}
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-2 pt-1 border-t border-slate-50 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Tiến độ</span>
                    <span className="font-bold" style={{ color: isDone ? "#059669" : "#334155" }}>
                      {completed}/{total} email · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                    <div
                      className="h-full rounded-full cp-bar"
                      style={{
                        width: `${pct}%`,
                        background: isDone
                          ? "linear-gradient(90deg,#10B981,#34D399)"
                          : "linear-gradient(90deg,#6366F1,#818CF8)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {c.endDate
                        ? `Hạn: ${new Date(c.endDate).toLocaleDateString("vi-VN")}`
                        : "Không giới hạn"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-0.5"
                      style={{ color: isLocked ? "#CBD5E1" : isDone ? "#059669" : "#6366F1" }}>
                      {isLocked ? <><Lock size={11} /> Khoá</>
                        : isDone ? <><CheckCircle2 size={11} /> Chơi lại</>
                        : isInProgress ? <>Tiếp tục <ChevronRight size={13} /></>
                        : <>Bắt đầu <ChevronRight size={13} /></>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function MoPhong() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // campaignId từ navigate state (truyền từ trang Bài học)
  const incomingCampaignId: number | null = (location.state as any)?.campaignId ?? null;

  // ── Trạng thái picker (dùng khi KHÔNG có incomingCampaignId) ──
  const [myCampaigns,        setMyCampaigns]        = useState<any[]>([]);
  const [loadingMyCampaigns, setLoadingMyCampaigns] = useState(!incomingCampaignId);
  const [myCampaignsError,   setMyCampaignsError]   = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(incomingCampaignId);

  // ── Trạng thái campaign đang chạy ──
  const [activeCampaign, setActiveCampaign]   = useState<any>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(!!incomingCampaignId); // F1a: true ngay khi đã có campaignId
  const [campaignError,   setCampaignError]   = useState<string | null>(null);

  // ── Trạng thái mô phỏng ──
  const [scenarios,       setScenarios]       = useState<any[]>([]);
  const [current,         setCurrent]         = useState(0);
  const [decision,        setDecision]        = useState<"phishing" | "safe" | null>(null);
  const [score,           setScore]           = useState(0);
  const [finished,        setFinished]        = useState(false);
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [backendFeedback, setBackendFeedback] = useState<any>(null);
  const [clickedLink,     setClickedLink]     = useState(false);

  // Bước 1: Nếu không có campaignId → fetch my-campaigns để hiện picker
  // Phần D: lọc ẩn campaign tên chứa "Test"/"Verify" (chỉ FE, không xóa DB)
  //         + enrich meta: số email (scenarios.length) + đã làm (attempts count)
  useEffect(() => {
    if (incomingCampaignId) return; // đã có → bỏ qua picker
    const HIDDEN_KEYWORDS = ["test", "verify"];
    campaignService.getMyCampaigns()
      .then(async (data: any[]) => {
        const raw = data || [];
        // Lọc ẩn campaign tên chứa "Test" hoặc "Verify" (case-insensitive)
        const visible = raw.filter((c: any) => {
          const name = (c.campaignName || "").toLowerCase();
          return !HIDDEN_KEYWORDS.some(kw => name.includes(kw));
        });
        // Enrich meta cho mỗi campaign (số email + đã làm)
        const enriched = await Promise.all(
          visible.map(async (c: any) => {
            try {
              const [detail, attempts] = await Promise.all([
                campaignService.getCampaignById(c.campaignId),
                scenarioService.getMyAttempts(c.campaignId),
              ]);
              const totalEmails = detail?.scenarios?.length ?? 0;
              // Đếm scenario đã làm (unique scenarioId trong attempts)
              const doneIds = new Set((attempts || []).map((a: any) => a.scenarioId));
              
              // Tính độ khó trung bình của chiến dịch
              const difficultyIds = detail?.scenarios?.map((s: any) => s.difficultyId) || [];
              let avgDifficulty = "Chưa xác định";
              if (difficultyIds.length > 0) {
                const sum = difficultyIds.reduce((a: number, b: number) => a + b, 0);
                const avg = sum / difficultyIds.length;
                if (avg <= 1.5) avgDifficulty = "Dễ";
                else if (avg <= 2.5) avgDifficulty = "Trung bình";
                else avgDifficulty = "Khó";
              }

              // Check eligibility cho campaign này
              let eligible = true;
              try {
                eligible = !!(await lessonService.checkEligibility(c.campaignId));
              } catch { eligible = true; } // fallback: nếu API lỗi thì không chặn

              return {
                ...c,
                description: detail?.description || "",
                _totalEmails: totalEmails,
                _completedEmails: doneIds.size,
                _difficulty: avgDifficulty,
                _eligible: eligible,
              };
            } catch {
              return {
                ...c,
                description: "",
                _totalEmails: undefined,
                _completedEmails: undefined,
                _difficulty: undefined,
                _eligible: true, // fallback: nếu lỗi thì không chặn
              };
            }
          })
        );
        setMyCampaigns(enriched);
      })
      .catch(() => setMyCampaignsError("Không tải được danh sách chiến dịch. Vui lòng thử lại."))
      .finally(() => setLoadingMyCampaigns(false));
  }, [incomingCampaignId]);

  // Bước 2: Khi có selectedCampaignId (từ picker hoặc incomingCampaignId) → load campaign + scenarios
  useEffect(() => {
    if (!selectedCampaignId) return;
    setLoadingCampaign(true);
    setCampaignError(null);
    campaignService.getCampaignById(selectedCampaignId)
      .then((c: any) => {
        setActiveCampaign(c);
        if (!c?.scenarios?.length) {
          setCampaignError(`Campaign "${c?.campaignName || selectedCampaignId}" chưa có kịch bản nào.`);
          return;
        }
        setScenarios(c.scenarios.map((s: any) => mapDbScenario(s)));
      })
      .catch(() => setCampaignError("Không tải được campaign. Vui lòng thử lại."))
      .finally(() => setLoadingCampaign(false));
  }, [selectedCampaignId]);

  // ── Picker screen ──
  if (!selectedCampaignId) {
    return (
      <CampaignPicker
        campaigns={myCampaigns}
        loading={loadingMyCampaigns}
        error={myCampaignsError}
        onPick={(id) => { setLoadingCampaign(true); setSelectedCampaignId(id); }} // F1b: loading trước khi re-render
        onGoLessons={() => navigate("/nguoi-dung/lo-trinh")}
      />
    );
  }

  // ── Loading campaign ──
  if (loadingCampaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-400 text-sm">Đang tải kịch bản mô phỏng...</p>
      </div>
    );
  }

  // ── Campaign error (no scenarios / load failed) ──
  if (campaignError) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <AlertTriangle size={36} className="mx-auto text-amber-400" />
        <p className="text-slate-700 font-semibold">{campaignError}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => { setSelectedCampaignId(null); setCampaignError(null); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
            ← Chọn chiến dịch khác
          </button>
          <button onClick={() => navigate("/nguoi-dung/lo-trinh")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all">
            Về bài học
          </button>
        </div>
      </div>
    );
  }

  // F1c: safety net — không render khi scenarios chưa có (tránh crash email.bodyParts undefined)
  if (scenarios.length === 0) return null;

  const email = scenarios[current];
  const answered = decision !== null;
  const isCorrect = answered
    ? (decision === "phishing") === email?.isPhishing
    : null;

  const handleDecision = async (pick: "phishing" | "safe") => {
    if (answered || loadingDecision || !email) return;
    setLoadingDecision(true);

    try {
      // Gửi nộp kết quả thực tế lên backend API
      const result = await scenarioService.submitAttempt({
        scenarioId: email.id,
        campaignId: activeCampaign?.campaignId ?? selectedCampaignId,
        timeTakenSeconds: 12,
        isReported: pick === "phishing",   // "Báo cáo lừa đảo" = hành vi đúng nhất
        isClickedLink: clickedLink,        // Tầng 2: set true khi user click link trong email
        isCredentialLeaked: false,         // Tầng 3
      });

      setBackendFeedback(result);
      setDecision(pick);

      if (result.isCorrect) {
        setScore((s) => s + 1);
      }
    } catch (error) {
      console.error("Lỗi nộp bài lên API:", error);
      // Fallback local logic nếu API gặp sự cố để đảm bảo app chạy mượt
      setDecision(pick);
      const localCorrect = (pick === "phishing") === email.isPhishing;
      if (localCorrect) setScore((s) => s + 1);
    } finally {
      setLoadingDecision(false);
    }
  };

  const handleNext = () => {
    if (current + 1 >= scenarios.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setDecision(null);
      setBackendFeedback(null);
      setClickedLink(false);
    }
  };

  if (finished) {
    const resetAll = () => {
      setCurrent(0); setDecision(null); setBackendFeedback(null);
      setScore(0); setFinished(false); setClickedLink(false);
    };
    return (
      <ResultsScreen
        score={score}
        total={scenarios.length}
        onRestart={resetAll}
        onGoBack={() => {
          resetAll();
          setSelectedCampaignId(null); setScenarios([]); setActiveCampaign(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <button onClick={() => { setSelectedCampaignId(null); setScenarios([]); setCurrent(0); setDecision(null); setScore(0); setFinished(false); setActiveCampaign(null); }}
                className="text-xs text-slate-400 hover:text-indigo-600 font-semibold transition-colors">
                ← Chiến dịch
              </button>
              <span className="text-slate-200 text-xs">·</span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{activeCampaign?.campaignName}</span>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0F172A" }}>
              Mô phỏng Phishing
            </h1>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0" style={{ background: "#EEF2FF" }}>
            <Sparkles size={13} className="text-indigo-500" />
            <span className="text-indigo-700 font-bold" style={{ fontSize: "0.82rem" }}>{score} điểm</span>
          </div>
        </div>
        {/* Progress bar — chỉ báo vị trí, không lộ đúng/sai */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            Email {current + 1}/{scenarios.length}
          </span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((current / scenarios.length) * 100)}%`,
                background: "linear-gradient(90deg, #6366F1, #818CF8)",
              }}
            />
          </div>
          <span className="text-xs text-slate-400 shrink-0 w-8 text-right">
            {Math.round((current / scenarios.length) * 100)}%
          </span>
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
                        background: answered ? (email.isPhishing ? "#FEF2F2" : "#F0FDF4") : "#F1F5F9",
                        color: answered ? (email.isPhishing ? "#DC2626" : "#166534") : "#475569",
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
                onLinkClick={() => setClickedLink(true)}
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
              isLast={current + 1 >= scenarios.length}
              backendFeedback={backendFeedback}
            />
          </div>
        )}
      </div>
    </div>
  );
}
