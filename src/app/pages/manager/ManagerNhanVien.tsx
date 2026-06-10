import { useState, useEffect } from "react";
import {
  Search, X,
  Loader2, AlertTriangle, CheckCircle2, XCircle,
  UserPlus, ChevronLeft, ChevronRight, Mail, Send,
  BookOpen, Target, ChevronDown, ChevronUp, BarChart2,
  Clock, Award, TrendingUp,
} from "lucide-react";
import { userService } from "../../services/userService";
import { companyService } from "../../services/companyService";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────── */
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

/* ── InviteEmployeeDialog ───────────────────────────── */
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

/* ── ProgressDrawer ─────────────────────────────────── */
function ProgressDrawer({ emp, onClose }: { emp: CompanyEmployee; onClose: () => void }) {
  const [data, setData]         = useState<ProgressData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({});

  useEffect(() => {
    userService.getEmployeeProgress(emp.userId)
      .then((d: ProgressData) => { setData(d); setLoading(false); })
      .catch((e: any) => { setError(e?.message || "Không tải được dữ liệu."); setLoading(false); });
  }, [emp.userId]);

  const togglePhase = (id: number) => setOpenPhases(p => ({ ...p, [id]: !p[id] }));

  const lessonPct = data && data.totalLessons > 0
    ? Math.round((data.totalLessonsCompleted / data.totalLessons) * 100) : 0;

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
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
            {emp.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{emp.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{emp.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Đang tải học trình...</p>
            </div>
          )}
          {error && <p className="text-sm text-red-500 text-center py-10">{error}</p>}

          {data && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Bài học hoàn thành", value: `${data.totalLessonsCompleted}/${data.totalLessons}`, icon: BookOpen, color: "#6366F1" },
                  { label: "Lần thực hành", value: data.totalAttempts, icon: Target, color: "#10B981" },
                  { label: "Điểm TB mô phỏng", value: data.averageScore > 0 ? `${data.averageScore}` : "—", icon: Award, color: "#F59E0B" },
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
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><BookOpen size={14} className="text-indigo-400" /> Lộ trình bài học</p>
                  <span className="text-xs font-bold" style={{ color: lessonPct === 100 ? "#10B981" : "#6366F1" }}>{lessonPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${lessonPct}%`, background: "linear-gradient(90deg, #6366F1, #818CF8)" }} />
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
                        <button
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                          onClick={() => togglePhase(ph.phaseId)}
                        >
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
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                              className="overflow-hidden border-t border-slate-100">
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
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-3"><TrendingUp size={14} className="text-emerald-500" /> Chiến dịch thực hành</p>
                  <div className="space-y-2">
                    {data.campaigns.map(c => {
                      const cpct = c.totalScenarios > 0 ? Math.round((c.attemptedScenarios / c.totalScenarios) * 100) : 0;
                      return (
                        <div key={c.campaignId} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-700">{c.campaignName}</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: c.averageScore >= 70 ? "#D1FAE5" : c.averageScore >= 50 ? "#FEF3C7" : "#FEE2E2",
                                color: c.averageScore >= 70 ? "#059669" : c.averageScore >= 50 ? "#D97706" : "#DC2626" }}>
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

/* ── MAIN ────────────────────────────────────────────── */
export function ManagerNhanVien() {
  const [employees, setEmployees]   = useState<CompanyEmployee[]>([]);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [selected, setSelected]     = useState<CompanyEmployee | null>(null);

  const PAGE_SIZE = 10;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await userService.getCompanyEmployees(page, PAGE_SIZE, search);
      if (data) { setEmployees(data.items ?? []); setTotalCount(data.totalCount ?? 0); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchEmployees(), 400);
    return () => clearTimeout(t);
  }, [search, page]);

  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <AnimatePresence>
        {showAdd && <InviteEmployeeDialog onClose={() => setShowAdd(false)} onRefresh={fetchEmployees} />}
        {selected && <ProgressDrawer emp={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>Nhân viên công ty</h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            {totalCount} nhân viên · Bấm vào hàng để xem học trình
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          <UserPlus size={16} /> Mời nhân viên
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white"
        style={{ border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <Search size={17} className="text-indigo-400 shrink-0" />
        <input className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          placeholder="Tìm theo tên hoặc email..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ fontSize: "0.9rem" }} />
        {loading && <Loader2 size={15} className="text-indigo-400 animate-spin shrink-0" />}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
        <table className="w-full text-left">
          <thead style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Nhân viên</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Email xác minh</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Đăng nhập cuối</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(99,102,241,0.05)" }}>
            {employees.map(emp => (
              <tr key={emp.userId}
                className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                onClick={() => setSelected(emp)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
                      {emp.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{emp.fullName}</p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {emp.isActive
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md" style={{ color: "#059669", background: "#D1FAE5" }}><CheckCircle2 size={11} /> Hoạt động</span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md" style={{ color: "#DC2626", background: "#FEE2E2" }}><XCircle size={11} /> Khóa</span>}
                </td>
                <td className="px-6 py-4">
                  {emp.isEmailVerified
                    ? <span className="text-xs font-semibold text-emerald-600">✓ Đã xác minh</span>
                    : <span className="text-xs font-semibold text-amber-500">Chưa xác minh</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{fmtDate(emp.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{fmtDate(emp.lastLoginAt)}</td>
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">Chưa có nhân viên nào trong công ty.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
          <p className="text-xs text-slate-500">Trang {page} · Hiển thị {employees.length} / {totalCount} nhân viên</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => p + 1)} disabled={employees.length < PAGE_SIZE}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
