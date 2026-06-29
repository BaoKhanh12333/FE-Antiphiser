import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  ShieldAlert, ShieldCheck, BookOpen, Users, Search, PlusCircle, Sparkles,
  Eye, X, Mail,
} from "lucide-react";
import DOMPurify from "dompurify";
import { campaignService } from "../../services/campaignService";
import { scenarioService } from "../../services/scenarioService";
import { lessonService } from "../../services/lessonService";
import { userService } from "../../services/userService";

type Scenario = {
  scenarioId: number;
  title: string;
  description: string;
  difficultyId: number;
  difficultyName: string | null;
  categoryName: string | null;
  isPhishing: boolean;
  isAIGenerated: boolean;
  isActive: boolean;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  subject: string;
  emailBodyHtml: string;
  phishingIndicators: string | null;
  explanationHint: string;
  createdByUserId: number | null;
};

type Employee = {
  userId: number;
  fullName: string;
  email: string;
  isActive: boolean;
};

type Lesson = {
  lessonId: number;
  title: string;
  phaseNumber: number;
};

const DIFF_META: Record<number, { label: string; color: string }> = {
  1: { label: "Dễ",        color: "#10B981" },
  2: { label: "Trung bình", color: "#F59E0B" },
  3: { label: "Khó",        color: "#EF4444" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

type ParsedIndicator = {
  id?: string;
  type?: string;
  visible_text?: string;
  explanation?: string;
  severity?: string;
};

const SEVERITY_META: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#DC2626", bg: "#FEF2F2", label: "Cao" },
  medium: { color: "#D97706", bg: "#FFFBEB", label: "Trung bình" },
  low:    { color: "#059669", bg: "#ECFDF5", label: "Thấp" },
};

function parseIndicators(raw: string | null): ParsedIndicator[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") return parsed;
  } catch {}
  return null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#+\s/gm, "")
    .trim();
}

function ScenarioPreviewModal({
  scenario,
  selected,
  onClose,
  onToggle,
}: {
  scenario: Scenario;
  selected: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cleanHtml = DOMPurify.sanitize(scenario.emailBodyHtml || "");
  const diff = DIFF_META[scenario.difficultyId] ?? { label: "?", color: "#94A3B8" };
  const indicators = parseIndicators(scenario.phishingIndicators ?? null);
  const hint = scenario.explanationHint ? stripMarkdown(scenario.explanationHint) : "";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [scenario.scenarioId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${diff.color}15`, color: diff.color }}>
                {scenario.difficultyName ?? diff.label}
              </span>
              {scenario.isPhishing ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#FEF2F2", color: "#DC2626" }}>Phishing</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#ECFDF5", color: "#059669" }}>Hợp lệ</span>
              )}
              {scenario.categoryName && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>
                  {scenario.categoryName}
                </span>
              )}
              {scenario.isAIGenerated && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
                  <Sparkles size={10} /> AI
                </span>
              )}
            </div>
            <h2 className="font-bold text-slate-800 leading-snug" style={{ fontSize: "1rem" }}>
              {scenario.title}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0">
            <X size={16} style={{ color: "#64748B" }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Email mockup */}
          <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                }}>
                  {scenario.senderName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0F172A" }}>{scenario.senderName}</p>
                  <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{scenario.senderEmail}</p>
                </div>
                <div className="ml-auto flex items-center gap-1" style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                  <Mail size={12} />
                  <span>Tới: {scenario.recipientName}</span>
                </div>
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>{scenario.subject}</p>
            </div>
            <div
              style={{ padding: "18px 20px", maxHeight: 260, overflowY: "auto", fontSize: "0.875rem", lineHeight: 1.75, color: "#334155" }}
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          </div>

          {/* Phishing analysis */}
          <div style={{
            padding: "14px 16px",
            background: scenario.isPhishing ? "#FFF5F5" : "#F0FDF4",
            borderRadius: 12,
            border: `1px solid ${scenario.isPhishing ? "#FECACA" : "#A7F3D0"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              {scenario.isPhishing
                ? <ShieldAlert size={16} style={{ color: "#DC2626" }} />
                : <ShieldCheck size={16} style={{ color: "#059669" }} />}
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: scenario.isPhishing ? "#DC2626" : "#059669" }}>
                {scenario.isPhishing ? "Email lừa đảo (Phishing)" : "Email hợp lệ (Safe)"}
              </p>
            </div>

            {/* Indicators — parsed JSON array */}
            {indicators && indicators.length > 0 && (
              <div className="mb-4">
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Dấu hiệu nhận biết ({indicators.length})
                </p>
                <div className="space-y-2">
                  {indicators.map((ind, i) => {
                    const sev = SEVERITY_META[ind.severity ?? ""] ?? SEVERITY_META.medium;
                    return (
                      <div key={i} style={{ padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #F1F5F9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          {ind.visible_text && (
                            <code style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: 5, background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", fontFamily: "monospace" }}>
                              {ind.visible_text}
                            </code>
                          )}
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: sev.bg, color: sev.color, marginLeft: "auto" }}>
                            {sev.label}
                          </span>
                        </div>
                        {ind.explanation && (
                          <p style={{ fontSize: "0.78rem", color: "#64748B", lineHeight: 1.6 }}>{ind.explanation}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback: plain text indicators */}
            {!indicators && scenario.phishingIndicators && (
              <div className="mb-4">
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Dấu hiệu nhận biết
                </p>
                <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.65 }}>{scenario.phishingIndicators}</p>
              </div>
            )}

            {/* Explanation hint — stripped of markdown */}
            {hint && (
              <div>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Gợi ý giải thích cho học viên
                </p>
                <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.7 }}>{hint}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFAFA" }}>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100" style={{ border: "1px solid #E2E8F0", color: "#64748B" }}>
            Đóng
          </button>
          <button
            type="button"
            onClick={() => { onToggle(); onClose(); }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: selected ? "rgba(239,68,68,0.08)" : "linear-gradient(135deg, #6366F1, #4F46E5)",
              color: selected ? "#DC2626" : "#fff",
              border: selected ? "1px solid rgba(239,68,68,0.25)" : "none",
              boxShadow: selected ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            {selected ? "✕ Bỏ chọn kịch bản" : "✓ Thêm vào chiến dịch"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title, icon: Icon, count, total, children,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={17} style={{ color: "#6366F1" }} />
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {title}
        </h2>
        {count !== undefined && (
          <span className="ml-auto" style={{ fontSize: "0.78rem", fontWeight: 600, color: count > 0 ? "#6366F1" : "#94A3B8" }}>
            {count > 0 ? `${count}${total !== undefined ? `/${total}` : ""} đã chọn` : "Chưa chọn"}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function ManagerTaoCampaign() {
  const navigate = useNavigate();

  /* ── Form fields ──────────────────────────────────────────────── */
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<number[]>([]);
  const [selectedUserIds,     setSelectedUserIds]     = useState<number[]>([]);
  const [selectedLessonIds,   setSelectedLessonIds]   = useState<number[]>([]);

  /* ── Data ─────────────────────────────────────────────────────── */
  const [scenarios,  setScenarios]  = useState<Scenario[]>([]);
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [lessons,    setLessons]    = useState<Lesson[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);

  /* ── Scenario filters ─────────────────────────────────────────── */
  const [scenarioSearch, setScenarioSearch] = useState("");
  const [diffFilter,  setDiffFilter]  = useState<number | "all">("all");
  const [typeFilter,  setTypeFilter]  = useState<"all" | "phishing" | "legit">("all");

  /* ── Scenario preview ────────────────────────────────────────── */
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);

  /* ── Submit ───────────────────────────────────────────────────── */
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [partialId,   setPartialId]   = useState<number | null>(null);
  const [done,        setDone]        = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ id: number; name: string } | null>(null);

  /* ── Load data ────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    Promise.all([
      scenarioService.getAllScenarios(),
      userService.getCompanyEmployees(),
      lessonService.getAllLessons(),
    ])
      .then(([sc, em, ls]) => {
        if (!alive) return;
        setScenarios((sc ?? []).filter((s: Scenario) => s.isActive));
        setEmployees(em?.items ?? []);
        setLessons(ls ?? []);
      })
      .catch((err: Error) => { if (alive) setLoadError(err.message || "Lỗi tải dữ liệu"); })
      .finally(() => { if (alive) setLoadingData(false); });
    return () => { alive = false; };
  }, []);

  /* ── Derived ──────────────────────────────────────────────────── */
  const filteredScenarios = scenarios.filter(s => {
    if (diffFilter !== "all" && s.difficultyId !== diffFilter) return false;
    if (typeFilter === "phishing" && !s.isPhishing) return false;
    if (typeFilter === "legit" && s.isPhishing) return false;
    if (scenarioSearch && !s.title.toLowerCase().includes(scenarioSearch.toLowerCase())) return false;
    return true;
  });

  function toggleId(id: number, list: number[], setList: (l: number[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  /* ── Submit handler ───────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setPartialId(null);

    try {
      const payload: Record<string, unknown> = {
        campaignName: name.trim(),
        scenarioIds: selectedScenarioIds,
        requiredLessonIds: selectedLessonIds,
      };
      if (desc.trim())          payload.description = desc.trim();
      if (startDate)            payload.startDate   = startDate;
      if (endDate)              payload.endDate     = endDate;
      if (selectedUserIds.length) payload.userIds   = selectedUserIds;

      // Request 1: POST tạo campaign (draft)
      const created = await campaignService.createCampaign(payload) as { campaignId: number };
      const cid: number = created.campaignId;

      // Request 2: PUT activate
      try {
        await campaignService.activateCampaign(cid);
        setCreatedInfo({ id: cid, name: name.trim() });
        setDone(true);
      } catch (putErr: unknown) {
        const msg = putErr instanceof Error ? putErr.message : "Lỗi không xác định";
        setPartialId(cid);
        setSubmitError(
          `Campaign đã tạo (ID ${cid}) nhưng chưa activate được: ${msg}. Thử bật lại từ danh sách.`
        );
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Lỗi tạo chiến dịch");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Done screen ──────────────────────────────────────────────── */
  if (done && createdInfo) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#ECFDF5" }}
        >
          <CheckCircle2 size={32} style={{ color: "#059669" }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
          Chiến dịch đã kích hoạt!
        </h2>
        <p className="text-slate-500 mt-2" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
          <strong style={{ color: "#0F172A" }}>{createdInfo.name}</strong> (ID: {createdInfo.id}) đã tạo và
          kích hoạt thành công.<br />
          <span style={{ color: "#6366F1" }}>{selectedScenarioIds.length}</span> kịch bản ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedUserIds.length}</span> nhân viên ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedLessonIds.length}</span> bài điều kiện.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setDone(false);
              setCreatedInfo(null);
              setName(""); setDesc(""); setStartDate(""); setEndDate("");
              setSelectedScenarioIds([]); setSelectedUserIds([]); setSelectedLessonIds([]);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ border: "1px solid #E2E8F0", color: "#64748B" }}
          >
            Tạo thêm
          </button>
          <button
            onClick={() => navigate("/quan-ly")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            Về tổng quan
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading / Error ──────────────────────────────────────────── */
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-400 text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={24} style={{ color: "#EF4444" }} />
        <p className="text-slate-500 text-sm">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 text-sm font-semibold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────────────────────── */
  const inputStyle = {
    border: "1px solid #E2E8F0",
    fontSize: "0.88rem" as const,
    color: "#0F172A",
    outline: "none",
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/quan-ly")}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all shrink-0"
          style={{ border: "1px solid #E2E8F0" }}
        >
          <ChevronLeft size={18} style={{ color: "#475569" }} />
        </button>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
            Tạo chiến dịch mới
          </h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
            Điền thông tin, chọn kịch bản và giao cho nhân viên
          </p>
        </div>
      </div>

      {/* ── 1. Thông tin chiến dịch ─────────────────────────────── */}
      <SectionCard title="Thông tin chiến dịch" icon={PlusCircle}>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Tên chiến dịch <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Vd: Phishing Awareness Q3 2026"
              required
              className="w-full rounded-xl px-4 py-2.5"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô tả</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Mô tả ngắn về mục tiêu chiến dịch (tùy chọn)"
              rows={2}
              className="w-full rounded-xl px-4 py-2.5 resize-none"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { label: "Ngày bắt đầu", val: startDate, set: setStartDate },
                { label: "Ngày kết thúc", val: endDate,   set: setEndDate },
              ] as { label: string; val: string; set: (v: string) => void }[]
            ).map(({ label, val, set }) => (
              <div key={label}>
                <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {label}
                </label>
                <input
                  type="date"
                  value={val}
                  onChange={e => set(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5"
                  style={{ ...inputStyle, color: val ? "#0F172A" : "#94A3B8" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── AI Banner ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)",
          border: "1.5px solid rgba(99,102,241,0.2)",
        }}
        onClick={() => navigate("/quan-ly/ai-sinh-kich-ban")}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}
        >
          <Sparkles size={18} style={{ color: "#fff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#4F46E5" }}>
            Chưa có kịch bản phù hợp?
          </p>
          <p style={{ fontSize: "0.78rem", color: "#6366F1", marginTop: 1 }}>
            Dùng AI sinh kịch bản riêng cho công ty — không cần Admin duyệt, hiện ngay trong danh sách.
          </p>
        </div>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366F1", whiteSpace: "nowrap" }}>
          Tạo bằng AI →
        </span>
      </div>

      {/* ── 2. Kịch bản ─────────────────────────────────────────── */}
      <SectionCard title="Kịch bản mô phỏng" icon={ShieldAlert} count={selectedScenarioIds.length} total={scenarios.length}>
        {/* Search + chips */}
        <div className="space-y-2 mb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <Search size={14} style={{ color: "#94A3B8" }} className="shrink-0" />
            <input
              value={scenarioSearch}
              onChange={e => setScenarioSearch(e.target.value)}
              placeholder="Tìm kịch bản..."
              className="bg-transparent flex-1 text-slate-700"
              style={{ outline: "none", fontSize: "0.85rem" }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [["all", "Tất cả"], [1, "Dễ"], [2, "Trung bình"], [3, "Khó"]] as [number | "all", string][]
            ).map(([val, lbl]) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setDiffFilter(val)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: diffFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC",
                  border: diffFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0",
                  color: diffFilter === val ? "#6366F1" : "#64748B",
                }}
              >
                {lbl}
              </button>
            ))}
            <span style={{ width: 1, background: "#E2E8F0", display: "inline-block", margin: "0 4px" }} />
            {(
              [["all", "Tất cả loại"], ["phishing", "Phishing"], ["legit", "Hợp lệ"]] as [
                "all" | "phishing" | "legit",
                string
              ][]
            ).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTypeFilter(val)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: typeFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC",
                  border: typeFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0",
                  color: typeFilter === val ? "#6366F1" : "#64748B",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div
          className="overflow-y-auto rounded-xl"
          style={{ maxHeight: 300, border: "1px solid #F1F5F9" }}
        >
          {filteredScenarios.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Không tìm thấy kịch bản phù hợp</p>
          ) : (
            filteredScenarios.map(s => {
              const selected = selectedScenarioIds.includes(s.scenarioId);
              const diff = DIFF_META[s.difficultyId] ?? { label: "?", color: "#94A3B8" };
              return (
                <div
                  key={s.scenarioId}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 group"
                  style={{
                    background: selected ? "rgba(5,150,105,0.05)" : "transparent",
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  {/* Checkbox area */}
                  <button
                    type="button"
                    onClick={() => toggleId(s.scenarioId, selectedScenarioIds, setSelectedScenarioIds)}
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: selected ? "#059669" : "transparent",
                      border: selected ? "none" : "1.5px solid #CBD5E1",
                    }}
                  >
                    {selected && <CheckCircle2 size={11} className="text-white" />}
                  </button>

                  {/* Title — click to preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewScenario(s)}
                    className="flex-1 text-left hover:text-indigo-600 transition-colors"
                    style={{ fontSize: "0.85rem", color: "#334155" }}
                  >
                    {s.title}
                  </button>

                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                    style={{ background: `${diff.color}15`, color: diff.color }}
                  >
                    {s.difficultyName ?? diff.label}
                  </span>
                  {s.isPhishing ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      Phishing
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#ECFDF5", color: "#059669" }}>
                      Hợp lệ
                    </span>
                  )}

                  {/* Eye preview button */}
                  <button
                    type="button"
                    onClick={() => setPreviewScenario(s)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                    title="Xem chi tiết"
                  >
                    <Eye size={13} style={{ color: "#6366F1" }} />
                  </button>
                </div>
              );
            })
          )}
        </div>
        <p className="text-slate-400 mt-2" style={{ fontSize: "0.72rem" }}>
          Hiển thị {filteredScenarios.length}/{scenarios.length} kịch bản
        </p>
      </SectionCard>

      {/* ── 3. Nhân viên ────────────────────────────────────────── */}
      <SectionCard title="Giao cho nhân viên" icon={Users} count={selectedUserIds.length} total={employees.length}>
        {employees.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Chưa có nhân viên nào trong công ty.</p>
        ) : (
          <div className="space-y-2">
            {employees.map(emp => {
              const selected = selectedUserIds.includes(emp.userId);
              return (
                <button
                  key={emp.userId}
                  type="button"
                  onClick={() => toggleId(emp.userId, selectedUserIds, setSelectedUserIds)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: selected ? "#ECFDF5" : "#F8FAFC",
                    border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: selected ? "#059669" : "transparent",
                      border: selected ? "none" : "1.5px solid #CBD5E1",
                    }}
                  >
                    {selected && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "#6366F1" }}
                  >
                    {initials(emp.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>{emp.fullName}</p>
                    <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{emp.email}</p>
                  </div>
                  {!emp.isActive && (
                    <span style={{ fontSize: "0.65rem", color: "#F59E0B", fontWeight: 700 }}>Không hoạt động</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── 4. Bài học điều kiện ────────────────────────────────── */}
      <SectionCard
        title="Bài học điều kiện (prerequisites)"
        icon={BookOpen}
        count={selectedLessonIds.length}
        total={lessons.length}
      >
        <p className="text-slate-400 mb-3" style={{ fontSize: "0.78rem" }}>
          Nhân viên phải hoàn thành các bài này trước khi tham gia chiến dịch.
        </p>
        <div className="space-y-1.5">
          {lessons.map(lesson => {
            const selected = selectedLessonIds.includes(lesson.lessonId);
            return (
              <button
                key={lesson.lessonId}
                type="button"
                onClick={() => toggleId(lesson.lessonId, selectedLessonIds, setSelectedLessonIds)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: selected ? "#ECFDF5" : "#F8FAFC",
                  border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0",
                }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: selected ? "#059669" : "transparent",
                    border: selected ? "none" : "1.5px solid #CBD5E1",
                  }}
                >
                  {selected && <CheckCircle2 size={11} className="text-white" />}
                </div>
                <span className="flex-1 text-slate-700" style={{ fontSize: "0.85rem" }}>
                  {lesson.title}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8", shrink: 0 } as React.CSSProperties}>
                  Giai đoạn {lesson.phaseNumber}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Error / partial */}
      {submitError && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: partialId ? "#FFFBEB" : "#FEF2F2",
            border: `1px solid ${partialId ? "#FCD34D" : "#FECACA"}`,
          }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: partialId ? "#D97706" : "#EF4444" }} />
          <p style={{ fontSize: "0.82rem", color: partialId ? "#92400E" : "#991B1B" }}>{submitError}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={() => navigate("/quan-ly")}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-slate-100"
          style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
          style={{
            background:
              name.trim() && !submitting
                ? "linear-gradient(135deg, #6366F1, #4F46E5)"
                : "rgba(99,102,241,0.4)",
            boxShadow: name.trim() && !submitting ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
            cursor: name.trim() && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Đang tạo...
            </>
          ) : (
            <>
              <PlusCircle size={15} /> Tạo &amp; kích hoạt
            </>
          )}
        </button>
      </div>
    </form>

    {/* Scenario preview modal */}
    {previewScenario && (
      <ScenarioPreviewModal
        scenario={previewScenario}
        selected={selectedScenarioIds.includes(previewScenario.scenarioId)}
        onClose={() => setPreviewScenario(null)}
        onToggle={() => toggleId(previewScenario.scenarioId, selectedScenarioIds, setSelectedScenarioIds)}
      />
    )}
    </>
  );
}
