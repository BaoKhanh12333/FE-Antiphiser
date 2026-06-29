import { useState, useEffect, useMemo } from "react";
import {
  Search, X, Loader2, AlertTriangle, CheckCircle2, XCircle,
  UserPlus, ChevronLeft, ChevronRight, Mail, Send,
  BookOpen, Target, ChevronDown, ChevronUp, BarChart2,
  Clock, Award, TrendingUp, AlertCircle, RefreshCw,
  Users, UserCheck, UserX, ShieldAlert, Eye,
} from "lucide-react";
import { userService } from "../../services/userService";
import { companyService } from "../../services/companyService";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyEmployee {
  userId: number; fullName: string; email: string;
  avatarUrl: string; isActive: boolean; isEmailVerified: boolean;
  createdAt: string; lastLoginAt?: string;
}

interface LessonItem    { lessonId: number; title: string; isCompleted: boolean; completedAt?: string; }
interface ModuleItem    { moduleId: number; moduleName: string; lessons: LessonItem[]; }
interface PhaseItem     { phaseId: number; phaseName: string; completedLessons: number; totalLessons: number; modules: ModuleItem[]; }
interface CampaignItem  { campaignId: number; campaignName: string; totalScenarios: number; attemptedScenarios: number; totalAttempts: number; averageScore: number; }
interface ProgressData  {
  userId: number; fullName: string; email: string;
  totalLessons: number; totalLessonsCompleted: number; totalAttempts: number; averageScore: number;
  phases: PhaseItem[]; campaigns: CampaignItem[];
}

type FilterTab = "all" | "active" | "inactive" | "unverified";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso?: string): string {
  if (!iso) return "Chưa đăng nhập";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  if (days < 60) return "1 tháng trước";
  return `${Math.floor(days / 30)} tháng trước`;
}

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function attentionLevel(emp: CompanyEmployee): "danger" | "warn" | "ok" {
  if (!emp.isActive) return "danger";
  if (!emp.isEmailVerified) return "warn";
  const d = daysSince(emp.lastLoginAt);
  if (d === null || d > 30) return "warn";
  return "ok";
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(-2).map(w => w[0]).join("").toUpperCase();
}

// ─── InviteEmployeeDialog (unchanged) ────────────────────────────────────────

function InviteEmployeeDialog({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => void }) {
  const [email, setEmail]       = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setErrorMsg("Vui lòng nhập email nhân viên."); return; }
    setLoading(true); setErrorMsg(null);
    try {
      await companyService.inviteEmployee({ email: email.trim(), fullName: fullName.trim() || undefined });
      setSent(true); onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gửi lời mời thất bại. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -8 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-2xl bg-white"
        style={{ width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(99,102,241,0.12)" }}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Mời nhân viên</h2>
            <p className="text-xs text-slate-500 mt-0.5">Nhân viên sẽ nhận email và cần xác nhận để tham gia</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Send size={22} className="text-emerald-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Đã gửi lời mời!</p>
            <p className="text-xs text-slate-500 mb-1">Email xác nhận đã được gửi tới <span className="font-semibold text-indigo-600">{email}</span>.</p>
            <p className="text-xs text-slate-400 mb-5">Nhân viên cần bấm vào link trong email để xác nhận. Link có hiệu lực 7 ngày.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>Đóng</button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
              <Mail size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700">
                Hệ thống sẽ gửi email mời. Nếu email <b>chưa có tài khoản</b>, tài khoản mới sẽ được tạo kèm mật khẩu tạm thời.
                Nếu <b>đã có tài khoản</b>, nhân viên chỉ cần bấm xác nhận để gia nhập.
              </p>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email nhân viên <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="nhanvien@congty.vn"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ và tên <span className="text-slate-400 font-normal ml-1">(bắt buộc nếu email chưa có tài khoản)</span></label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
              </div>
              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertTriangle size={13} className="shrink-0" />{errorMsg}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold text-sm border border-slate-200 hover:bg-slate-50">Hủy</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex justify-center items-center gap-2"
                style={{ background: loading ? "#A5B4FC" : "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Send size={14} /> Gửi lời mời</>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// ─── ProgressDrawer ───────────────────────────────────────────────────────────

function ProgressDrawer({ emp, onClose }: { emp: CompanyEmployee; onClose: () => void }) {
  const [data, setData]             = useState<ProgressData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({});

  useEffect(() => {
    userService.getEmployeeProgress(emp.userId)
      .then((d: ProgressData) => { setData(d); setLoading(false); })
      .catch((e: any) => { setError(e?.message || "Không tải được dữ liệu."); setLoading(false); });
  }, [emp.userId]);

  const togglePhase = (id: number) => setOpenPhases(p => ({ ...p, [id]: !p[id] }));
  const lessonPct = data && data.totalLessons > 0
    ? Math.round((data.totalLessonsCompleted / data.totalLessons) * 100) : 0;
  const attn = attentionLevel(emp);

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 480, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: attn === "danger" ? "linear-gradient(135deg,#EF4444,#F87171)" : attn === "warn" ? "linear-gradient(135deg,#F59E0B,#FBBF24)" : "linear-gradient(135deg,#6366F1,#818CF8)" }}
            >
              {initials(emp.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{emp.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{emp.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {attn === "danger" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  <AlertCircle size={10} /> Cần chú ý
                </span>
              )}
              {attn === "warn" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  <AlertTriangle size={10} /> Cảnh báo
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0"><X size={20} /></button>
          </div>

          {/* Mini status row */}
          <div className="flex items-center gap-3 mt-3">
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: emp.isActive ? "#D1FAE5" : "#FEE2E2", color: emp.isActive ? "#059669" : "#DC2626" }}
            >
              {emp.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {emp.isActive ? "Hoạt động" : "Bị khóa"}
            </span>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: emp.isEmailVerified ? "#EEF2FF" : "#FEF3C7", color: emp.isEmailVerified ? "#4F46E5" : "#D97706" }}
            >
              <Mail size={10} />
              {emp.isEmailVerified ? "Email xác minh" : "Chưa xác minh"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={10} /> {relativeTime(emp.lastLoginAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Đang tải học trình...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <AlertCircle size={28} className="text-red-300" />
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          )}

          {data && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Bài học hoàn thành", value: `${data.totalLessonsCompleted}/${data.totalLessons}`, icon: BookOpen, color: "#6366F1" },
                  { label: "Lần thực hành",       value: data.totalAttempts,                                  icon: Target,   color: "#10B981" },
                  { label: "Điểm TB mô phỏng",    value: data.averageScore > 0 ? `${data.averageScore}` : "—", icon: Award,   color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: s.color + "18" }}>
                      <s.icon size={14} style={{ color: s.color }} />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Lesson progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-400" /> Lộ trình bài học
                  </p>
                  <span className="text-xs font-bold" style={{ color: lessonPct === 100 ? "#10B981" : "#6366F1" }}>{lessonPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${lessonPct}%`, background: lessonPct === 100 ? "linear-gradient(90deg,#10B981,#34D399)" : "linear-gradient(90deg, #6366F1, #818CF8)" }} />
                </div>
              </div>

              {/* Phases accordion */}
              {data.phases.length > 0 && (
                <div className="space-y-2">
                  {data.phases.map(ph => {
                    const pct = ph.totalLessons > 0 ? Math.round((ph.completedLessons / ph.totalLessons) * 100) : 0;
                    const open = !!openPhases[ph.phaseId];
                    return (
                      <div key={ph.phaseId} className="rounded-xl border border-slate-100 overflow-hidden">
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors" onClick={() => togglePhase(ph.phaseId)}>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-slate-700">{ph.phaseName}</p>
                            <p className="text-xs text-slate-400">{ph.completedLessons}/{ph.totalLessons} bài · {pct}%</p>
                          </div>
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#10B981" : "#6366F1" }} />
                          </div>
                          {open ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                        </button>
                        <AnimatePresence>
                          {open && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
                              {ph.modules.map(mod => (
                                <div key={mod.moduleId} className="px-4 py-3">
                                  <p className="text-xs font-bold text-slate-500 mb-2">{mod.moduleName}</p>
                                  <div className="space-y-1.5">
                                    {mod.lessons.map(l => (
                                      <div key={l.lessonId} className="flex items-center gap-2">
                                        {l.isCompleted
                                          ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                          : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 shrink-0" />}
                                        <span className={`text-xs ${l.isCompleted ? "text-slate-600" : "text-slate-400"}`}>{l.title}</span>
                                        {l.isCompleted && l.completedAt && (
                                          <span className="text-xs text-slate-300 ml-auto shrink-0 flex items-center gap-0.5">
                                            <Clock size={9} />{new Date(l.completedAt).toLocaleDateString("vi-VN")}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Campaigns */}
              {data.campaigns.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                    <TrendingUp size={14} className="text-emerald-500" /> Chiến dịch thực hành
                  </p>
                  <div className="space-y-2">
                    {data.campaigns.map(c => {
                      const cpct = c.totalScenarios > 0 ? Math.round((c.attemptedScenarios / c.totalScenarios) * 100) : 0;
                      return (
                        <div key={c.campaignId} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-700">{c.campaignName}</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: c.averageScore >= 70 ? "#D1FAE5" : c.averageScore >= 50 ? "#FEF3C7" : "#FEE2E2", color: c.averageScore >= 70 ? "#059669" : c.averageScore >= 50 ? "#D97706" : "#DC2626" }}>
                              {c.totalAttempts > 0 ? `${c.averageScore} điểm` : "Chưa làm"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${cpct}%`, background: "linear-gradient(90deg, #10B981, #34D399)" }} />
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{c.attemptedScenarios}/{c.totalScenarios} kịch bản</span>
                          </div>
                          <p className="text-xs text-slate-400">{c.totalAttempts} lần thực hành</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.campaigns.length === 0 && data.phases.length === 0 && (
                <div className="text-center py-8">
                  <BarChart2 size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Nhân viên chưa có hoạt động học tập nào.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg, active, onClick }: {
  icon: React.ElementType; label: string; value: number | string;
  color: string; bg: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all w-full"
      style={{
        border: active ? `2px solid ${color}` : "1px solid #F1F5F9",
        boxShadow: active ? `0 0 0 3px ${color}18` : "0 1px 3px rgba(0,0,0,0.03)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all",        label: "Tất cả" },
  { id: "active",     label: "Hoạt động" },
  { id: "inactive",   label: "Không hoạt động" },
  { id: "unverified", label: "Chưa xác minh" },
];

export function ManagerNhanVien() {
  const [allEmployees, setAllEmployees] = useState<CompanyEmployee[]>([]);
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState<FilterTab>("all");
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [selected, setSelected]         = useState<CompanyEmployee | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Load a large page to get all employees (B2B company typically < 500 employees)
      const data = await userService.getCompanyEmployees(1, 500, "");
      setAllEmployees(data?.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:      allEmployees.length,
    active:     allEmployees.filter(e => e.isActive).length,
    inactive:   allEmployees.filter(e => !e.isActive).length,
    unverified: allEmployees.filter(e => !e.isEmailVerified).length,
    attention:  allEmployees.filter(e => attentionLevel(e) !== "ok").length,
  }), [allEmployees]);

  // ── Filtered ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEmployees.filter(e => {
      const matchSearch = !q || e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchTab =
        tab === "all"        ? true :
        tab === "active"     ? e.isActive :
        tab === "inactive"   ? !e.isActive :
        tab === "unverified" ? !e.isEmailVerified : true;
      return matchSearch && matchTab;
    });
  }, [allEmployees, search, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <AnimatePresence>
        {showAdd && <InviteEmployeeDialog onClose={() => setShowAdd(false)} onRefresh={fetchAll} />}
        {selected && <ProgressDrawer emp={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
            Nhân viên công ty
          </h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            {loading ? "Đang tải..." : `${stats.total} nhân viên${stats.attention > 0 ? ` · ${stats.attention} cần chú ý` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
            style={{ border: "1px solid #E2E8F0", background: "white" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
            <UserPlus size={16} /> Mời nhân viên
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users}     label="Tổng nhân viên"     value={stats.total}      color="#6366F1" bg="#EEF2FF" active={tab === "all"}        onClick={() => { setTab("all"); resetPage(); }} />
        <StatCard icon={UserCheck} label="Đang hoạt động"     value={stats.active}     color="#059669" bg="#D1FAE5" active={tab === "active"}     onClick={() => { setTab("active"); resetPage(); }} />
        <StatCard icon={UserX}     label="Không hoạt động"    value={stats.inactive}   color="#DC2626" bg="#FEE2E2" active={tab === "inactive"}   onClick={() => { setTab("inactive"); resetPage(); }} />
        <StatCard icon={ShieldAlert} label="Chưa xác minh"    value={stats.unverified} color="#D97706" bg="#FEF3C7" active={tab === "unverified"} onClick={() => { setTab("unverified"); resetPage(); }} />
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-400 transition">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            placeholder="Tìm tên hoặc email..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
          {search && <button onClick={() => { setSearch(""); resetPage(); }}><X size={13} className="text-slate-400" /></button>}
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-semibold">
          {FILTER_TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); resetPage(); }}
              className={`px-3 py-2 transition ${tab === t.id ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-indigo-300">
            <Loader2 size={20} className="animate-spin" /> Đang tải nhân viên...
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">
              {search ? "Không tìm thấy nhân viên phù hợp" : "Không có nhân viên trong nhóm này"}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {!search && tab === "all" ? "Bấm \"Mời nhân viên\" để thêm người vào công ty" : "Thử tìm kiếm khác hoặc đổi bộ lọc"}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân viên</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Xác minh email</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Lần đăng nhập cuối</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Ngày tham gia</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Học trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(emp => {
                const attn = attentionLevel(emp);
                const d = daysSince(emp.lastLoginAt);
                const isStale = d === null || d > 30;
                return (
                  <motion.tr
                    key={emp.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition-colors group cursor-pointer"
                    style={{
                      background: attn === "danger" ? "#FFF8F8" : attn === "warn" ? "#FFFBF0" : "transparent",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = attn === "danger" ? "#FEF2F2" : attn === "warn" ? "#FFFBEB" : "#F8FAFF")}
                    onMouseLeave={e => (e.currentTarget.style.background = attn === "danger" ? "#FFF8F8" : attn === "warn" ? "#FFFBF0" : "transparent")}
                  >
                    {/* Employee */}
                    <td className="px-5 py-3.5" onClick={() => setSelected(emp)}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: attn === "danger" ? "linear-gradient(135deg,#EF4444,#F87171)" : attn === "warn" ? "linear-gradient(135deg,#F59E0B,#FBBF24)" : "linear-gradient(135deg,#6366F1,#818CF8)" }}
                        >
                          {initials(emp.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-800 truncate">{emp.fullName}</p>
                            {attn === "danger" && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                                <AlertCircle size={9} /> Cần chú ý
                              </span>
                            )}
                            {attn === "warn" && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#FEF3C7", color: "#D97706" }}>
                                <AlertTriangle size={9} /> Cảnh báo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5" onClick={() => setSelected(emp)}>
                      {emp.isActive
                        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg" style={{ color: "#059669", background: "#D1FAE5" }}><CheckCircle2 size={11} /> Hoạt động</span>
                        : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg" style={{ color: "#DC2626", background: "#FEE2E2" }}><XCircle size={11} /> Bị khóa</span>}
                    </td>

                    {/* Email verified */}
                    <td className="px-5 py-3.5 hidden md:table-cell" onClick={() => setSelected(emp)}>
                      {emp.isEmailVerified
                        ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Đã xác minh</span>
                        : <span className="text-xs font-semibold text-amber-500 flex items-center gap-1"><AlertTriangle size={11} /> Chưa xác minh</span>}
                    </td>

                    {/* Last login */}
                    <td className="px-5 py-3.5 hidden lg:table-cell" onClick={() => setSelected(emp)}>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} style={{ color: isStale ? "#EF4444" : "#94A3B8", flexShrink: 0 }} />
                        <span className="text-xs" style={{ color: isStale ? "#EF4444" : "#64748B", fontWeight: isStale ? 600 : 400 }}>
                          {relativeTime(emp.lastLoginAt)}
                        </span>
                      </div>
                    </td>

                    {/* Join date */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell" onClick={() => setSelected(emp)}>
                      {new Date(emp.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>

                    {/* Progress button */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(emp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all opacity-0 group-hover:opacity-100"
                        style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid rgba(99,102,241,0.15)" }}
                      >
                        <Eye size={11} /> Học trình
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-500 px-2">Trang {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attention legend */}
      {!loading && stats.attention > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-white border border-slate-100 w-fit">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Chú thích:</p>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }} />
            <span className="text-xs text-slate-500">Cần chú ý (khóa / chưa đăng nhập 30+ ngày)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }} />
            <span className="text-xs text-slate-500">Cảnh báo (chưa xác minh / ít hoạt động)</span>
          </div>
        </div>
      )}
    </div>
  );
}
