import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Database, Plus, Search, Tag, Loader2, X, Sparkles,
  Calendar, BookOpen, ChevronRight, AlertCircle, Wand2,
} from "lucide-react";
import { aiKnowledgeService } from "../../services/aiKnowledgeService";
import { AdminAITaoKichBan } from "./AdminAITaoKichBan";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { id: 1, name: "Dễ" },
  { id: 2, name: "Trung bình" },
  { id: 3, name: "Khó" },
];

const DIFF_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#ECFDF5", text: "#059669" },
  2: { bg: "#FFF7ED", text: "#D97706" },
  3: { bg: "#FEF2F2", text: "#DC2626" },
};

interface KnowledgeItem {
  id: number;
  title: string;
  contextDescription: string;
  tags: string | null;
  difficultyId: number;
  difficultyName: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  title: "",
  contextDescription: "",
  sampleEmailContent: "",
  tags: "",
  difficultyId: 1,
  sourceType: "AdminManual",
  sourceUrl: "",
};

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (item: KnowledgeItem) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr("Tiêu đề không được để trống."); return; }
    if (!form.contextDescription.trim()) { setErr("Mô tả ngữ cảnh không được để trống."); return; }
    setSaving(true);
    setErr(null);
    try {
      const created = await aiKnowledgeService.create({
        ...form,
        difficultyId: Number(form.difficultyId),
      });
      onCreated(created as KnowledgeItem);
    } catch (e: any) {
      setErr(e?.message || "Lưu thất bại, thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,22,50,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={18} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Thêm ngữ cảnh mới</p>
              <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Ngữ cảnh dùng làm "cảm hứng" cho AI sinh kịch bản</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Tiêu đề <span style={{ color: "#DC2626" }}>*</span></label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Giả mạo email xác nhận ngân hàng" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mô tả ngữ cảnh <span style={{ color: "#DC2626" }}>*</span></label>
            <textarea value={form.contextDescription} onChange={(e) => set("contextDescription", e.target.value)}
              placeholder="Mô tả loại kịch bản phishing muốn AI tạo..." rows={4} style={{ ...inputStyle, resize: "vertical", height: "auto" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Độ khó</label>
              <select value={form.difficultyId} onChange={(e) => set("difficultyId", e.target.value)} style={inputStyle}>
                {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags (phân cách bằng dấu phẩy)</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="VD: banking, urgent" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email mẫu tham khảo <span style={{ color: "#94A3B8", fontWeight: 400 }}>(tuỳ chọn)</span></label>
            <textarea value={form.sampleEmailContent} onChange={(e) => set("sampleEmailContent", e.target.value)}
              placeholder="Paste nội dung email thật để AI tham khảo phong cách..." rows={3} style={{ ...inputStyle, resize: "vertical", height: "auto" }} />
          </div>
          <div>
            <label style={labelStyle}>Nguồn tham khảo (URL) <span style={{ color: "#94A3B8", fontWeight: 400 }}>(tuỳ chọn)</span></label>
            <input value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
          {err && (
            <div style={{ padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0 }} />
              <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>{err}</p>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={btnSecondary}>Huỷ</button>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : <><Plus size={14} /> Thêm ngữ cảnh</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Knowledge Base Tab ───────────────────────────────────────────────────────

function KhoNguCanh() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const load = (tag?: string) => {
    setLoading(true);
    setError(null);
    const req = tag?.trim()
      ? aiKnowledgeService.searchByTag(tag.trim())
      : aiKnowledgeService.getAll();
    (req as Promise<KnowledgeItem[]>)
      .then(setItems)
      .catch((e: any) => setError(e?.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => load(tagInput);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const handleClearSearch = () => { setTagInput(""); load(); };
  const handleCreated = (item: KnowledgeItem) => { setItems((prev) => [item, ...prev]); setShowModal(false); };
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-5">
      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Kho ngữ cảnh</p>
          <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2 }}>
            Mỗi ngữ cảnh là "cảm hứng" để AI sinh kịch bản phishing phù hợp
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <Plus size={15} /> Thêm ngữ cảnh
        </button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, maxWidth: 360, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "0 12px", height: 40 }}>
          <Tag size={14} style={{ color: "#94A3B8", flexShrink: 0 }} />
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Tìm theo tag (vd: banking)"
            style={{ flex: 1, border: "none", outline: "none", fontSize: "0.85rem", color: "#334155", background: "transparent" }} />
          {tagInput && <button onClick={handleClearSearch} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><X size={13} /></button>}
        </div>
        <button onClick={handleSearch} style={btnSecondary}><Search size={13} /> Tìm</button>
        {tagInput && <button onClick={handleClearSearch} style={{ ...btnSecondary, color: "#94A3B8" }}>Xem tất cả</button>}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, gap: 10, color: "#94A3B8" }}>
          <Loader2 size={20} className="animate-spin" /><span>Đang tải...</span>
        </div>
      ) : error ? (
        <div style={{ padding: "24px 20px", textAlign: "center" }}>
          <AlertCircle size={30} style={{ color: "#DC2626", margin: "0 auto 8px" }} />
          <p style={{ color: "#DC2626", fontSize: "0.88rem" }}>{error}</p>
          <button onClick={() => load()} style={{ ...btnSecondary, marginTop: 10 }}>Thử lại</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Database size={24} style={{ color: "#8B5CF6" }} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", marginBottom: 4 }}>
            {tagInput ? "Không tìm thấy ngữ cảnh nào" : "Chưa có ngữ cảnh nào"}
          </p>
          <p style={{ fontSize: "0.82rem", color: "#94A3B8", marginBottom: 16 }}>
            {tagInput ? `Không có ngữ cảnh nào có tag "${tagInput}"` : "Thêm ngữ cảnh đầu tiên để AI có thể sinh kịch bản"}
          </p>
          {!tagInput && <button onClick={() => setShowModal(true)} style={btnPrimary}><Plus size={14} /> Thêm ngữ cảnh đầu tiên</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {items.map((item, i) => {
            const diff = DIFF_COLORS[item.difficultyId] || DIFF_COLORS[2];
            const diffName = item.difficultyName || DIFFICULTIES.find(d => d.id === item.difficultyId)?.name || "—";
            const tags = item.tags?.split(",").map(t => t.trim()).filter(Boolean) || [];
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0F172A", lineHeight: 1.4, flex: 1 }}>{item.title}</p>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: diff.bg, color: diff.text, whiteSpace: "nowrap", flexShrink: 0 }}>{diffName}</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "#64748B", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.contextDescription}
                </p>
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {tags.slice(0, 5).map((tag) => (
                      <span key={tag} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "#F0F4FF", color: "#4F46E5" }}>#{tag}</span>
                    ))}
                    {tags.length > 5 && <span style={{ fontSize: "0.65rem", color: "#94A3B8" }}>+{tags.length - 5}</span>}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8" }}>
                    <Calendar size={11} />
                    <span style={{ fontSize: "0.68rem" }}>{fmtDate(item.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6366F1" }}>ID: {item.id}</span>
                    <ChevronRight size={12} style={{ color: "#CBD5E1" }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && items.length > 0 && (
        <p style={{ fontSize: "0.75rem", color: "#94A3B8", textAlign: "center" }}>
          <BookOpen size={11} style={{ display: "inline", marginRight: 4 }} />
          {items.length} ngữ cảnh{tagInput ? ` có tag "${tagInput}"` : " trong kho"}
        </p>
      )}

      <AnimatePresence>
        {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = "kho" | "sinh";

export function AdminAIController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = tabParam === "sinh" ? "sinh" : "kho";

  const setTab = (tab: TabId) => {
    setSearchParams(tab === "kho" ? {} : { tab });
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "kho", label: "Kho ngữ cảnh", icon: Database, desc: "Quản lý ngữ cảnh cho AI" },
    { id: "sinh", label: "Sinh kịch bản", icon: Wand2, desc: "AI tạo email phishing" },
  ];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
            Bộ điều khiển AI
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: 4 }}>
            Quản lý ngữ cảnh và sinh kịch bản phishing bằng AI (OpenRouter)
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", background: "#F1F5F9", borderRadius: 12 }}>
          <Sparkles size={13} style={{ color: "#8B5CF6", marginLeft: 4 }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6D28D9", marginRight: 4 }}>OpenRouter AI</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 14, padding: 4, width: "fit-content" }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: "0.875rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#4F46E5" : "#64748B",
                background: active ? "#fff" : "transparent",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "kho" ? (
          <motion.div key="kho" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <KhoNguCanh />
          </motion.div>
        ) : (
          <motion.div key="sinh" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <AdminAITaoKichBan hideHeader />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: "0.875rem",
  color: "#334155",
  outline: "none",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  background: "#FAFAFA",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 18px",
  height: 40,
  borderRadius: 10,
  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.85rem",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  whiteSpace: "nowrap",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 16px",
  height: 40,
  borderRadius: 10,
  background: "#fff",
  color: "#475569",
  fontWeight: 600,
  fontSize: "0.85rem",
  border: "1.5px solid #E2E8F0",
  cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  whiteSpace: "nowrap",
};
