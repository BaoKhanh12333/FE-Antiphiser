import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  ACHIEVEMENT_DEFS,
  RARITY_CONFIG,
  AchievementRarity,
  ConditionType,
  CONDITION_TYPE_LABELS,
  CustomAchievementParams,
  loadCustomAchievements,
  saveCustomAchievements,
  paramsToAchievementDef,
} from "../../data/achievements";

const RARITY_ORDER: AchievementRarity[] = ["bronze", "silver", "gold", "platinum"];

const EMOJI_PRESETS = ["🎯", "⚡", "🔥", "🛡️", "📚", "🏆", "💯", "💎", "🌟", "🚀", "👑", "🎖️", "🦅", "🧠", "💪", "🎓"];

function RarityBadge({ rarity }: { rarity: AchievementRarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <span style={{
      display: "inline-block", fontSize: "0.65rem", fontWeight: 700,
      background: cfg.badgeBg, color: cfg.badgeText,
      border: `1px solid ${cfg.borderColor}60`, padding: "2px 9px", borderRadius: 99,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
interface ModalProps {
  onClose: () => void;
  onSave: (p: CustomAchievementParams) => void;
}

const BLANK_FORM = {
  icon: "🎯",
  title: "",
  desc: "",
  rarity: "bronze" as AchievementRarity,
  unlockMsg: "",
  conditionType: "processedEmails_gte" as ConditionType,
  conditionValue: 1,
};

function AddModal({ onClose, onSave }: ModalProps) {
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [error, setError] = useState("");

  function set<K extends keyof typeof BLANK_FORM>(key: K, val: (typeof BLANK_FORM)[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setError("");
  }

  function handleSubmit() {
    if (!form.title.trim()) { setError("Vui lòng nhập tên thành tựu."); return; }
    if (!form.desc.trim())  { setError("Vui lòng nhập mô tả."); return; }
    if (!form.unlockMsg.trim()) { setError("Vui lòng nhập tin nhắn mở khoá."); return; }
    if (form.conditionValue < 1) { setError("Ngưỡng phải ≥ 1."); return; }

    const id = `custom_${Date.now()}`;
    onSave({ id, ...form });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid #E2E8F0", fontSize: "0.85rem", outline: "none",
    fontFamily: "'Be Vietnam Pro', sans-serif", color: "#0F172A",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 80px rgba(15,23,42,0.18)", fontFamily: "'Be Vietnam Pro', sans-serif",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0F172A" }}>Thêm thành tựu mới</h2>
          <button onClick={onClose} style={{ color: "#94A3B8", lineHeight: 0 }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Icon picker */}
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {EMOJI_PRESETS.map(e => (
                <button
                  key={e}
                  onClick={() => set("icon", e)}
                  style={{
                    fontSize: "1.4rem", width: 40, height: 40, borderRadius: 8, border: "1.5px solid",
                    borderColor: form.icon === e ? "#6366F1" : "#E2E8F0",
                    background: form.icon === e ? "#EEF2FF" : "#F8FAFC",
                    cursor: "pointer",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              style={inputStyle}
              placeholder="Hoặc nhập emoji tự do..."
              value={form.icon}
              onChange={e => set("icon", e.target.value)}
              maxLength={4}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Tên thành tựu *</label>
            <input style={inputStyle} placeholder="VD: Siêu sao" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          {/* Desc */}
          <div>
            <label style={labelStyle}>Mô tả *</label>
            <input style={inputStyle} placeholder="VD: Hoàn thành 200 email mô phỏng" value={form.desc} onChange={e => set("desc", e.target.value)} />
          </div>

          {/* Rarity */}
          <div>
            <label style={labelStyle}>Hạng *</label>
            <div style={{ display: "flex", gap: 8 }}>
              {RARITY_ORDER.map(r => {
                const cfg = RARITY_CONFIG[r];
                const sel = form.rarity === r;
                return (
                  <button
                    key={r}
                    onClick={() => set("rarity", r)}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${sel ? cfg.borderColor : "#E2E8F0"}`,
                      background: sel ? cfg.bgGrad : "#F8FAFC",
                      fontSize: "0.72rem", fontWeight: 700, color: sel ? cfg.textColor : "#94A3B8",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <div>
              <label style={labelStyle}>Loại điều kiện *</label>
              <select
                style={{ ...inputStyle, background: "#fff" }}
                value={form.conditionType}
                onChange={e => set("conditionType", e.target.value as ConditionType)}
              >
                {(Object.keys(CONDITION_TYPE_LABELS) as ConditionType[]).map(k => (
                  <option key={k} value={k}>{CONDITION_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div style={{ width: 90 }}>
              <label style={labelStyle}>Ngưỡng (N) *</label>
              <input
                style={inputStyle}
                type="number"
                min={1}
                value={form.conditionValue}
                onChange={e => set("conditionValue", Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>

          {/* Unlock message */}
          <div>
            <label style={labelStyle}>Tin nhắn mở khoá *</label>
            <input style={inputStyle} placeholder="VD: Bạn vừa trở thành siêu sao!" value={form.unlockMsg} onChange={e => set("unlockMsg", e.target.value)} />
          </div>

          {error && (
            <p style={{ fontSize: "0.78rem", color: "#EF4444", fontWeight: 600 }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #E2E8F0",
                background: "#F8FAFC", fontSize: "0.85rem", fontWeight: 700, color: "#64748B", cursor: "pointer",
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 2, padding: "10px 0", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                fontSize: "0.85rem", fontWeight: 800, color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              }}
            >
              Lưu thành tựu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminAchievements() {
  const [customDefs, setCustomDefs] = useState<CustomAchievementParams[]>(() => loadCustomAchievements());
  const [showModal, setShowModal] = useState(false);

  const allCount = ACHIEVEMENT_DEFS.length + customDefs.length;

  function handleSave(p: CustomAchievementParams) {
    const updated = [...customDefs, p];
    setCustomDefs(updated);
    saveCustomAchievements(updated);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    const updated = customDefs.filter(d => d.id !== id);
    setCustomDefs(updated);
    saveCustomAchievements(updated);
  }

  const byRarity = RARITY_ORDER.map(r => ({
    rarity: r,
    builtIn: ACHIEVEMENT_DEFS.filter(d => d.rarity === r),
    custom: customDefs.filter(d => d.rarity === r),
  }));

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800">Quản lý Thành tựu</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {allCount} thành tựu tổng ({ACHIEVEMENT_DEFS.length} tích hợp sẵn, {customDefs.length} tuỳ chỉnh) — {RARITY_ORDER.length} hạng
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.28)",
            fontFamily: "'Be Vietnam Pro', sans-serif",
          }}
        >
          <Plus size={16} />
          Thêm thành tựu
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {RARITY_ORDER.map(r => {
          const cfg = RARITY_CONFIG[r];
          const count = ACHIEVEMENT_DEFS.filter(d => d.rarity === r).length + customDefs.filter(d => d.rarity === r).length;
          return (
            <div key={r} style={{ borderRadius: 14, padding: "14px 16px", background: cfg.bgGrad, border: `1.5px solid ${cfg.borderColor}`, boxShadow: cfg.glowShadow }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, color: cfg.textColor, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Hạng {cfg.label}
              </p>
              <p style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: "0.72rem", color: cfg.textColor, marginTop: 2 }}>thành tựu</p>
            </div>
          );
        })}
      </div>

      {/* Per-rarity tables */}
      {byRarity.map(({ rarity, builtIn, custom }) => {
        const cfg = RARITY_CONFIG[rarity];
        const total = builtIn.length + custom.length;
        if (total === 0) return null;

        return (
          <div key={rarity} style={{ borderRadius: 16, border: `1.5px solid ${cfg.borderColor}40`, background: "#fff", boxShadow: "0 4px 16px rgba(15,23,42,0.03)", overflow: "hidden" }}>
            {/* Section header */}
            <div style={{ padding: "12px 20px", background: cfg.bgGrad, borderBottom: `1px solid ${cfg.borderColor}30`, display: "flex", alignItems: "center", gap: 10 }}>
              <RarityBadge rarity={rarity} />
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: cfg.textColor }}>
                {total} thành tựu hạng {cfg.label}
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Icon", "Tên thành tựu", "Mô tả", "Điều kiện", "Ngưỡng", "Tin nhắn mở khoá", ""].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 16px", textAlign: i === 4 ? "center" : "left",
                        fontWeight: 700, color: "#64748B", fontSize: "0.68rem",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        width: i === 0 ? 48 : i === 4 ? 80 : i === 6 ? 52 : undefined,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Built-in rows */}
                  {builtIn.map((def, i) => {
                    const prog = def.progress({ processedEmails: 999, correctDetections: 999, trickedTimes: 0, completedLessons: 999 });
                    return (
                      <tr key={def.id} style={{ borderTop: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                        <td style={{ padding: "12px 16px", fontSize: "1.5rem", textAlign: "center" }}>{def.icon}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 800, color: "#0F172A" }}>{def.title}</div>
                          <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 1 }}>ID: {def.id}</div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>{def.desc}</td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>{BUILTIN_CONDITION_LABEL[def.id] ?? "—"}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ display: "inline-block", fontWeight: 800, fontSize: "0.9rem", color: cfg.textColor, background: cfg.badgeBg, borderRadius: 8, padding: "2px 10px" }}>
                            {prog.max}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748B", fontStyle: "italic", fontSize: "0.78rem" }}>"{def.unlockMsg}"</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.62rem", color: "#94A3B8", fontWeight: 600, background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>Tích hợp</span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Custom rows */}
                  {custom.map((def, i) => {
                    const def2 = paramsToAchievementDef(def);
                    const prog = def2.progress({ processedEmails: 999, correctDetections: 999, trickedTimes: 0, completedLessons: 999 });
                    const rowBg = (builtIn.length + i) % 2 === 0 ? "#fff" : "#FAFBFF";
                    return (
                      <tr key={def.id} style={{ borderTop: "1px solid #F1F5F9", background: rowBg }}>
                        <td style={{ padding: "12px 16px", fontSize: "1.5rem", textAlign: "center" }}>{def.icon}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 800, color: "#0F172A" }}>{def.title}</div>
                          <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 1 }}>ID: {def.id}</div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>{def.desc}</td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>{CONDITION_TYPE_LABELS[def.conditionType]}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ display: "inline-block", fontWeight: 800, fontSize: "0.9rem", color: cfg.textColor, background: cfg.badgeBg, borderRadius: 8, padding: "2px 10px" }}>
                            {prog.max}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748B", fontStyle: "italic", fontSize: "0.78rem" }}>"{def.unlockMsg}"</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDelete(def.id)}
                            title="Xoá thành tựu"
                            style={{ color: "#EF4444", lineHeight: 0, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Empty custom state */}
      {customDefs.length === 0 && (
        <div style={{
          borderRadius: 16, border: "1.5px dashed #E2E8F0", padding: "32px 24px",
          textAlign: "center", color: "#94A3B8",
        }}>
          <p style={{ fontSize: "1.8rem", marginBottom: 8 }}>🏅</p>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#64748B" }}>Chưa có thành tựu tuỳ chỉnh</p>
          <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Nhấn "Thêm thành tựu" để tạo thành tựu mới ngoài danh sách tích hợp sẵn.</p>
        </div>
      )}

      {showModal && <AddModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}

const BUILTIN_CONDITION_LABEL: Record<string, string> = {
  first_email:   "processedEmails ≥ 1",
  diligent:      "processedEmails ≥ 10",
  sharp_eye:     "correctDetections ≥ 5",
  warrior:       "processedEmails ≥ 50",
  lesson_master: "completedLessons ≥ 10",
  expert:        "correctDetections ≥ 20",
  century:       "processedEmails ≥ 100",
  invincible:    "trickedTimes = 0 & processedEmails ≥ 5",
};
