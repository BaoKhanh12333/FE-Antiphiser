import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Mail, Star, Paperclip, Inbox, Archive, Trash2, Bot,
  Shield, ChevronRight, ArrowRight, ArrowLeft, Sparkles, ExternalLink,
  Loader2, BookOpen, FileText,
} from "lucide-react";
import { scenarioService } from "../services/scenarioService";
import mascotPoint    from "../../data/mascot/point.png";
import mascotSurprised from "../../data/mascot/surprised.png";
import { campaignService } from "../services/campaignService";
import { lessonService } from "../services/lessonService";
import { subscriptionService } from "../services/subscriptionService";
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
          id: ind.id,
          type: ind.type,
          label: ind.visible_text || "",
          explanation: ind.explanation || "",
          severity: ind.severity || "medium",
          flag: ind.severity === "high" ? "🔴" : "🟡",
        }));
      }
    }
  } catch (e) {}

  if (clues.length === 0) {
    if (s.isPhishing) {
      clues = [
        { id: "rf_domain", type: "suspicious_sender_domain", label: s.senderEmail || "Tên miền giả mạo", explanation: s.explanationHint || "Dấu hiệu lừa đảo", severity: "high", flag: "🔴" },
      ];
    } else {
      clues = [
        { id: "rf_safe", type: "safe_sender", label: s.senderEmail || "Địa chỉ tin cậy", explanation: s.explanationHint || "Nội dung hợp lệ", severity: "low", flag: "✅" },
      ];
    }
  }

  // Adapt clues to legacy aiVerdict format (flag/label/text) for AIFeedbackPanel fallback
  const legacyClues = clues.map((c: any) => ({
    flag: c.flag,
    label: c.label,
    text: c.explanation,
  }));

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
    redFlags: clues,
    aiVerdict: {
      correct: {
        headline: s.isPhishing ? "Chính xác! Bạn đã phát hiện email phishing." : "Chính xác! Đây là email hợp lệ.",
        summary: s.description || "Hãy xem phân tích chi tiết bên dưới.",
        clues: legacyClues,
        points: s.isPhishing ? "+15" : "+10",
        pointColor: "#10B981",
      },
      wrong: {
        headline: s.isPhishing ? "Chưa đúng! Đây là email phishing." : "Chưa đúng! Đây là email hợp lệ.",
        summary: s.explanationHint || "Xem dấu hiệu nhận biết của email này.",
        clues: legacyClues,
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
  redFlags,
  selectedRedFlags,
  isPhishingReport,
}: {
  verdict: any;
  correct: boolean;
  onNext: () => void;
  isLast: boolean;
  backendFeedback?: any;
  redFlags?: any[];
  selectedRedFlags?: string[];
  isPhishingReport?: boolean;
}) {
  const data = correct ? verdict.correct : verdict.wrong;
  const isPhishingEmail = verdict.correct.clues.some((c: any) => c.flag === "🚩" || c.flag === "💡");
  const pointColor = backendFeedback ? (backendFeedback.scoreEarned >= 0 ? "#10B981" : "#EF4444") : data.pointColor;

  const correctFlags     = (redFlags ?? []).filter((rf: any) => rf.severity === "high");
  const userFoundFlags   = correctFlags.filter((rf: any) => (selectedRedFlags ?? []).includes(rf.type));
  const missedFlags      = correctFlags.filter((rf: any) => !(selectedRedFlags ?? []).includes(rf.type));
  const bonusFlags       = (redFlags ?? []).filter((rf: any) => rf.severity !== "high" && (selectedRedFlags ?? []).includes(rf.type));
  const correctFlagTypes = new Set(correctFlags.map((rf: any) => rf.type));
  const falsePositives   = (selectedRedFlags ?? []).filter((t) => !correctFlagTypes.has(t));
  const allRedFlagTypes  = new Set((redFlags ?? []).map((rf: any) => rf.type));
  const displayWrong     = falsePositives.filter((t) => !allRedFlagTypes.has(t));
  const flagScore = Math.max(0, userFoundFlags.length - falsePositives.length);
  const flagTotal = correctFlags.length;
  const scoreColor = flagScore === flagTotal && falsePositives.length === 0
    ? "#10B981"
    : flagScore >= flagTotal / 2
    ? "#F59E0B"
    : "#EF4444";
  const scoreLabel = flagScore === flagTotal && falsePositives.length === 0
    ? "Tuyệt vời — chính xác hoàn toàn!"
    : flagScore >= flagTotal / 2
    ? `Khá tốt — còn ${missedFlags.length} bỏ sót${falsePositives.length > 0 ? `, ${falsePositives.length} chọn sai` : ""}`
    : "Cần cải thiện";

  // ── Animated score counter ──
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const target = backendFeedback?.scoreEarned ?? 0;
    if (target === 0) { setDisplayScore(0); return; }
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [backendFeedback?.scoreEarned]);

  // ── Risk level config ──
  const riskConfig: Record<string, { bg: string; color: string; label: string }> = {
    Low:      { bg: "#ECFDF5", color: "#10B981", label: "Rủi ro thấp" },
    Medium:   { bg: "#FEF9C3", color: "#EAB308", label: "Rủi ro trung bình" },
    High:     { bg: "#FFF7ED", color: "#F97316", label: "Rủi ro cao" },
    Critical: { bg: "#FEF2F2", color: "#EF4444", label: "Rủi ro nghiêm trọng" },
  };
  const riskInfo = backendFeedback?.riskLevel ? riskConfig[backendFeedback.riskLevel] : null;
  const isPulsing = backendFeedback?.riskLevel === "High" || backendFeedback?.riskLevel === "Critical";

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "#FAFAFF",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-5 py-4 flex items-center gap-3"
        style={{
          background: correct
            ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)"
            : "linear-gradient(135deg, #FEF2F2, #FEE2E2)",
          borderBottom: `1px solid ${correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <motion.img
          src={correct ? mascotPoint : mascotSurprised}
          alt={correct ? "Mascot chỉ tay hào hứng" : "Mascot hoảng hốt"}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.3, stiffness: 200 }}
          style={{ width: 80, height: 80, objectFit: "contain", flexShrink: 0 }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3, stiffness: 300, damping: 20 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: correct ? "#10B981" : "#EF4444",
            boxShadow: `0 4px 12px ${correct ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
          }}
        >
          {correct ? <CheckCircle2 size={20} className="text-white" /> : <XCircle size={20} className="text-white" />}
        </motion.div>
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
          {backendFeedback ? `${displayScore >= 0 ? "+" : ""}${displayScore}` : data.points} pts
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* ── Risk Level badge ── */}
        {riskInfo && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="w-fit"
          >
            {isPulsing ? (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: riskInfo.bg, border: `1px solid ${riskInfo.color}40` }}
              >
                <span style={{ color: riskInfo.color, fontWeight: 700, fontSize: "0.82rem" }}>
                  ⚠ {riskInfo.label}
                </span>
              </motion.div>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: riskInfo.bg, border: `1px solid ${riskInfo.color}40` }}
              >
                <span style={{ color: riskInfo.color, fontWeight: 700, fontSize: "0.82rem" }}>
                  ● {riskInfo.label}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Red Flag Score (only when user reported phishing) ── */}
        {isPhishingReport && flagTotal > 0 && (
          <div className="space-y-3">
            {/* Score header */}
            <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: scoreColor + "0D", border: `1.5px solid ${scoreColor}30` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3, stiffness: 260, damping: 20 }}
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#fff", border: `2.5px solid ${scoreColor}` }}
              >
                <span style={{ fontWeight: 900, fontSize: "1rem", lineHeight: 1, color: scoreColor }}>
                  {flagScore}/{flagTotal}
                </span>
              </motion.div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: scoreColor }}>{scoreLabel}</p>
                {falsePositives.length > 0 && (
                  <p style={{ fontSize: "0.72rem", color: "#EF4444", fontWeight: 600 }} className="mt-0.5">
                    Chọn sai {falsePositives.length} dấu hiệu (bị trừ điểm)
                  </p>
                )}
                <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.72rem" }}>
                  Xem giải thích chi tiết từng red flag bên dưới
                </p>
              </div>
            </div>

            {/* Detail analysis */}
            <div>
              <p className="uppercase text-xs text-slate-400 font-bold tracking-wider mb-2">Phân tích chi tiết</p>
              <div className="space-y-2">
                {/* High-severity flags: found or missed */}
                {correctFlags.map((rf: any, index: number) => {
                  const found = (selectedRedFlags ?? []).includes(rf.type);
                  return (
                    <motion.div
                      key={rf.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                      style={{
                        background: found ? "#F0FDF4" : "#FFF7ED",
                        border: `1px solid ${found ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.2)"}`,
                      }}
                    >
                      <span className="text-base shrink-0 mt-0.5">{found ? "✅" : "⚠️"}</span>
                      <div className="min-w-0">
                        <p style={{ fontWeight: 700, fontSize: "0.82rem", color: found ? "#065F46" : "#92400E" }}>
                          {found ? rf.label : `Bỏ sót: ${rf.label}`}
                        </p>
                        <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                          {rf.explanation}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Truly wrong — selected type doesn't exist in this email at all */}
                {displayWrong.map((t: string, index: number) => {
                  const label = STATIC_RED_FLAGS.find((r) => r.type === t)?.label ?? t;
                  return (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (correctFlags.length + index) * 0.1 }}
                      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                      style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <span className="text-base shrink-0 mt-0.5">❌</span>
                      <div className="min-w-0">
                        <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#991B1B" }}>
                          Chọn sai: {label}
                        </p>
                        <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                          Dấu hiệu này không xuất hiện trong email này.
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Non-high flags user selected (bonus) */}
                {bonusFlags.map((rf: any, index: number) => (
                  <motion.div
                    key={rf.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (correctFlags.length + displayWrong.length + index) * 0.1 }}
                    className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                    style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.12)" }}
                  >
                    <span className="text-base shrink-0 mt-0.5 text-indigo-400 font-bold">—</span>
                    <div className="min-w-0">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold mb-1" style={{ background: "#EEF2FF", color: "#6366F1" }}>
                        Bonus
                      </span>
                      <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "#374151" }}>{rf.label}</p>
                      <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                        {rf.explanation}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="space-y-4"
        >
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
        </motion.div>{/* end feedback sections motion wrapper */}
      </div>

      {/* Next button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
        className="px-5 py-4 border-t"
        style={{ borderColor: "rgba(99,102,241,0.08)" }}
      >
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
      </motion.div>
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
  .cp-card  { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .cp-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.12) !important; }
  .cp-btn   { transition: filter 0.15s ease, transform 0.15s ease; }
  .cp-btn:hover { filter: brightness(1.08); transform: scale(1.04); }
  @keyframes cpShimmer { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
  .cp-locked-badge { animation: cpShimmer 2.2s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cp-enter, .cp-bar, .cp-locked-badge { animation: none !important; }
    .cp-card:hover, .cp-btn:hover { transform: none !important; }
  }
`;

// ─── Campaign Picker ──────────────────────────────────────────────────────────
function CampaignPicker({
  campaigns, loading, error, onPick, onGoLessons, hasPlan, onGoShop
}: {
  campaigns: any[]; loading: boolean; error: string | null;
  onPick: (id: number) => void; onGoLessons: () => void;
  hasPlan: boolean; onGoShop: () => void;
}) {
  const [upgradeModal, setUpgradeModal] = useState<string | null>(null);

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

  const doneCount = campaigns.filter((c: any) => {
    const t = c._totalEmails ?? 0;
    return t > 0 && (c._completedEmails ?? 0) === t;
  }).length;

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
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.15)" }}>
            <Sparkles size={14} className="text-indigo-500" />
            <span className="text-indigo-700 text-sm font-bold">{campaigns.length} chiến dịch</span>
          </div>
          {doneCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{ background: "#ECFDF5", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-emerald-700 text-sm font-bold">{doneCount} hoàn thành</span>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade modal */}
      {upgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => setUpgradeModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", maxWidth: 400, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg,#F59E0B,#FBBF24)", boxShadow: "0 8px 24px rgba(245,158,11,0.35)" }}>
              <Star size={32} className="text-white" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", textAlign: "center", marginBottom: 8 }}>
              Chiến dịch Premium
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748B", textAlign: "center", marginBottom: 6, lineHeight: 1.6 }}>
              <strong style={{ color: "#334155" }}>"{upgradeModal}"</strong> yêu cầu gói đăng ký.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#94A3B8", textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
              Nâng cấp để truy cập toàn bộ chiến dịch và rèn luyện không giới hạn.
            </p>
            <div className="space-y-2.5 mb-6">
              {["Truy cập toàn bộ chiến dịch mô phỏng", "Phân tích AI cá nhân hóa", "Chứng chỉ hoàn thành khóa học"].map(b => (
                <div key={b} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span style={{ fontSize: "0.83rem", color: "#475569" }}>{b}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setUpgradeModal(null); onGoShop(); }}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm mb-3 transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}
            >
              <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
              Xem các gói dịch vụ
            </button>
            <button
              onClick={() => setUpgradeModal(null)}
              className="w-full py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
              Để sau
            </button>
          </motion.div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((c: any, idx: number) => {
          const total = c._totalEmails ?? 0;
          const completed = c._completedEmails ?? 0;
          const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
          const isDone = completed === total && total > 0;
          const isInProgress = completed > 0 && !isDone;
          const isFreeCard = c.campaignName?.toLowerCase().includes("nhận diện phishing cơ bản");
          const isSubscriptionLocked = !hasPlan && !isFreeCard;
          const isLocked = !isSubscriptionLocked && c._eligible === false;

          // Difficulty visual config
          const diffConfig = c._difficulty === "Dễ"
            ? { headerGrad: "linear-gradient(135deg,#059669,#10B981)", barColor: "linear-gradient(90deg,#10B981,#34D399)" }
            : c._difficulty === "Trung bình"
            ? { headerGrad: "linear-gradient(135deg,#D97706,#F59E0B)", barColor: "linear-gradient(90deg,#F59E0B,#FCD34D)" }
            : c._difficulty === "Khó"
            ? { headerGrad: "linear-gradient(135deg,#DC2626,#EF4444)", barColor: "linear-gradient(90deg,#EF4444,#F87171)" }
            : { headerGrad: "linear-gradient(135deg,#4338CA,#6366F1)", barColor: "linear-gradient(90deg,#6366F1,#818CF8)" };

          return (
            <div
              key={c.campaignId}
              onClick={() => {
                if (isSubscriptionLocked) { setUpgradeModal(c.campaignName); return; }
                if (!isLocked) onPick(c.campaignId);
              }}
              className={`cp-enter cp-card flex flex-col rounded-2xl overflow-hidden relative ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                animationDelay: `${idx * 60}ms`,
                border: isDone
                  ? "1.5px solid rgba(16,185,129,0.3)"
                  : isInProgress
                  ? "1.5px solid rgba(99,102,241,0.22)"
                  : "1px solid #E2E8F0",
                background: isDone ? "#F8FFFE" : "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                opacity: isSubscriptionLocked ? 0.78 : isLocked ? 0.85 : 1,
              }}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: "rgba(248,250,252,0.9)", backdropFilter: "blur(3px)" }}>
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

              {/* Gradient header */}
              <div style={{
                background: isSubscriptionLocked
                  ? "linear-gradient(135deg,#94A3B8,#CBD5E1)"
                  : isDone ? "linear-gradient(135deg,#059669,#10B981)" : diffConfig.headerGrad,
                padding: "18px 20px 16px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position:"absolute", right:-24, top:-24, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", left:-16, bottom:-20, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {!isSubscriptionLocked && c._difficulty && (
                      <span style={{
                        background: "rgba(255,255,255,0.25)", color: "#fff",
                        fontSize: "0.68rem", fontWeight: 700,
                        padding: "2px 9px", borderRadius: 99,
                        backdropFilter: "blur(4px)",
                      }}>{c._difficulty}</span>
                    )}
                    {!isSubscriptionLocked && total > 0 && (
                      <span style={{
                        background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.88)",
                        fontSize: "0.65rem", fontWeight: 600,
                        padding: "2px 8px", borderRadius: 99,
                      }}>📧 {total} email</span>
                    )}
                    {isSubscriptionLocked && (
                      <span className="cp-locked-badge flex items-center gap-1" style={{
                        background: "rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.9)",
                        fontSize: "0.68rem", fontWeight: 700,
                        padding: "2px 9px", borderRadius: 99,
                      }}>
                        <Lock size={9} /> Khoá
                      </span>
                    )}
                  </div>
                  {!isSubscriptionLocked && isDone ? (
                    <CheckCircle2 size={16} color="rgba(255,255,255,0.9)" />
                  ) : !isSubscriptionLocked && isInProgress ? (
                    <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.85)", fontWeight:700, background:"rgba(255,255,255,0.18)", padding:"2px 8px", borderRadius:99 }}>Đang làm</span>
                  ) : null}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h3 style={{
                    color: isSubscriptionLocked ? "rgba(255,255,255,0.75)" : "#fff",
                    fontWeight:800, fontSize:"1rem", lineHeight:1.3, flex:1, letterSpacing:"-0.01em"
                  }} className="line-clamp-2">
                    {c.campaignName}
                  </h3>
                  <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:12, padding:10, backdropFilter:"blur(4px)", flexShrink:0 }}>
                    {isSubscriptionLocked
                      ? <Lock size={22} color="rgba(255,255,255,0.75)" />
                      : isDone ? <CheckCircle2 size={22} color="#fff" /> : <Shield size={22} color="#fff" />}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5 gap-4">
                <p className="text-xs leading-relaxed line-clamp-2" style={{ minHeight:"2.4rem", color: isSubscriptionLocked ? "#CBD5E1" : "#94A3B8" }}>
                  {isSubscriptionLocked
                    ? "Nâng cấp gói để mở khoá chiến dịch này."
                    : (c.description || "Thực hành nhận biết hành vi lừa đảo với các tình huống email giả lập thực tế.")}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium" style={{ color: isSubscriptionLocked ? "#E2E8F0" : "#94A3B8" }}>Tiến độ</span>
                    {!isSubscriptionLocked && (
                      <span className="font-bold" style={{ color: isDone ? "#059669" : "#334155" }}>
                        {completed}/{total} · {pct}%
                      </span>
                    )}
                  </div>
                  <div className="h-3.5 rounded-full overflow-hidden" style={{ background:"#F1F5F9" }}>
                    {!isSubscriptionLocked && (
                      <div className="h-full rounded-full cp-bar"
                        style={{ width:`${pct}%`, background: isDone ? "linear-gradient(90deg,#10B981,#34D399)" : diffConfig.barColor }} />
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[10.5px]" style={{ color: isSubscriptionLocked ? "#CBD5E1" : "#94A3B8" }}>
                    {isSubscriptionLocked ? "Yêu cầu gói đăng ký" : c.endDate ? `Hạn: ${new Date(c.endDate).toLocaleDateString("vi-VN")}` : "Không giới hạn"}
                  </span>
                  {isSubscriptionLocked ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setUpgradeModal(c.campaignName); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 cp-btn"
                      style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}
                    >
                      <Lock size={11} /> Mua gói
                    </button>
                  ) : !isLocked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPick(c.campaignId); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 cp-btn"
                      style={{
                        background: isDone ? "linear-gradient(135deg,#059669,#10B981)" : diffConfig.headerGrad,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                      }}
                    >
                      {isDone ? <><RefreshCw size={11} /> Chơi lại</>
                        : isInProgress ? <>Tiếp tục <ChevronRight size={12} /></>
                        : <>Bắt đầu <ChevronRight size={12} /></>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Report Panel constants ───────────────────────────────────────────────────

const STATIC_RED_FLAGS = [
  { type: "suspicious_sender_domain", label: "Địa chỉ người gửi lạ" },
  { type: "urgency_language",         label: "Ngôn từ cấp bách" },
  { type: "suspicious_link",          label: "Link đáng ngờ" },
  { type: "generic_greeting",         label: "Lời chào chung chung" },
  { type: "threat_consequence",       label: "Đe dọa hậu quả" },
  { type: "impersonation",            label: "Giả mạo tổ chức" },
  { type: "credential_request",       label: "Yêu cầu đăng nhập qua link" },
];

const TACTICS      = ["Tạo sự cấp bách", "Gây sợ hãi", "Giả quyền lực", "Gợi tò mò"];
const ATTACK_TYPES = ["Lừa đảo qua email", "Lừa đảo có chủ đích", "Giả mạo lãnh đạo (BEC)", "Giả mạo nhân sự", "Giả mạo ngân hàng", "Giả mạo CEO", "Lừa đảo dịch vụ cloud"];

// ─── ReportPanel ──────────────────────────────────────────────────────────────

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
      style={{
        background:   selected ? "#1C1917" : "#fff",
        color:        selected ? "#fff"     : "#374151",
        borderColor:  selected ? "#1C1917"  : "#E5E7EB",
      }}
    >
      {label}
    </button>
  );
}

function ReportPanel({
  email, selectedRedFlags, setSelectedRedFlags,
  selectedTactics, setSelectedTactics,
  selectedAttackTypes, setSelectedAttackTypes,
  userRedFlagNotes, setUserRedFlagNotes,
  userTacticNotes, setUserTacticNotes,
  userAttackNotes, setUserAttackNotes,
  onSubmit, onBack, loading,
}: {
  email: any;
  selectedRedFlags: string[];    setSelectedRedFlags: (v: string[]) => void;
  selectedTactics: string[];     setSelectedTactics: (v: string[]) => void;
  selectedAttackTypes: string[]; setSelectedAttackTypes: (v: string[]) => void;
  userRedFlagNotes: string;      setUserRedFlagNotes: (v: string) => void;
  userTacticNotes: string;       setUserTacticNotes: (v: string) => void;
  userAttackNotes: string;       setUserAttackNotes: (v: string) => void;
  onSubmit: () => void; onBack: () => void; loading: boolean;
}) {
  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-7"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div>
        <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0F172A" }}>Báo cáo phishing</h2>
        <p className="text-slate-400 text-sm mt-0.5">Chọn các dấu hiệu bạn nhận ra trong email này</p>
      </div>

      {/* NGƯỜI GỬI */}
      <div>
        <p className="uppercase text-xs text-slate-400 font-bold tracking-wider mb-3">Người gửi</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-mono text-slate-700 text-sm">{email.from}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#EEF2FF", color: "#6366F1" }}>
            tự động điền
          </span>
        </div>
      </div>

      {/* DẤU HIỆU BẠN NHẬN RA */}
      <div>
        <p className="uppercase text-xs text-slate-400 font-bold tracking-wider mb-3">
          Dấu hiệu bạn nhận ra
        </p>
        <div className="flex flex-wrap gap-2">
          {STATIC_RED_FLAGS.map(({ type, label }) => (
            <TagButton
              key={type}
              label={label}
              selected={selectedRedFlags.includes(type)}
              onClick={() => toggle(selectedRedFlags, type, setSelectedRedFlags)}
            />
          ))}
        </div>
        <textarea
          className="w-full mt-3 p-3 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
          rows={2}
          placeholder="Ghi nhận xét thêm của bạn..."
          value={userRedFlagNotes}
          onChange={(e) => setUserRedFlagNotes(e.target.value)}
        />
      </div>

      {/* THỦ THUẬT TÂM LÝ */}
      <div>
        <p className="uppercase text-xs text-slate-400 font-bold tracking-wider mb-3">
          Thủ thuật tâm lý
        </p>
        <div className="flex flex-wrap gap-2">
          {TACTICS.map((t) => (
            <TagButton
              key={t}
              label={t}
              selected={selectedTactics.includes(t)}
              onClick={() => toggle(selectedTactics, t, setSelectedTactics)}
            />
          ))}
        </div>
        <textarea
          className="w-full mt-3 p-3 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
          rows={2}
          placeholder="Bạn nhận thấy thủ thuật gì khác?"
          value={userTacticNotes}
          onChange={(e) => setUserTacticNotes(e.target.value)}
        />
      </div>

      {/* LOẠI LỪA ĐẢO */}
      <div>
        <p className="uppercase text-xs text-slate-400 font-bold tracking-wider mb-3">Loại lừa đảo</p>
        <div className="flex flex-wrap gap-2">
          {ATTACK_TYPES.map((a) => (
            <TagButton
              key={a}
              label={a}
              selected={selectedAttackTypes.includes(a)}
              onClick={() => toggle(selectedAttackTypes, a, setSelectedAttackTypes)}
            />
          ))}
        </div>
        <textarea
          className="w-full mt-3 p-3 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
          rows={2}
          placeholder="Bạn nghĩ đây là loại lừa đảo gì?"
          value={userAttackNotes}
          onChange={(e) => setUserAttackNotes(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
          : <>Gửi báo cáo</>}
      </button>
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
  const [hasPlan,            setHasPlan]            = useState<boolean>(true);

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
  const [showRedFlagPanel,    setShowRedFlagPanel]    = useState(false);
  const [selectedRedFlags,    setSelectedRedFlags]    = useState<string[]>([]);
  const [selectedTactics,     setSelectedTactics]     = useState<string[]>([]);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<string[]>([]);
  const [userRedFlagNotes,    setUserRedFlagNotes]    = useState("");
  const [userTacticNotes,     setUserTacticNotes]     = useState("");
  const [userAttackNotes,     setUserAttackNotes]     = useState("");

  // Dùng lesson lock status (server-computed) làm indicator free tier — cùng nguồn với LoTrinh
  useEffect(() => {
    lessonService.getMyLessons()
      .then((ls: any[]) => setHasPlan(!ls?.some((l: any) => l.isLocked)))
      .catch(() => setHasPlan(true));
  }, []);

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
        hasPlan={hasPlan}
        onGoShop={() => navigate("/nguoi-dung/mua-goi")}
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

  const handleSubmitReport = async () => {
    if (answered || loadingDecision || !email) return;
    setLoadingDecision(true);
    const userObservations = [
      selectedRedFlags.length > 0 ? `Dấu hiệu: ${selectedRedFlags.join(", ")}` : "",
      userRedFlagNotes ? `Nhận xét dấu hiệu: ${userRedFlagNotes}` : "",
      selectedTactics.length > 0 ? `Thủ thuật tâm lý: ${selectedTactics.join(", ")}` : "",
      userTacticNotes ? `Nhận xét tâm lý: ${userTacticNotes}` : "",
      selectedAttackTypes.length > 0 ? `Loại lừa đảo: ${selectedAttackTypes.join(", ")}` : "",
      userAttackNotes ? `Nhận xét loại: ${userAttackNotes}` : "",
    ].filter(Boolean).join("\n");
    try {
      const result = await scenarioService.submitAttempt({
        scenarioId: email.id,
        campaignId: activeCampaign?.campaignId ?? selectedCampaignId,
        timeTakenSeconds: 12,
        isReported: true,
        isClickedLink: clickedLink,
        isCredentialLeaked: false,
        userObservations,
      });
      setBackendFeedback(result);
      setDecision("phishing");
      if (result.isCorrect) setScore((s) => s + 1);
    } catch {
      setDecision("phishing");
      if (email.isPhishing) setScore((s) => s + 1);
    } finally {
      setLoadingDecision(false);
      setShowRedFlagPanel(false);
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
      setShowRedFlagPanel(false);
      setSelectedRedFlags([]);
      setSelectedTactics([]);
      setSelectedAttackTypes([]);
      setUserRedFlagNotes("");
      setUserTacticNotes("");
      setUserAttackNotes("");
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

      {/* ── Red Flag Report Panel (side-by-side) ──────── */}
      {showRedFlagPanel && !answered && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Cột trái: Email readonly */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
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
                    <span className="px-1.5 py-0.5 rounded font-mono" style={{ fontSize: "0.72rem", background: "#F1F5F9", color: "#475569", fontWeight: 600 }}>
                      {email.from}
                    </span>
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

            {/* Email body — scrollable */}
            <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              <EmailBodyRenderer
                parts={email.bodyParts}
                isPhishing={email.isPhishing}
                answered={null}
                isCorrect={null}
                onLinkClick={() => setClickedLink(true)}
              />
            </div>
          </div>

          {/* Cột phải: ReportPanel */}
          <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <ReportPanel
              email={email}
              selectedRedFlags={selectedRedFlags}
              setSelectedRedFlags={setSelectedRedFlags}
              selectedTactics={selectedTactics}
              setSelectedTactics={setSelectedTactics}
              selectedAttackTypes={selectedAttackTypes}
              setSelectedAttackTypes={setSelectedAttackTypes}
              userRedFlagNotes={userRedFlagNotes}
              setUserRedFlagNotes={setUserRedFlagNotes}
              userTacticNotes={userTacticNotes}
              setUserTacticNotes={setUserTacticNotes}
              userAttackNotes={userAttackNotes}
              setUserAttackNotes={setUserAttackNotes}
              onSubmit={handleSubmitReport}
              onBack={() => setShowRedFlagPanel(false)}
              loading={loadingDecision}
            />
          </div>
        </div>
      )}

      {/* ── Action Bar (pre-answer) ────────────────────── */}
      {!answered && !showRedFlagPanel && (
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
              onClick={() => setShowRedFlagPanel(true)}
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
      {!showRedFlagPanel && <div className={`grid gap-5 ${answered ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"}`}>

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
              key={email?.id}
              verdict={email.aiVerdict}
              correct={isCorrect}
              onNext={handleNext}
              isLast={current + 1 >= scenarios.length}
              backendFeedback={backendFeedback}
              redFlags={email.redFlags}
              selectedRedFlags={selectedRedFlags}
              isPhishingReport={decision === "phishing"}
            />
          </div>
        )}
      </div>}
    </div>
  );
}
