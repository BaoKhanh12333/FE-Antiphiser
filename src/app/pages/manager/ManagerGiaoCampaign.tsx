import { useState } from "react";
import {
  BookOpen, ShieldAlert, Building2, Users, CheckCircle2,
  Clock, ChevronRight, Zap, Star, Lock, Search, Send,
  X, AlertTriangle, BarChart3,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */

const scenarioLibrary = [
  {
    id: 1,
    tag: "NGÂN HÀNG",
    tagColor: "#6366F1",
    tagBg: "rgba(99,102,241,0.12)",
    icon: "🏦",
    title: "Basic Banking Phishing Awareness",
    desc: "Nhận biết email giả mạo tổ chức tài chính — Vietcombank, VietinBank, MBBank với kỹ thuật Urgency & Fake Domain.",
    emails: 10,
    difficulty: "Trung bình",
    diffColor: "#F59E0B",
    duration: "~25 phút",
    createdBy: "Admin Lê Hoàng Phúc",
    techniques: ["Urgency Tactics", "Fake Domain", "Spoofed Sender"],
    recommended: true,
  },
  {
    id: 2,
    tag: "NỘI BỘ",
    tagColor: "#10B981",
    tagBg: "rgba(16,185,129,0.12)",
    icon: "🏢",
    title: "CEO Fraud & BEC Simulation",
    desc: "Nhận biết email mạo danh CEO/CFO yêu cầu chuyển khoản khẩn cấp — Business Email Compromise phổ biến nhất trong SME.",
    emails: 8,
    difficulty: "Cao",
    diffColor: "#EF4444",
    duration: "~20 phút",
    createdBy: "Admin Lê Hoàng Phúc",
    techniques: ["Authority Bias", "BEC", "Urgency"],
    recommended: false,
  },
  {
    id: 3,
    tag: "THƯƠNG MẠI",
    tagColor: "#F59E0B",
    tagBg: "rgba(245,158,11,0.12)",
    icon: "🛒",
    title: "E-commerce Phishing: Shopee & Lazada",
    desc: "Phân biệt email xác nhận đơn hàng thật/giả từ các sàn TMĐT — kỹ thuật Lookalike Domain và Clone Site.",
    emails: 12,
    difficulty: "Dễ",
    diffColor: "#10B981",
    duration: "~30 phút",
    createdBy: "Hệ thống AntiPhisher AI",
    techniques: ["Lookalike Domain", "Clone Site", "Fake OTP"],
    recommended: false,
  },
  {
    id: 4,
    tag: "CHÍNH PHỦ",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.12)",
    icon: "🏛️",
    title: "Gov & Tax Authority Impersonation",
    desc: "Nhận diện email giả mạo Tổng cục Thuế, Bộ Công an yêu cầu nộp phạt hoặc cập nhật thông tin cá nhân khẩn cấp.",
    emails: 6,
    difficulty: "Cao",
    diffColor: "#EF4444",
    duration: "~15 phút",
    createdBy: "Admin Lê Hoàng Phúc",
    techniques: ["Fear Tactics", "Authority Impersonation", "Data Harvesting"],
    recommended: false,
  },
  {
    id: 5,
    tag: "CÔNG NGHỆ",
    tagColor: "#06B6D4",
    tagBg: "rgba(6,182,212,0.12)",
    icon: "💻",
    title: "SaaS & Cloud Phishing (Google, Microsoft)",
    desc: "Tấn công giả mạo Google Workspace, Microsoft 365 — email reset mật khẩu, thông báo đăng nhập lạ, Google Docs giả.",
    emails: 10,
    difficulty: "Trung bình",
    diffColor: "#F59E0B",
    duration: "~25 phút",
    createdBy: "Hệ thống AntiPhisher AI",
    techniques: ["Brand Impersonation", "OAuth Phishing", "Credential Harvesting"],
    recommended: false,
  },
];

const teamMembers = [
  { id: 1, name: "Nguyễn Thị Lan",  dept: "Kế toán",   avatar: "NT", risk: "low"    },
  { id: 2, name: "Trần Văn Bình",   dept: "Kế toán",   avatar: "TB", risk: "high"   },
  { id: 3, name: "Lê Thị Hoa",      dept: "Kế toán",   avatar: "LH", risk: "medium" },
  { id: 4, name: "Phạm Minh Tuấn",  dept: "Kinh doanh",avatar: "PT", risk: "low"    },
  { id: 5, name: "Vũ Thị Thu",      dept: "Kinh doanh",avatar: "VT", risk: "high"   },
  { id: 6, name: "Hoàng Đức Nam",   dept: "IT",        avatar: "HN", risk: "low"    },
  { id: 7, name: "Đinh Thị Yến",    dept: "IT",        avatar: "DY", risk: "low"    },
];

const departments = ["Kế toán", "Kinh doanh", "IT", "Nhân sự"];

const riskColor: Record<string, string> = {
  high: "#EF4444", medium: "#F59E0B", low: "#10B981",
};

/* ── Assign Modal ─────────────────────────────────── */
function AssignModal({
  scenario,
  onClose,
  onAssign,
}: {
  scenario: (typeof scenarioLibrary)[0];
  onClose: () => void;
  onAssign: (scenarioId: number, targets: number[]) => void;
}) {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [deadline, setDeadline] = useState("21/06/2026");
  const [sending, setSending] = useState(false);

  const filtered = teamMembers.filter(m => deptFilter === "all" || m.dept === deptFilter);

  function toggleMember(id: number) {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    const ids = filtered.map(m => m.id);
    const allSelected = ids.every(id => selectedMembers.includes(id));
    setSelectedMembers(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  }

  async function handleAssign() {
    if (!selectedMembers.length) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    onAssign(scenario.id, selectedMembers);
    onClose();
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(m => selectedMembers.includes(m.id));

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(10,14,25,0.65)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-xl rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(20,24,40,0.98) 0%, rgba(12,16,30,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-7 py-5 flex items-start gap-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-3xl">{scenario.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                Giao chiến dịch
              </h3>
              <p className="truncate" style={{ fontSize: "0.78rem", color: "#10B981", marginTop: 2, fontWeight: 600 }}>
                {scenario.title}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all" style={{ color: "#475569" }}>
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">
            {/* Deadline */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>HẠNH CHÓT HOÀN THÀNH</label>
              <div className="relative mt-1.5">
                <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#334155" }} />
                <input
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10, padding: "10px 14px 10px 36px", color: "#E2E8F0",
                    fontSize: "0.875rem", fontFamily: "'Be Vietnam Pro', sans-serif",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                />
              </div>
            </div>

            {/* Dept filter tabs */}
            <div>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>
                CHỌN NHÂN VIÊN NHẬN CHIẾN DỊCH
              </label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["all", ...departments].map(d => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: deptFilter === d ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                      border: deptFilter === d ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      color: deptFilter === d ? "#10B981" : "#475569",
                    }}
                  >
                    {d === "all" ? "Tất cả" : d}
                  </button>
                ))}
              </div>

              {/* Select all row */}
              <button
                onClick={toggleAll}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl mt-3 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: allFilteredSelected ? "#10B981" : "transparent", border: allFilteredSelected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                  {allFilteredSelected && <CheckCircle2 size={11} className="text-white" />}
                </div>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Chọn tất cả ({filtered.length} người)</span>
              </button>

              {/* Member list */}
              <div className="mt-2 space-y-1.5">
                {filtered.map(m => {
                  const selected = selectedMembers.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                        border: selected ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: selected ? "#10B981" : "transparent", border: selected ? "none" : "1.5px solid rgba(255,255,255,0.18)" }}>
                        {selected && <CheckCircle2 size={11} className="text-white" />}
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: `${riskColor[m.risk]}cc` }}>
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: selected ? "#D1FAE5" : "#CBD5E1" }}>{m.name}</p>
                        <p style={{ fontSize: "0.68rem", color: "#475569" }}>{m.dept}</p>
                      </div>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: riskColor[m.risk], background: `${riskColor[m.risk]}15`, padding: "2px 8px", borderRadius: 99 }}>
                        {m.risk === "high" ? "Rủi ro cao" : m.risk === "medium" ? "TB" : "Thấp"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 flex items-center gap-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex-1">
              {selectedMembers.length > 0 ? (
                <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>
                  ✓ {selectedMembers.length} nhân viên được chọn
                </p>
              ) : (
                <p style={{ fontSize: "0.75rem", color: "#475569" }}>Chưa chọn nhân viên nào</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }}
            >
              Hủy
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedMembers.length || sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: selectedMembers.length && !sending ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(16,185,129,0.2)",
                color: selectedMembers.length && !sending ? "#fff" : "#10B981",
                boxShadow: selectedMembers.length && !sending ? "0 4px 16px rgba(16,185,129,0.3)" : "none",
                cursor: selectedMembers.length && !sending ? "pointer" : "not-allowed",
              }}
            >
              {sending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang giao...</>
              ) : (
                <><Send size={14} /> Giao chiến dịch</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Toast ────────────────────────────────────────── */
function AssignToast({ count, title, onDone }: { count: number; title: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex items-start gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #064E3B, #065F46)",
        border: "1px solid rgba(16,185,129,0.4)",
        boxShadow: "0 8px 32px rgba(16,185,129,0.25)",
        animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: 380,
      }}
    >
      <style>{`@keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.2)" }}>
        <CheckCircle2 size={18} style={{ color: "#34D399" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#D1FAE5", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          🎯 Giao chiến dịch thành công!
        </p>
        <p style={{ fontSize: "0.72rem", color: "#6EE7B7", marginTop: 2 }} className="line-clamp-1">
          {title} → {count} nhân viên
        </p>
      </div>
      <button onClick={onDone} style={{ color: "#059669" }}><X size={14} /></button>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function ManagerGiaoCampaign() {
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState<(typeof scenarioLibrary)[0] | null>(null);
  const [assigned, setAssigned] = useState<Record<number, number[]>>({});
  const [toast, setToast] = useState<{ count: number; title: string } | null>(null);

  const filtered = scenarioLibrary.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.tag.toLowerCase().includes(search.toLowerCase())
  );

  function handleAssign(scenarioId: number, members: number[]) {
    setAssigned(prev => ({ ...prev, [scenarioId]: members }));
    const scenario = scenarioLibrary.find(s => s.id === scenarioId)!;
    setToast({ count: members.length, title: scenario.title });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="space-y-7 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
          Giao chiến dịch
        </h1>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
          Chọn kịch bản mô phỏng từ thư viện Admin và giao cho nhân viên trong team thực hành
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Kịch bản có sẵn", value: scenarioLibrary.length, icon: BookOpen, color: "#6366F1" },
          { label: "Đã giao", value: Object.keys(assigned).length, icon: CheckCircle2, color: "#10B981" },
          { label: "Chưa giao", value: scenarioLibrary.length - Object.keys(assigned).length, icon: AlertTriangle, color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}12` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>{s.value}</p>
              <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.1)", maxWidth: 400, boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
        <Search size={16} className="text-indigo-400 shrink-0" />
        <input className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400" placeholder="Tìm kịch bản..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: "0.88rem" }} />
      </div>

      {/* Scenario cards */}
      <div className="space-y-4">
        {filtered.map(scenario => {
          const isAssigned = !!assigned[scenario.id];
          const assignedCount = assigned[scenario.id]?.length ?? 0;

          return (
            <div
              key={scenario.id}
              className="rounded-2xl p-6 flex gap-5 transition-all duration-200 relative"
              style={{
                background: "#fff",
                border: isAssigned ? "1.5px solid rgba(16,185,129,0.22)" : "1px solid rgba(99,102,241,0.07)",
                boxShadow: isAssigned ? "0 4px 24px rgba(16,185,129,0.06)" : "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Recommended badge */}
              {scenario.recommended && !isAssigned && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Star size={11} style={{ color: "#F59E0B" }} fill="#F59E0B" />
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#D97706" }}>ĐỀ XUẤT</span>
                </div>
              )}
              {isAssigned && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle2 size={12} style={{ color: "#10B981" }} />
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#10B981" }}>ĐÃ GIAO → {assignedCount} người</span>
                </div>
              )}

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: scenario.tagBg }}>
                {scenario.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: scenario.tagBg, color: scenario.tagColor }}>
                    {scenario.tag}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${scenario.diffColor}12`, color: scenario.diffColor }}>
                    {scenario.difficulty}
                  </span>
                </div>

                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>{scenario.title}</h3>
                <p className="text-slate-500 mt-1" style={{ fontSize: "0.8rem", lineHeight: 1.7 }}>{scenario.desc}</p>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.72rem" }}>
                    <BookOpen size={12} /><strong style={{ color: "#0F172A" }}>{scenario.emails}</strong> email
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.72rem" }}>
                    <Clock size={12} />{scenario.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.72rem" }}>
                    <ShieldAlert size={12} />Tạo bởi: {scenario.createdBy}
                  </span>
                </div>

                {/* Techniques */}
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {scenario.techniques.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-xs" style={{ background: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: "0.65rem" }}>
                      ⚠ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 self-center">
                <button
                  onClick={() => setAssignModal(scenario)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: isAssigned
                      ? "rgba(16,185,129,0.1)"
                      : "linear-gradient(135deg, #6366F1, #4F46E5)",
                    color: isAssigned ? "#10B981" : "#fff",
                    border: isAssigned ? "1px solid rgba(16,185,129,0.25)" : "none",
                    boxShadow: isAssigned ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isAssigned ? (
                    <><Users size={15} /> Giao lại</>
                  ) : (
                    <><Send size={15} /> Giao ngay<ChevronRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign modal */}
      {assignModal && (
        <AssignModal
          scenario={assignModal}
          onClose={() => setAssignModal(null)}
          onAssign={handleAssign}
        />
      )}

      {/* Toast */}
      {toast && <AssignToast count={toast.count} title={toast.title} onDone={() => setToast(null)} />}
    </div>
  );
}
