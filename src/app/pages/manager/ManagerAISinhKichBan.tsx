import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Sparkles, RefreshCw, Save, Loader2, AlertCircle,
  ChevronLeft, CheckCircle2, ShieldAlert, ShieldCheck,
  Wand2, Copy, Building2,
} from "lucide-react";
import DOMPurify from "dompurify";
import { aiKnowledgeService } from "../../services/aiKnowledgeService";
import { campaignGeneratorService } from "../../services/campaignGeneratorService";
import { scenarioService } from "../../services/scenarioService";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { id: 1, name: "Dễ" },
  { id: 2, name: "Trung bình" },
  { id: 3, name: "Khó" },
];

const CATEGORIES = [
  { id: 1, name: "Banking Phishing" },
  { id: 2, name: "Social Engineering" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface KnowledgeItem {
  id: number;
  title: string;
  difficultyId: number;
  difficultyName: string | null;
  tags: string | null;
}

interface PreviewData {
  title: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  subject: string;
  emailBodyHtml: string;
  phishingIndicators: string;
  explanationHint: string;
  isPhishing: boolean;
  difficultyId: number;
  sourceKnowledgeId: number;
  sourceScenarioIds: number[];
  suggestedCategoryId: number;
}

type Step = "params" | "preview" | "saved";
type TabId = "context" | "similar";

// ─── Shared field editor ──────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          style={{ ...inputStyle, height: "auto", resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

// ─── Email Preview renderer ───────────────────────────────────────────────────

function EmailPreview({ html, subject, senderName, senderEmail }: {
  html: string;
  subject: string;
  senderName: string;
  senderEmail: string;
}) {
  const clean = DOMPurify.sanitize(html);
  return (
    <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0,
          }}>
            {senderName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "#0F172A" }}>{senderName || "—"}</p>
            <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{senderEmail || "—"}</p>
          </div>
        </div>
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1E293B" }}>{subject || "(Không có tiêu đề)"}</p>
      </div>
      <div
        style={{ padding: "16px 18px", maxHeight: 320, overflowY: "auto", fontSize: "0.85rem", lineHeight: 1.7, color: "#334155" }}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}

// ─── Preview & Edit Panel ─────────────────────────────────────────────────────

function PreviewEditPanel({
  preview: initialPreview,
  onBack,
  onSaved,
}: {
  preview: PreviewData;
  onBack: () => void;
  onSaved: (scenarioId: number) => void;
}) {
  const [form, setForm] = useState({ ...initialPreview });
  const [categoryId, setCategoryId] = useState(
    initialPreview.suggestedCategoryId || CATEGORIES[0].id
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (field: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.title?.trim()) { setErr("Tiêu đề không được để trống."); return; }
    if (!form.emailBodyHtml?.trim()) { setErr("Nội dung email không được để trống."); return; }
    setSaving(true);
    setErr(null);
    try {
      const result = await scenarioService.createCompanyScenario({
        title: form.title,
        description: form.explanationHint || form.title,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        recipientName: form.recipientName,
        subject: form.subject,
        emailBodyHtml: form.emailBodyHtml,
        phishingIndicators: form.phishingIndicators,
        explanationHint: form.explanationHint,
        isPhishing: form.isPhishing,
        difficultyId: form.difficultyId,
        categoryId: Number(categoryId),
      });
      onSaved(result?.scenarioId ?? 0);
    } catch (e: any) {
      setErr(e?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <button onClick={onBack} style={{ ...btnGhost, gap: 6 }}>
        <ChevronLeft size={15} /> Tạo lại
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Left: Email preview */}
        <div className="space-y-4">
          <p style={sectionTitle}>Xem trước email</p>
          <EmailPreview
            html={form.emailBodyHtml}
            subject={form.subject}
            senderName={form.senderName}
            senderEmail={form.senderEmail}
          />

          <div style={{
            padding: "12px 16px",
            background: form.isPhishing ? "#FEF2F2" : "#ECFDF5",
            borderRadius: 12,
            border: `1px solid ${form.isPhishing ? "#FECACA" : "#A7F3D0"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {form.isPhishing
                ? <ShieldAlert size={15} style={{ color: "#DC2626" }} />
                : <ShieldCheck size={15} style={{ color: "#059669" }} />}
              <p style={{ fontWeight: 700, fontSize: "0.8rem", color: form.isPhishing ? "#DC2626" : "#059669" }}>
                {form.isPhishing ? "Email phishing" : "Email an toàn"}
              </p>
            </div>
            {form.phishingIndicators && (
              <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6 }}>
                <strong>Dấu hiệu:</strong> {form.phishingIndicators}
              </p>
            )}
            {form.explanationHint && (
              <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6, marginTop: 4 }}>
                <strong>Gợi ý giải thích:</strong> {form.explanationHint}
              </p>
            )}
          </div>

          {/* Company-scope notice */}
          <div style={{
            padding: "10px 14px", background: "#EFF6FF",
            borderRadius: 10, border: "1px solid #BFDBFE",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Building2 size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
            <p style={{ fontSize: "0.76rem", color: "#1D4ED8", lineHeight: 1.5 }}>
              Kịch bản này chỉ hiển thị cho <strong>nhân viên trong công ty bạn</strong> và không cần Admin duyệt.
            </p>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="space-y-4">
          <p style={sectionTitle}>Chỉnh sửa trước khi lưu</p>

          <FieldRow label="Tiêu đề kịch bản" value={form.title} onChange={(v) => set("title", v)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldRow label="Tên người gửi" value={form.senderName} onChange={(v) => set("senderName", v)} />
            <FieldRow label="Email người gửi" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldRow label="Tên người nhận" value={form.recipientName} onChange={(v) => set("recipientName", v)} />
            <FieldRow label="Tiêu đề email" value={form.subject} onChange={(v) => set("subject", v)} />
          </div>

          <FieldRow label="Nội dung HTML" value={form.emailBodyHtml} onChange={(v) => set("emailBodyHtml", v)} multiline rows={5} />

          <FieldRow
            label="Dấu hiệu lừa đảo"
            value={form.phishingIndicators || ""}
            onChange={(v) => set("phishingIndicators", v)}
            multiline rows={2}
          />

          <FieldRow
            label="Gợi ý giải thích"
            value={form.explanationHint || ""}
            onChange={(v) => set("explanationHint", v)}
            multiline rows={2}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Độ khó</label>
              <select value={form.difficultyId} onChange={(e) => set("difficultyId", Number(e.target.value))} style={inputStyle}>
                {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* IsPhishing toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => set("isPhishing", !form.isPhishing)}
              style={{
                width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                background: form.isPhishing ? "#DC2626" : "#E2E8F0",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: form.isPhishing ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
              }} />
            </button>
            <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>
              {form.isPhishing ? "Email phishing (lừa đảo)" : "Email an toàn (không phải phishing)"}
            </span>
          </div>

          {err && (
            <div style={{ padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0 }} />
              <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>{err}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnPrimary, width: "100%", justifyContent: "center", opacity: saving ? 0.7 : 1 }}
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</>
              : <><Save size={15} /> Lưu vào kịch bản công ty</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab A: Sinh từ ngữ cảnh ──────────────────────────────────────────────────

function TabContext({ onPreview }: { onPreview: (data: PreviewData) => void }) {
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string>("");
  const [selectedDiff, setSelectedDiff] = useState<number>(1);
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

  useEffect(() => {
    aiKnowledgeService.getAll()
      .then((data: any) => {
        setKnowledgeList(data || []);
        if (data?.length > 0) setSelectedKnowledge(String(data[0].id));
      })
      .catch(() => {})
      .finally(() => setKnowledgeLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedKnowledge) { setGenErr("Vui lòng chọn ngữ cảnh."); return; }
    setGenerating(true);
    setGenErr(null);
    try {
      const preview = await campaignGeneratorService.generatePreview(Number(selectedKnowledge), selectedDiff);
      onPreview(preview as PreviewData);
    } catch (e: any) {
      setGenErr(e?.message || "AI không thể sinh kịch bản lúc này. Thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  const selectedItem = knowledgeList.find((k) => String(k.id) === selectedKnowledge);

  return (
    <div className="space-y-5">
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 24,
      }}>
        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", marginBottom: 4 }}>
          Bước 1 — Chọn tham số
        </p>
        <p style={{ fontSize: "0.8rem", color: "#94A3B8", marginBottom: 20 }}>
          AI sẽ đọc ngữ cảnh bạn chọn và tạo một email phishing mô phỏng cho nhân viên công ty
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Ngữ cảnh AI</label>
            {knowledgeLoading ? (
              <div style={{ height: 40, display: "flex", alignItems: "center", gap: 8, color: "#94A3B8" }}>
                <Loader2 size={15} className="animate-spin" />
                <span style={{ fontSize: "0.82rem" }}>Đang tải...</span>
              </div>
            ) : knowledgeList.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>
                Chưa có ngữ cảnh nào. Liên hệ Admin để thêm ngữ cảnh AI.
              </p>
            ) : (
              <select value={selectedKnowledge} onChange={(e) => setSelectedKnowledge(e.target.value)} style={inputStyle}>
                {knowledgeList.map((k) => (
                  <option key={k.id} value={k.id}>
                    [{k.difficultyName || DIFFICULTIES.find(d => d.id === k.difficultyId)?.name || "?"}] {k.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ width: 160 }}>
            <label style={labelStyle}>Độ khó yêu cầu</label>
            <select value={selectedDiff} onChange={(e) => setSelectedDiff(Number(e.target.value))} style={inputStyle}>
              {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {selectedItem && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#F8FAFF", borderRadius: 10, border: "1px solid #E0E7FF" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Xem trước ngữ cảnh
            </p>
            <p style={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.6 }}>
              {selectedItem.tags && selectedItem.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} style={{ fontSize: "0.68rem", padding: "1px 7px", borderRadius: 6, background: "#EEF2FF", color: "#4F46E5", marginRight: 4, fontWeight: 600 }}>#{t}</span>
              ))}
            </p>
          </div>
        )}

        {genErr && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0 }} />
            <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>{genErr}</p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={generating || knowledgeList.length === 0}
            style={{ ...btnPrimary, opacity: (generating || knowledgeList.length === 0) ? 0.7 : 1, cursor: (generating || knowledgeList.length === 0) ? "not-allowed" : "pointer" }}
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" /> AI đang sinh kịch bản (~3-8s)...</>
              : <><Wand2 size={15} /> Tạo preview kịch bản</>}
          </button>
          {generating && (
            <p style={{ marginTop: 8, fontSize: "0.75rem", color: "#94A3B8" }}>
              Đang gọi OpenRouter AI... Lần đầu có thể mất 5-10 giây.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab B: Sinh biến thể ─────────────────────────────────────────────────────

function TabSimilar({ onPreview }: { onPreview: (data: PreviewData) => void }) {
  const [difficultyId, setDifficultyId] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [fewShotCount, setFewShotCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenErr(null);
    try {
      const preview = await campaignGeneratorService.generateSimilar({
        difficultyId,
        categoryId: categoryId ? Number(categoryId) : null,
        fewShotCount,
      });
      onPreview(preview as PreviewData);
    } catch (e: any) {
      setGenErr(
        e?.message?.includes("Không có Scenario gốc")
          ? `Không có kịch bản gốc nào ở độ khó "${DIFFICULTIES.find(d => d.id === difficultyId)?.name}" để làm mẫu.`
          : e?.message || "AI không thể sinh biến thể lúc này. Thử lại."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 24,
      }}>
        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", marginBottom: 4 }}>
          Bước 1 — Chọn tham số
        </p>
        <p style={{ fontSize: "0.8rem", color: "#94A3B8", marginBottom: 20 }}>
          AI lấy ngẫu nhiên N kịch bản có sẵn cùng độ khó làm mẫu, rồi sinh biến thể mới
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Độ khó</label>
            <select value={difficultyId} onChange={(e) => setDifficultyId(Number(e.target.value))} style={inputStyle}>
              {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Danh mục <span style={{ fontWeight: 400, color: "#94A3B8" }}>(tuỳ chọn)</span></label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
              <option value="">— Tất cả —</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Số mẫu few-shot (1–5)</label>
            <input
              type="number" min={1} max={5} value={fewShotCount}
              onChange={(e) => setFewShotCount(Math.min(5, Math.max(1, Number(e.target.value))))}
              style={inputStyle}
            />
          </div>
        </div>

        {genErr && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0 }} />
            <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>{genErr}</p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ ...btnPrimary, background: "linear-gradient(135deg,#8B5CF6,#EC4899)", opacity: generating ? 0.7 : 1, cursor: generating ? "not-allowed" : "pointer" }}
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" /> AI đang sinh biến thể (~3-8s)...</>
              : <><Copy size={15} /> Tạo biến thể mới</>}
          </button>
          {generating && (
            <p style={{ marginTop: 8, fontSize: "0.75rem", color: "#94A3B8" }}>
              Đang gọi OpenRouter AI... Lần đầu có thể mất 5-10 giây.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SavedScreen({ scenarioId, onReset }: { scenarioId: number; onReset: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: "48px 24px" }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 24,
        background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
      }}>
        <CheckCircle2 size={36} style={{ color: "#6366F1" }} />
      </div>
      <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0F172A", marginBottom: 8 }}>
        Kịch bản đã lưu thành công!
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: 6 }}>
        Kịch bản <strong>ID: {scenarioId}</strong> đã được thêm vào kho kịch bản của công ty.
      </p>
      <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginBottom: 28 }}>
        Nhân viên trong công ty bạn có thể thấy kịch bản này khi tham gia chiến dịch.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/quan-ly/tao-chien-dich")}
          style={{ ...btnPrimary, textDecoration: "none" }}
        >
          Tạo chiến dịch ngay →
        </button>
        <button onClick={onReset} style={btnSecondary}>
          <RefreshCw size={14} /> Tạo kịch bản khác
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ManagerAISinhKichBan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("context");
  const [step, setStep] = useState<Step>("params");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [savedId, setSavedId] = useState<number>(0);

  const handlePreview = (data: PreviewData) => { setPreview(data); setStep("preview"); };
  const handleSaved = (id: number) => { setSavedId(id); setStep("saved"); };
  const handleReset = () => { setStep("params"); setPreview(null); setSavedId(0); };
  const handleTabChange = (tab: TabId) => { setActiveTab(tab); handleReset(); };

  const tabDefs = [
    { id: "context" as TabId, label: "Sinh từ ngữ cảnh", icon: Wand2, desc: "AI đọc ngữ cảnh → sinh email phishing mới" },
    { id: "similar" as TabId, label: "Sinh biến thể", icon: Copy, desc: "AI lấy kịch bản có sẵn làm mẫu → sinh biến thể" },
  ];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/quan-ly/tao-chien-dich")}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all shrink-0"
          style={{ border: "1px solid #E2E8F0" }}
        >
          <ChevronLeft size={18} style={{ color: "#475569" }} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
              Sinh kịch bản AI
            </h1>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Building2 size={11} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6366F1", letterSpacing: "0.06em" }}>NỘI BỘ CÔNG TY</span>
            </div>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: 2 }}>
            Dùng AI tạo kịch bản phishing riêng cho chiến dịch đào tạo nhân viên — không cần Admin duyệt
          </p>
        </div>
        <button
          onClick={() => navigate("/quan-ly/tao-chien-dich")}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50"
          style={{ border: "1px solid #E2E8F0", color: "#475569" }}
        >
          <Sparkles size={14} style={{ color: "#6366F1" }} /> Tạo chiến dịch
        </button>
      </div>

      {/* Tabs */}
      {step === "params" && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {tabDefs.map(({ id, label, icon: Icon, desc }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                  borderRadius: 14, border: `2px solid ${isActive ? "#6366F1" : "#E2E8F0"}`,
                  background: isActive ? "#F0F0FE" : "#fff",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  transition: "all 0.15s", flex: "1 1 260px",
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: isActive ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "#F1F5F9",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: isActive ? "#fff" : "#94A3B8" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: isActive ? "#4F46E5" : "#0F172A", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: "0.73rem", color: "#94A3B8" }}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === "params" && (
          <motion.div key="params" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeTab === "context"
              ? <TabContext onPreview={handlePreview} />
              : <TabSimilar onPreview={handlePreview} />}
          </motion.div>
        )}

        {step === "preview" && preview && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PreviewEditPanel preview={preview} onBack={handleReset} onSaved={handleSaved} />
          </motion.div>
        )}

        {step === "saved" && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflow: "hidden",
            }}>
              <SavedScreen scenarioId={savedId} onReset={handleReset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 40, border: "1.5px solid #E2E8F0", borderRadius: 10,
  padding: "0 12px", fontSize: "0.875rem", color: "#334155", outline: "none",
  fontFamily: "'Be Vietnam Pro', sans-serif", background: "#FAFAFA", boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "0 20px", height: 42, borderRadius: 10,
  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
  color: "#fff", fontWeight: 700, fontSize: "0.875rem", border: "none",
  cursor: "pointer", fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: "nowrap",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "0 16px", height: 40, borderRadius: 10, background: "#fff",
  color: "#475569", fontWeight: 600, fontSize: "0.85rem",
  border: "1.5px solid #E2E8F0", cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: "nowrap",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", padding: "6px 12px",
  borderRadius: 8, background: "transparent", color: "#64748B",
  fontWeight: 600, fontSize: "0.82rem", border: "none", cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
};

const sectionTitle: React.CSSProperties = { fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" };
