import { useState } from "react";
import {
  UserPlus, Search, X, Mail, Building2, Shield,
  ChevronDown, Send, Lock, CheckCircle2, Clock,
  Filter, ChevronUp, AlertTriangle, Users,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */

type Status = "active" | "pending";
type Risk   = "high" | "medium" | "low";

interface Employee {
  id: number;
  name: string;
  email: string;
  dept: string;
  score: number;
  risk: Risk;
  status: Status;
  joinedAt: string;
}

const initialEmployees: Employee[] = [
  { id: 1, name: "Nguyễn Thị Lan",  email: "lan.nguyen@congty.vn",   dept: "Kế toán",    score: 83, risk: "low",    status: "active",  joinedAt: "01/01/2026" },
  { id: 2, name: "Trần Văn Bình",   email: "binh.tran@congty.vn",    dept: "Kế toán",    score: 47, risk: "high",   status: "active",  joinedAt: "01/01/2026" },
  { id: 3, name: "Lê Thị Hoa",      email: "hoa.le@congty.vn",       dept: "Kế toán",    score: 65, risk: "medium", status: "active",  joinedAt: "15/01/2026" },
  { id: 4, name: "Phạm Minh Tuấn",  email: "tuan.pham@congty.vn",    dept: "Kinh doanh", score: 72, risk: "low",    status: "active",  joinedAt: "01/01/2026" },
  { id: 5, name: "Vũ Thị Thu",      email: "thu.vu@congty.vn",       dept: "Kinh doanh", score: 38, risk: "high",   status: "active",  joinedAt: "10/02/2026" },
  { id: 6, name: "Hoàng Đức Nam",   email: "nam.hoang@congty.vn",    dept: "IT",         score: 91, risk: "low",    status: "active",  joinedAt: "01/01/2026" },
  { id: 7, name: "Đinh Thị Yến",    email: "yen.dinh@congty.vn",     dept: "IT",         score: 88, risk: "low",    status: "active",  joinedAt: "05/01/2026" },
  { id: 8, name: "Bùi Quang Hải",   email: "hai.bui@congty.vn",      dept: "Nhân sự",    score: 54, risk: "medium", status: "active",  joinedAt: "20/01/2026" },
  { id: 9, name: "Nguyễn Văn Khoa", email: "khoa.nguyen@congty.vn",  dept: "Nhân sự",    score: 61, risk: "medium", status: "active",  joinedAt: "01/02/2026" },
];

const DEPARTMENTS = ["Phòng Kế toán", "Phòng Kinh doanh", "Phòng Kỹ thuật", "Phòng Nhân sự", "Phòng Marketing"];

const riskCfg: Record<Risk, { label: string; color: string; bg: string }> = {
  high:   { label: "Cao",        color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  medium: { label: "Trung bình", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  low:    { label: "Thấp",       color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

const scoreColor = (s: number) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";
const initials   = (name: string) => name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();

/* ── Add Member Modal ─────────────────────────────── */

function AddMemberModal({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (name: string, email: string, dept: string) => void;
}) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [dept,    setDept]    = useState("");
  const [sending, setSending] = useState(false);

  const valid = name.trim() && email.trim() && dept;

  async function handleSubmit() {
    if (!valid || sending) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    onInvite(name.trim(), email.trim(), dept);
    onClose();
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    padding: "10px 14px 10px 36px",
    color: "#E2E8F0",
    fontSize: "0.875rem",
    fontFamily: "'Be Vietnam Pro', sans-serif",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  } as React.CSSProperties;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(8,12,22,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(18,22,38,0.98) 0%, rgba(10,14,26,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.07)",
            animation: "modalIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <style>{`
            @keyframes modalIn { from { transform: scale(0.94) translateY(12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
            @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.22)" }}>
                <UserPlus size={18} style={{ color: "#10B981" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#F1F5F9" }}>Mời nhân viên vào hệ thống</h3>
                <p style={{ fontSize: "0.7rem", color: "#475569", marginTop: 1 }}>Nhân viên nhận link kích hoạt qua email công việc</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all" style={{ color: "#475569" }}>
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <div className="px-7 py-6 space-y-4">

            {/* Name */}
            <div>
              <label style={{ fontSize: "0.67rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>HỌ VÀ TÊN NHÂN VIÊN</label>
              <div className="relative mt-1.5">
                <Shield size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#334155" }} />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Trần Văn A"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.45)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: "0.67rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>EMAIL CÔNG VIỆC (WORK EMAIL)</label>
              <div className="relative mt-1.5">
                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#334155" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ví dụ: anhtv@company.com"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.45)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                />
              </div>
              <p style={{ fontSize: "0.67rem", color: "#334155", marginTop: 4, lineHeight: 1.5 }}>
                Email sẽ được lưu vào hệ thống để Admin gửi phishing simulation sau này.
              </p>
            </div>

            {/* Department */}
            <div>
              <label style={{ fontSize: "0.67rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.1em" }}>PHÒNG BAN / NHÓM</label>
              <div className="relative mt-1.5">
                <Building2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#334155" }} />
                <select
                  value={dept}
                  onChange={e => setDept(e.target.value)}
                  className="appearance-none cursor-pointer"
                  style={{ ...inputStyle, color: dept ? "#E2E8F0" : "#475569", paddingRight: 36 }}
                >
                  <option value="" style={{ background: "#1A1E2E" }}>Chọn phòng ban...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: "#1A1E2E" }}>{d}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#334155" }} />
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
              <Lock size={12} style={{ color: "#10B981", flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: "0.7rem", color: "#475569", lineHeight: 1.7 }}>
                <span style={{ color: "#10B981", fontWeight: 700 }}>Mời qua Email. </span>
                Nhân viên nhận link xác thực kèm mật khẩu tạm thời{" "}
                <span style={{ color: "#334155" }}>(Mã hóa bảo mật JWT).</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-7 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }}
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={!valid || sending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: valid && !sending ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(16,185,129,0.18)",
                color: valid && !sending ? "#fff" : "#10B981",
                boxShadow: valid && !sending ? "0 4px 20px rgba(16,185,129,0.32)" : "none",
                cursor: valid && !sending ? "pointer" : "not-allowed",
                opacity: !valid ? 0.6 : 1,
              }}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <><Send size={14} /> Gửi lời mời</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Toast ────────────────────────────────────────── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #064E3B, #065F46)",
        border: "1px solid rgba(16,185,129,0.4)",
        boxShadow: "0 8px 32px rgba(16,185,129,0.25), 0 2px 8px rgba(0,0,0,0.3)",
        animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: 400,
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.2)" }}>
        <CheckCircle2 size={18} style={{ color: "#34D399" }} />
      </div>
      <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "#D1FAE5", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {message}
      </p>
      <button onClick={onDone} className="ml-2 hover:opacity-70 transition-opacity" style={{ color: "#059669" }}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ── Score bar ────────────────────────────────────── */
function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span style={{ fontWeight: 700, fontSize: "0.82rem", color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */

type SortKey = "name" | "dept" | "score" | "status";
type SortDir = "asc" | "desc";

export function ManagerDoiNgu() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search,       setSearch]       = useState("");
  const [deptFilter,   setDeptFilter]   = useState("all");
  const [riskFilter,   setRiskFilter]   = useState("all");
  const [showModal,    setShowModal]    = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [sortKey,      setSortKey]      = useState<SortKey>("name");
  const [sortDir,      setSortDir]      = useState<SortDir>("asc");

  const uniqueDepts = [...new Set(initialEmployees.map(e => e.dept))];

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleInvite(name: string, email: string, dept: string) {
    const deptShort = dept.replace("Phòng ", "");
    const newEmp: Employee = {
      id: Date.now(),
      name, email,
      dept: deptShort,
      score: 0,
      risk: "medium",
      status: "pending",
      joinedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setEmployees(prev => [...prev, newEmp]);
    setToast(`🎉 Đã gửi email kích hoạt tài khoản thành công tới ${name}!`);
    setTimeout(() => setToast(null), 5000);
  }

  const filtered = employees
    .filter(e => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (deptFilter !== "all" && e.dept !== deptFilter) return false;
      if (riskFilter !== "all" && e.risk !== riskFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")   cmp = a.name.localeCompare(b.name);
      if (sortKey === "dept")   cmp = a.dept.localeCompare(b.dept);
      if (sortKey === "score")  cmp = a.score - b.score;
      if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const activeCount  = employees.filter(e => e.status === "active").length;
  const pendingCount = employees.filter(e => e.status === "pending").length;
  const highRiskCount = employees.filter(e => e.risk === "high").length;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={12} style={{ color: "#CBD5E1", opacity: 0.4 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={12} style={{ color: "#6366F1" }} />
      : <ChevronDown size={12} style={{ color: "#6366F1" }} />;
  }

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.45rem", color: "#0F172A" }}>
            Đội ngũ
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.82rem" }}>
            {employees.length} nhân viên · {activeCount} đã kích hoạt · {pendingCount > 0 && `${pendingCount} chờ xác thực · `}{highRiskCount} rủi ro cao
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(16,185,129,0.32), 0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <UserPlus size={16} />
          Thêm thành viên
        </button>
      </div>

      {/* ── Summary chips ────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {[
          { icon: Users, label: "Tổng nhân viên", value: employees.length, color: "#6366F1" },
          { icon: CheckCircle2, label: "Đã kích hoạt", value: activeCount, color: "#10B981" },
          { icon: Clock, label: "Chờ xác thực", value: pendingCount, color: "#F59E0B" },
          { icon: AlertTriangle, label: "Rủi ro cao", value: highRiskCount, color: "#EF4444" },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 1 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl flex-1 min-w-[200px]" style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.1)" }}>
          <Search size={15} className="text-indigo-400 shrink-0" />
          <input
            className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
            placeholder="Tìm tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: "0.85rem" }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-slate-400" />

          {/* Dept filter */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="appearance-none outline-none cursor-pointer px-3 py-1.5 rounded-xl"
            style={{ fontSize: "0.8rem", fontWeight: 600, background: deptFilter !== "all" ? "#EEF2FF" : "rgba(99,102,241,0.06)", color: deptFilter !== "all" ? "#4338CA" : "#64748B", border: "none", fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            <option value="all">Tất cả phòng ban</option>
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Risk filter */}
          {[
            { val: "all", label: "Mọi rủi ro" },
            { val: "high", label: "🔴 Cao" },
            { val: "medium", label: "🟡 TB" },
            { val: "low", label: "🟢 Thấp" },
          ].map(f => (
            <button
              key={f.val}
              onClick={() => setRiskFilter(f.val)}
              className="px-3 py-1.5 rounded-xl transition-all"
              style={{
                fontSize: "0.78rem", fontWeight: riskFilter === f.val ? 700 : 500,
                background: riskFilter === f.val ? "#EEF2FF" : "rgba(99,102,241,0.05)",
                color: riskFilter === f.val ? "#4338CA" : "#64748B",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-slate-400 ml-auto shrink-0" style={{ fontSize: "0.75rem" }}>
          {filtered.length} / {employees.length} nhân viên
        </p>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>

        {/* Table head */}
        <div
          className="grid items-center px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 2.2fr 1.3fr 1.5fr 1.2fr",
            background: "#F8FAFF",
            borderBottom: "1px solid rgba(99,102,241,0.08)",
          }}
        >
          {[
            { key: "name"   as SortKey, label: "Họ và tên" },
            { key: null,                label: "Email công việc" },
            { key: "dept"   as SortKey, label: "Phòng ban" },
            { key: "score"  as SortKey, label: "Risk Score" },
            { key: "status" as SortKey, label: "Trạng thái" },
          ].map((col, i) => (
            <button
              key={i}
              onClick={() => col.key && handleSort(col.key)}
              className="flex items-center gap-1.5 text-left"
              style={{
                fontSize: "0.68rem", fontWeight: 700, color: "#64748B",
                letterSpacing: "0.08em", cursor: col.key ? "pointer" : "default",
                background: "none", border: "none", padding: 0,
              }}
            >
              {col.label.toUpperCase()}
              {col.key && <SortIcon col={col.key} />}
            </button>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400" style={{ fontSize: "0.88rem" }}>Không tìm thấy nhân viên phù hợp</p>
          </div>
        ) : (
          filtered.map((emp, idx) => {
            const risk = riskCfg[emp.risk];
            const isPending = emp.status === "pending";
            return (
              <div
                key={emp.id}
                className="grid items-center px-5 py-3.5 transition-colors hover:bg-indigo-50/40 group"
                style={{
                  gridTemplateColumns: "2fr 2.2fr 1.3fr 1.5fr 1.2fr",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none",
                  background: isPending ? "rgba(245,158,11,0.02)" : "transparent",
                }}
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{
                      background: isPending
                        ? "linear-gradient(135deg, #94A3B8, #64748B)"
                        : `linear-gradient(135deg, ${scoreColor(emp.score)}, ${scoreColor(emp.score)}cc)`,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  >
                    {initials(emp.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 truncate" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{emp.name}</p>
                    <p className="text-slate-400" style={{ fontSize: "0.68rem" }}>Tham gia: {emp.joinedAt}</p>
                  </div>
                </div>

                {/* Email */}
                <p className="text-slate-500 truncate pr-4" style={{ fontSize: "0.8rem" }}>{emp.email}</p>

                {/* Dept */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg w-fit"
                  style={{ fontSize: "0.72rem", fontWeight: 600, background: "#F1F5F9", color: "#475569" }}
                >
                  <Building2 size={10} />
                  {emp.dept}
                </span>

                {/* Score */}
                {isPending ? (
                  <p className="text-slate-300" style={{ fontSize: "0.75rem", fontStyle: "italic" }}>Chưa có dữ liệu</p>
                ) : (
                  <ScoreBar score={emp.score} />
                )}

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  {isPending ? (
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)", color: "#D97706", fontSize: "0.72rem", fontWeight: 700 }}
                    >
                      <Clock size={11} />
                      Chờ xác thực
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", fontSize: "0.72rem", fontWeight: 700 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Đã kích hoạt
                    </span>
                  )}
                  {!isPending && (
                    <span
                      className="px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: risk.bg, color: risk.color, fontSize: "0.65rem", fontWeight: 700 }}
                    >
                      {risk.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Table footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid rgba(99,102,241,0.06)", background: "#FAFAFF" }}
        >
          <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
            Hiển thị {filtered.length} trong tổng số {employees.length} nhân viên
          </p>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5" style={{ fontSize: "0.72rem", color: "#D97706" }}>
              <Clock size={12} />
              {pendingCount} nhân viên đang chờ xác nhận email kích hoạt
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && <AddMemberModal onClose={() => setShowModal(false)} onInvite={handleInvite} />}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
