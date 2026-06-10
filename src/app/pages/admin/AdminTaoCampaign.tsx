import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  ShieldAlert, BookOpen, Users, Search, PlusCircle, X,
  Mail, AlertTriangle, Eye, EyeOff,
} from "lucide-react";
import { campaignService }  from "../../services/campaignService";
import { scenarioService }  from "../../services/scenarioService";
import { lessonService }    from "../../services/lessonService";
import { userService }      from "../../services/userService";
import { AnimatePresence, motion } from "framer-motion";

/* ── Types ─────────────────────────────────────────────── */
type Scenario = {
  scenarioId: number; title: string; difficultyId: number;
  difficultyName: string | null; categoryId: number;
  categoryName: string | null; isPhishing: boolean; isActive: boolean;
};
type User    = { userId: number; fullName: string; email: string; isActive: boolean; };
type Lesson  = { lessonId: number; title: string; phaseNumber: number; };

interface NewScenarioForm {
  title: string; description: string; subject: string;
  senderName: string; senderEmail: string; recipientName: string;
  emailBodyHtml: string; isPhishing: boolean; phishingIndicators: string;
  explanationHint: string; categoryId: string; difficultyId: string;
}

const EMPTY_FORM: NewScenarioForm = {
  title: "", description: "", subject: "",
  senderName: "", senderEmail: "", recipientName: "",
  emailBodyHtml: "", isPhishing: true, phishingIndicators: "",
  explanationHint: "", categoryId: "", difficultyId: "",
};

const DIFF_META: Record<number, { label: string; color: string }> = {
  1: { label: "Dễ",         color: "#10B981" },
  2: { label: "Trung bình", color: "#F59E0B" },
  3: { label: "Khó",        color: "#EF4444" },
};

/* ── Helpers ────────────────────────────────────────────── */
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

/* ── Section card ───────────────────────────────────────── */
function SectionCard({
  title, icon: Icon, count, total, action, children,
}: {
  title: string; icon: React.ElementType;
  count?: number; total?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={17} style={{ color: "#6366F1" }} />
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{title}</h2>
        {count !== undefined && (
          <span className="ml-auto mr-2" style={{ fontSize: "0.78rem", fontWeight: 600, color: count > 0 ? "#6366F1" : "#94A3B8" }}>
            {count > 0 ? `${count}${total !== undefined ? `/${total}` : ""} đã chọn` : "Chưa chọn"}
          </span>
        )}
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── CreateScenarioModal ────────────────────────────────── */
function CreateScenarioModal({
  categories, difficulties, onClose, onCreated,
}: {
  categories: { id: number; name: string }[];
  difficulties: { id: number; name: string }[];
  onClose: () => void;
  onCreated: (scenario: Scenario) => void;
}) {
  const [form, setForm]         = useState<NewScenarioForm>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [preview, setPreview]   = useState(false);

  const set = (k: keyof NewScenarioForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const valid = form.title && form.subject && form.senderName &&
    form.senderEmail && form.recipientName && form.emailBodyHtml &&
    form.explanationHint && form.categoryId && form.difficultyId;

  async function handleSave() {
    if (!valid) return;
    setSaving(true); setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject.trim(),
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        recipientName: form.recipientName.trim(),
        emailBodyHtml: form.emailBodyHtml.trim(),
        isPhishing: form.isPhishing,
        phishingIndicators: form.phishingIndicators.trim() || null,
        explanationHint: form.explanationHint.trim(),
        categoryId: Number(form.categoryId),
        difficultyId: Number(form.difficultyId),
      };
      const created = await scenarioService.createScenario(payload) as Scenario;
      onCreated(created);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Không thể tạo kịch bản.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition";

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full bg-white rounded-3xl flex flex-col"
        style={{ maxWidth: 680, maxHeight: "90vh", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)" }}>
            <ShieldAlert size={15} className="text-indigo-500" />
          </div>
          <h3 className="font-bold text-slate-800" style={{ fontSize: "1rem" }}>Tạo kịch bản phishing mới</h3>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"><X size={16} /></button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold" style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.15)", color: "#991B1B" }}>
              <AlertTriangle size={14} className="shrink-0" />{error}
            </div>
          )}

          {/* Row 1: title + isPhishing toggle */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tiêu đề kịch bản <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Vd: Email thưởng cuối năm giả mạo" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Loại</label>
              <button type="button" onClick={() => set("isPhishing", !form.isPhishing)}
                className="w-full h-[42px] rounded-xl font-bold text-sm transition-all"
                style={{ background: form.isPhishing ? "#FEF2F2" : "#ECFDF5", color: form.isPhishing ? "#DC2626" : "#059669", border: `1px solid ${form.isPhishing ? "#FECACA" : "#A7F3D0"}` }}>
                {form.isPhishing ? "Phishing" : "Hợp lệ"}
              </button>
            </div>
          </div>

          {/* Row 2: category + difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Danh mục <span className="text-red-400">*</span></label>
              <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={inputCls}>
                <option value="">— Chọn danh mục —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Độ khó <span className="text-red-400">*</span></label>
              <select value={form.difficultyId} onChange={e => set("difficultyId", e.target.value)} className={inputCls}>
                <option value="">— Chọn độ khó —</option>
                {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mô tả nhiệm vụ</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Học viên cần kiểm tra email sau và xác định đây có phải phishing không..."
              rows={2} className={inputCls + " resize-none"} />
          </div>

          {/* Email fields */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.08)" }}>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide flex items-center gap-1.5"><Mail size={11} /> Nội dung email mô phỏng</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên người gửi <span className="text-red-400">*</span></label>
                <input value={form.senderName} onChange={e => set("senderName", e.target.value)} placeholder="Phòng Nhân sự" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email người gửi <span className="text-red-400">*</span></label>
                <input type="email" value={form.senderEmail} onChange={e => set("senderEmail", e.target.value)} placeholder="hr@congty-fake.vn" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tiêu đề email (Subject) <span className="text-red-400">*</span></label>
                <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="[Quan trọng] Xác nhận thưởng cuối năm" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên người nhận <span className="text-red-400">*</span></label>
                <input value={form.recipientName} onChange={e => set("recipientName", e.target.value)} placeholder="Nhân viên" className={inputCls} />
              </div>
            </div>

            {/* Email body with preview toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500">Nội dung email (HTML) <span className="text-red-400">*</span></label>
                <button type="button" onClick={() => setPreview(p => !p)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                  {preview ? <><EyeOff size={11} /> Chỉnh sửa</> : <><Eye size={11} /> Xem trước</>}
                </button>
              </div>
              {preview ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-auto" style={{ minHeight: 120, maxHeight: 200, fontSize: "0.85rem" }}
                  dangerouslySetInnerHTML={{ __html: form.emailBodyHtml || "<p class='text-slate-400'>Chưa có nội dung</p>" }} />
              ) : (
                <textarea value={form.emailBodyHtml} onChange={e => set("emailBodyHtml", e.target.value)}
                  placeholder="<p>Kính gửi {TenNhanVien},</p><p>Bạn đã được chọn nhận thưởng...</p>"
                  rows={5} className={inputCls + " resize-none font-mono text-xs"} />
              )}
            </div>
          </div>

          {/* Phishing indicators + explanation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Dấu hiệu lừa đảo</label>
              <textarea value={form.phishingIndicators} onChange={e => set("phishingIndicators", e.target.value)}
                placeholder="Domain giả, link rút gọn, tạo áp lực thời gian..."
                rows={3} className={inputCls + " resize-none"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lời giải thích sau khi làm <span className="text-red-400">*</span></label>
              <textarea value={form.explanationHint} onChange={e => set("explanationHint", e.target.value)}
                placeholder="Đây là email lừa đảo vì... Bạn nên..."
                rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Hủy</button>
          <button onClick={handleSave} disabled={!valid || saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: valid && !saving ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "rgba(99,102,241,0.4)", cursor: valid && !saving ? "pointer" : "not-allowed" }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Đang tạo...</> : <><PlusCircle size={14} /> Tạo & thêm vào campaign</>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────── */
export function AdminTaoCampaign() {
  const navigate = useNavigate();

  /* form state */
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<number[]>([]);
  const [selectedUserIds,     setSelectedUserIds]     = useState<number[]>([]);
  const [selectedLessonIds,   setSelectedLessonIds]   = useState<number[]>([]);

  /* data */
  const [scenarios,  setScenarios]  = useState<Scenario[]>([]);
  const [allUsers,   setAllUsers]   = useState<User[]>([]);
  const [lessons,    setLessons]    = useState<Lesson[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);

  /* filters */
  const [scenarioSearch, setScenarioSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "phishing" | "legit">("all");
  const [userSearch, setUserSearch] = useState("");

  /* submit */
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [partialId,   setPartialId]   = useState<number | null>(null);
  const [done,        setDone]        = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ id: number; name: string } | null>(null);

  /* inline scenario modal */
  const [showCreateScenario, setShowCreateScenario] = useState(false);

  /* Load */
  useEffect(() => {
    let alive = true;
    Promise.all([
      scenarioService.getAllScenarios(),
      userService.getAllAccounts("", 1, 9999),
      lessonService.getAllLessons(),
    ])
      .then(([sc, usersData, ls]) => {
        if (!alive) return;
        setScenarios((sc ?? []).filter((s: Scenario) => s.isActive));
        setAllUsers((usersData?.items ?? []).filter((u: User) => u.isActive));
        setLessons(ls ?? []);
      })
      .catch((err: Error) => { if (alive) setLoadError(err.message || "Lỗi tải dữ liệu"); })
      .finally(() => { if (alive) setLoadingData(false); });
    return () => { alive = false; };
  }, []);

  /* Derived categories + difficulties from loaded scenarios */
  const categories = useMemo(() => {
    const seen = new Set<number>();
    const list: { id: number; name: string }[] = [];
    for (const s of scenarios) {
      if (s.categoryId && !seen.has(s.categoryId) && s.categoryName) {
        seen.add(s.categoryId);
        list.push({ id: s.categoryId, name: s.categoryName });
      }
    }
    return list;
  }, [scenarios]);

  const difficulties = useMemo(() => {
    const seen = new Set<number>();
    const list: { id: number; name: string }[] = [];
    for (const s of scenarios) {
      if (s.difficultyId && !seen.has(s.difficultyId) && s.difficultyName) {
        seen.add(s.difficultyId);
        list.push({ id: s.difficultyId, name: s.difficultyName });
      }
    }
    return list.sort((a, b) => a.id - b.id);
  }, [scenarios]);

  const filteredScenarios = scenarios.filter(s => {
    if (diffFilter !== "all" && s.difficultyId !== diffFilter) return false;
    if (typeFilter === "phishing" && !s.isPhishing) return false;
    if (typeFilter === "legit" && s.isPhishing) return false;
    if (scenarioSearch && !s.title.toLowerCase().includes(scenarioSearch.toLowerCase())) return false;
    return true;
  });

  const filteredUsers = allUsers.filter(u =>
    !userSearch || u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  function toggleId(id: number, list: number[], setList: (l: number[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  function handleScenarioCreated(newS: Scenario) {
    const withActive = { ...newS, isActive: true };
    setScenarios(prev => [withActive, ...prev]);
    setSelectedScenarioIds(prev => [...prev, newS.scenarioId]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true); setSubmitError(null); setPartialId(null);
    try {
      const payload: Record<string, unknown> = {
        campaignName: name.trim(),
        scenarioIds: selectedScenarioIds,
        requiredLessonIds: selectedLessonIds,
      };
      if (desc.trim())            payload.description = desc.trim();
      if (startDate)              payload.startDate   = startDate;
      if (endDate)                payload.endDate     = endDate;
      if (selectedUserIds.length) payload.userIds     = selectedUserIds;

      const created = await campaignService.createCampaign(payload) as { campaignId: number };
      const cid = created.campaignId;
      try {
        await campaignService.activateCampaign(cid);
        setCreatedInfo({ id: cid, name: name.trim() });
        setDone(true);
      } catch (putErr: unknown) {
        const msg = putErr instanceof Error ? putErr.message : "Lỗi không xác định";
        setPartialId(cid);
        setSubmitError(`Campaign đã tạo (ID ${cid}) nhưng chưa activate được: ${msg}.`);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Lỗi tạo chiến dịch");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Done screen ── */
  if (done && createdInfo) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
          <CheckCircle2 size={32} style={{ color: "#059669" }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>Chiến dịch đã kích hoạt!</h2>
        <p className="text-slate-500 mt-2" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
          <strong style={{ color: "#0F172A" }}>{createdInfo.name}</strong> (ID: {createdInfo.id}) đã tạo thành công.<br />
          <span style={{ color: "#6366F1" }}>{selectedScenarioIds.length}</span> kịch bản ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedUserIds.length}</span> người dùng ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedLessonIds.length}</span> bài điều kiện.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setDone(false); setCreatedInfo(null);
              setName(""); setDesc(""); setStartDate(""); setEndDate("");
              setSelectedScenarioIds([]); setSelectedUserIds([]); setSelectedLessonIds([]);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ border: "1px solid #E2E8F0", color: "#64748B" }}
          >Tạo thêm</button>
          <button onClick={() => navigate("/quan-tri")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            Về tổng quan
          </button>
        </div>
      </div>
    );
  }

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
        <button onClick={() => window.location.reload()} className="text-indigo-600 text-sm font-semibold hover:underline">Thử lại</button>
      </div>
    );
  }

  const inputStyle = { border: "1px solid #E2E8F0", fontSize: "0.88rem" as const, color: "#0F172A", outline: "none" };

  return (
    <>
      <AnimatePresence>
        {showCreateScenario && (
          <CreateScenarioModal
            categories={categories}
            difficulties={difficulties}
            onClose={() => setShowCreateScenario(false)}
            onCreated={handleScenarioCreated}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/quan-tri")}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all shrink-0"
            style={{ border: "1px solid #E2E8F0" }}>
            <ChevronLeft size={18} style={{ color: "#475569" }} />
          </button>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>Tạo chiến dịch mới</h1>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.82rem" }}>Điền thông tin, thêm kịch bản và giao cho người dùng</p>
          </div>
        </div>

        {/* ── 1. Thông tin campaign ── */}
        <SectionCard title="Thông tin chiến dịch" icon={PlusCircle}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tên chiến dịch <span style={{ color: "#EF4444" }}>*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Vd: Phishing Awareness Q3 2026" required
                className="w-full rounded-xl px-4 py-2.5" style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")} />
            </div>
            <div>
              <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô tả</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả ngắn về mục tiêu chiến dịch (tùy chọn)" rows={2}
                className="w-full rounded-xl px-4 py-2.5 resize-none" style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([["Ngày bắt đầu", startDate, setStartDate], ["Ngày kết thúc", endDate, setEndDate]] as [string, string, (v: string) => void][]).map(([label, val, set]) => (
                <div key={label}>
                  <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{label}</label>
                  <input type="date" value={val} onChange={e => set(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5" style={{ ...inputStyle, color: val ? "#0F172A" : "#94A3B8" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Kịch bản (+ tạo mới) ── */}
        <SectionCard
          title="Kịch bản mô phỏng"
          icon={ShieldAlert}
          count={selectedScenarioIds.length}
          total={scenarios.length}
          action={
            <button type="button" onClick={() => setShowCreateScenario(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", color: "#4F46E5", border: "1px solid rgba(99,102,241,0.2)" }}>
              <PlusCircle size={12} /> Tạo kịch bản mới
            </button>
          }
        >
          {/* Filters */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <Search size={14} style={{ color: "#94A3B8" }} className="shrink-0" />
              <input value={scenarioSearch} onChange={e => setScenarioSearch(e.target.value)} placeholder="Tìm kịch bản..."
                className="bg-transparent flex-1 text-slate-700" style={{ outline: "none", fontSize: "0.85rem" }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([["all", "Tất cả"], [1, "Dễ"], [2, "Trung bình"], [3, "Khó"]] as [number | "all", string][]).map(([val, lbl]) => (
                <button key={String(val)} type="button" onClick={() => setDiffFilter(val)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ background: diffFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC", border: diffFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0", color: diffFilter === val ? "#6366F1" : "#64748B" }}>
                  {lbl}
                </button>
              ))}
              <span style={{ width: 1, background: "#E2E8F0", display: "inline-block", margin: "0 4px" }} />
              {([["all", "Tất cả loại"], ["phishing", "Phishing"], ["legit", "Hợp lệ"]] as ["all" | "phishing" | "legit", string][]).map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => setTypeFilter(val)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ background: typeFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC", border: typeFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0", color: typeFilter === val ? "#6366F1" : "#64748B" }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto rounded-xl" style={{ maxHeight: 300, border: "1px solid #F1F5F9" }}>
            {filteredScenarios.length === 0
              ? <p className="text-center text-slate-400 py-8 text-sm">Không tìm thấy kịch bản phù hợp</p>
              : filteredScenarios.map(s => {
                  const selected = selectedScenarioIds.includes(s.scenarioId);
                  const diff = DIFF_META[s.difficultyId] ?? { label: "?", color: "#94A3B8" };
                  return (
                    <button key={s.scenarioId} type="button"
                      onClick={() => toggleId(s.scenarioId, selectedScenarioIds, setSelectedScenarioIds)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b last:border-b-0 hover:bg-slate-50"
                      style={{ background: selected ? "#ECFDF5" : "transparent", borderBottomColor: "#F1F5F9" }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                        style={{ background: selected ? "#059669" : "transparent", border: selected ? "none" : "1.5px solid #CBD5E1" }}>
                        {selected && <CheckCircle2 size={11} className="text-white" />}
                      </div>
                      <span className="flex-1 text-slate-700" style={{ fontSize: "0.85rem" }}>{s.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: `${diff.color}15`, color: diff.color }}>
                        {s.difficultyName ?? diff.label}
                      </span>
                      {s.isPhishing
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}>Phishing</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#ECFDF5", color: "#059669" }}>Hợp lệ</span>}
                    </button>
                  );
                })
            }
          </div>
          <p className="text-slate-400 mt-2" style={{ fontSize: "0.72rem" }}>
            Hiển thị {filteredScenarios.length}/{scenarios.length} kịch bản
          </p>
        </SectionCard>

        {/* ── 3. Người dùng ── */}
        <SectionCard title="Giao cho người dùng" icon={Users} count={selectedUserIds.length} total={allUsers.length}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <Search size={14} style={{ color: "#94A3B8" }} className="shrink-0" />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Tìm theo tên hoặc email..."
              className="bg-transparent flex-1 text-slate-700" style={{ outline: "none", fontSize: "0.85rem" }} />
          </div>
          {allUsers.length === 0
            ? <p className="text-slate-400 text-sm py-2">Chưa có người dùng nào.</p>
            : (
              <div className="overflow-y-auto rounded-xl space-y-1.5" style={{ maxHeight: 280 }}>
                {filteredUsers.map(u => {
                  const selected = selectedUserIds.includes(u.userId);
                  return (
                    <button key={u.userId} type="button"
                      onClick={() => toggleId(u.userId, selectedUserIds, setSelectedUserIds)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all"
                      style={{ background: selected ? "#ECFDF5" : "#F8FAFC", border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0" }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                        style={{ background: selected ? "#059669" : "transparent", border: selected ? "none" : "1.5px solid #CBD5E1" }}>
                        {selected && <CheckCircle2 size={11} className="text-white" />}
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "#6366F1" }}>
                        {initials(u.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>{u.fullName}</p>
                        <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{u.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          }
          {filteredUsers.length < allUsers.length && (
            <p className="text-slate-400 mt-2" style={{ fontSize: "0.72rem" }}>
              Hiển thị {filteredUsers.length}/{allUsers.length} người dùng
            </p>
          )}
        </SectionCard>

        {/* ── 4. Bài học điều kiện ── */}
        <SectionCard title="Bài học điều kiện (prerequisites)" icon={BookOpen} count={selectedLessonIds.length} total={lessons.length}>
          <p className="text-slate-400 mb-3" style={{ fontSize: "0.78rem" }}>Người dùng phải hoàn thành các bài này trước khi tham gia chiến dịch.</p>
          <div className="space-y-1.5">
            {lessons.map(l => {
              const selected = selectedLessonIds.includes(l.lessonId);
              return (
                <button key={l.lessonId} type="button"
                  onClick={() => toggleId(l.lessonId, selectedLessonIds, setSelectedLessonIds)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all"
                  style={{ background: selected ? "#ECFDF5" : "#F8FAFC", border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0" }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{ background: selected ? "#059669" : "transparent", border: selected ? "none" : "1.5px solid #CBD5E1" }}>
                    {selected && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <span className="flex-1 text-slate-700" style={{ fontSize: "0.85rem" }}>{l.title}</span>
                  <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>Giai đoạn {l.phaseNumber}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Error */}
        {submitError && (
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: partialId ? "#FFFBEB" : "#FEF2F2", border: `1px solid ${partialId ? "#FCD34D" : "#FECACA"}` }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: partialId ? "#D97706" : "#EF4444" }} />
            <p style={{ fontSize: "0.82rem", color: partialId ? "#92400E" : "#991B1B" }}>{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate("/quan-tri")}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-slate-100"
            style={{ color: "#64748B", border: "1px solid #E2E8F0" }}>Hủy</button>
          <button type="submit" disabled={!name.trim() || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{
              background: name.trim() && !submitting ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "rgba(99,102,241,0.4)",
              boxShadow: name.trim() && !submitting ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
              cursor: name.trim() && !submitting ? "pointer" : "not-allowed",
            }}>
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Đang tạo...</>
              : <><PlusCircle size={15} /> Tạo &amp; kích hoạt</>}
          </button>
        </div>
      </form>
    </>
  );
}
