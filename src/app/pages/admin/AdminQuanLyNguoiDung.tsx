import { useState, useEffect, useMemo } from "react";
import {
  Search, X, ChevronRight, ChevronLeft, AlertTriangle,
  Loader2, Users, UserCheck, Shield, Briefcase,
  CheckCircle, Ban, Clock, BookOpen, Target, Award,
  TrendingUp, ChevronDown, ChevronUp, BarChart2, CheckCircle2,
} from "lucide-react";
import { userService } from "../../services/userService";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleResponse  { roleId: number; roleName: string }
export interface UserAccountResponse {
  id: number; fullName: string; email: string; avatarUrl: string;
  createdAt: string; lastLogin?: string; role: RoleResponse;
  status: string; systemScore: number; riskLevel: string;
  activePlanName?: string;
}

interface LessonItem   { lessonId: number; title: string; isCompleted: boolean; completedAt?: string; }
interface ModuleItem   { moduleId: number; moduleName: string; lessons: LessonItem[]; }
interface PhaseItem    { phaseId: number; phaseName: string; completedLessons: number; totalLessons: number; modules: ModuleItem[]; }
interface CampaignItem { campaignId: number; campaignName: string; totalScenarios: number; attemptedScenarios: number; totalAttempts: number; averageScore: number; }
interface ProgressData {
  userId: number; fullName: string; email: string;
  totalLessons: number; totalLessonsCompleted: number; totalAttempts: number; averageScore: number;
  phases: PhaseItem[]; campaigns: CampaignItem[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const RISK: Record<string, { label: string; color: string; bg: string }> = {
  Low:    { label: "Thấp",     color: "#059669", bg: "#D1FAE5" },
  Medium: { label: "TB",       color: "#D97706", bg: "#FEF3C7" },
  High:   { label: "Cao",      color: "#DC2626", bg: "#FEE2E2" },
};
const STATUS: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  Active:     { label: "Hoạt động",     color: "#059669", bg: "#D1FAE5", Icon: CheckCircle },
  Banned:     { label: "Đã khóa",       color: "#DC2626", bg: "#FEE2E2", Icon: Ban },
  Unverified: { label: "Chưa xác minh", color: "#D97706", bg: "#FEF3C7", Icon: Clock },
};
const ROLE_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#EDE9FE", text: "#7C3AED" },
  2: { bg: "#DBEAFE", text: "#1D4ED8" },
  3: { bg: "#F1F5F9", text: "#475569" },
};
const ROLE_OPTIONS = [{ id: 1, label: "Admin" }, { id: 2, label: "Manager" }, { id: 3, label: "User" }];
const PAGE_SIZE = 12;

// ─── UserDetailDrawer ─────────────────────────────────────────────────────────

function UserDetailDrawer({ user, onClose, onSaved }: {
  user: UserAccountResponse;
  onClose: () => void;
  onSaved: (u: UserAccountResponse) => void;
}) {
  const [progress,    setProgress]    = useState<ProgressData | null>(null);
  const [loadingProg, setLoadingProg] = useState(true);
  const [openPhases,  setOpenPhases]  = useState<Record<number, boolean>>({});

  // Edit state
  const [roleId,  setRoleId]  = useState(user.role?.roleId  ?? 3);
  const [status,  setStatus]  = useState(user.status        ?? "Unverified");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    setLoadingProg(true);
    userService.getEmployeeProgress(user.id)
      .then((d: ProgressData) => setProgress(d))
      .catch(() => setProgress(null))
      .finally(() => setLoadingProg(false));
  }, [user.id]);

  const togglePhase = (id: number) => setOpenPhases(p => ({ ...p, [id]: !p[id] }));

  const lessonPct = progress && progress.totalLessons > 0
    ? Math.round((progress.totalLessonsCompleted / progress.totalLessons) * 100) : 0;

  const scoreColor = (s: number) => s >= 75 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";
  const rc = ROLE_COLORS[user.role?.roleId ?? 3] ?? ROLE_COLORS[3];
  const sc = STATUS[user.status] ?? STATUS.Unverified;
  const StatusIcon = sc.Icon;
  const initials = user.fullName.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();

  const isDirty = roleId !== (user.role?.roleId ?? 3) || status !== (user.status ?? "Unverified");

  const handleSave = async () => {
    setSaving(true); setErr(null); setSaved(false);
    try {
      await userService.updateUserStatusOrRole({
        userId: user.id, roleId, status,
        systemScore: user.systemScore, riskLevel: user.riskLevel,
      });
      const updated: UserAccountResponse = {
        ...user, status,
        role: { roleId, roleName: ROLE_OPTIONS.find(r => r.id === roleId)?.label ?? "User" },
      };
      setSaved(true);
      onSaved(updated);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setErr(e?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 480, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${rc.text}, ${rc.text}bb)` }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ background: rc.bg, color: rc.text }}>
                {user.role?.roleName ?? "User"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ background: sc.bg, color: sc.color }}>
                <StatusIcon size={9} /> {sc.label}
              </span>
              <button onClick={onClose} className="ml-1 text-slate-300 hover:text-slate-500 transition">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Score + Plan row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Score */}
            <div className="col-span-1 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center"
              style={{ background: "#F8FAFF" }}>
              <p className="text-3xl font-black" style={{ color: scoreColor(user.systemScore), letterSpacing: "-0.03em" }}>
                {user.systemScore}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">Điểm hệ thống</p>
            </div>

            {/* Risk level */}
            <div className="p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center"
              style={{ background: "#F8FAFF" }}>
              {(() => {
                const rk = RISK[user.riskLevel] ?? RISK.Low;
                return (
                  <>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: rk.bg, color: rk.color }}>
                      {rk.label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-semibold uppercase tracking-wide">Mức rủi ro</p>
                  </>
                );
              })()}
            </div>

            {/* Plan */}
            <div className="p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center"
              style={{ background: "#F8FAFF" }}>
              <span className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: user.activePlanName ? "#EEF2FF" : "#F1F5F9", color: user.activePlanName ? "#6366F1" : "#94A3B8" }}>
                {user.activePlanName ?? "Miễn phí"}
              </span>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold uppercase tracking-wide">Gói hiện tại</p>
            </div>
          </div>

          {/* Progress section */}
          {loadingProg && (
            <div className="flex items-center justify-center h-32 gap-2 text-indigo-300">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Đang tải tiến trình...</span>
            </div>
          )}

          {!loadingProg && progress && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Bài học",      value: `${progress.totalLessonsCompleted}/${progress.totalLessons}`, icon: BookOpen, color: "#6366F1" },
                  { label: "Lần thực hành", value: progress.totalAttempts, icon: Target, color: "#10B981" },
                  { label: "Điểm TB",       value: progress.totalAttempts > 0 ? progress.averageScore : "—", icon: Award, color: "#F59E0B" },
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
                  <span className="text-xs font-bold" style={{ color: lessonPct === 100 ? "#10B981" : "#6366F1" }}>
                    {lessonPct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${lessonPct}%`, background: "linear-gradient(90deg, #6366F1, #818CF8)" }} />
                </div>
              </div>

              {/* Phases accordion */}
              {progress.phases.length > 0 && (
                <div className="space-y-2">
                  {progress.phases.map(ph => {
                    const pct  = ph.totalLessons > 0 ? Math.round((ph.completedLessons / ph.totalLessons) * 100) : 0;
                    const open = !!openPhases[ph.phaseId];
                    return (
                      <div key={ph.phaseId} className="rounded-xl border border-slate-100 overflow-hidden">
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                          onClick={() => togglePhase(ph.phaseId)}>
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
              {progress.campaigns.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                    <TrendingUp size={14} className="text-emerald-500" /> Chiến dịch thực hành
                  </p>
                  <div className="space-y-2">
                    {progress.campaigns.map(c => {
                      const cpct = c.totalScenarios > 0 ? Math.round((c.attemptedScenarios / c.totalScenarios) * 100) : 0;
                      return (
                        <div key={c.campaignId} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-700">{c.campaignName}</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: c.averageScore >= 70 ? "#D1FAE5" : c.averageScore >= 50 ? "#FEF3C7" : "#FEE2E2",
                                color: c.averageScore >= 70 ? "#059669" : c.averageScore >= 50 ? "#D97706" : "#DC2626",
                              }}>
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

              {progress.campaigns.length === 0 && progress.phases.length === 0 && (
                <div className="text-center py-8">
                  <BarChart2 size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Người dùng chưa có hoạt động nào.</p>
                </div>
              )}
            </>
          )}

          {!loadingProg && !progress && (
            <div className="text-center py-8 text-sm text-slate-400">Không thể tải tiến trình.</div>
          )}
        </div>

        {/* ── Sticky footer: role + status editor ── */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 space-y-3 bg-white">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân quyền & trạng thái</p>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vai trò</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map(r => (
                <button key={r.id} onClick={() => { setRoleId(r.id); setErr(null); setSaved(false); }}
                  className={`py-2 text-xs font-semibold rounded-xl border-2 transition ${
                    roleId === r.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Trạng thái</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS).map(([key, cfg]) => (
                <button key={key} onClick={() => { setStatus(key); setErr(null); setSaved(false); }}
                  className={`py-2 text-xs font-semibold rounded-xl border-2 transition ${
                    status === key ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 border border-red-100">
              <AlertTriangle size={13} className="shrink-0" /> {err}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition">
              Đóng
            </button>
            <button onClick={handleSave} disabled={saving || !isDirty}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: saved ? "#10B981" : "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</>
                : saved
                ? <><CheckCircle size={14} /> Đã lưu</>
                : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number | string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminQuanLyNguoiDung() {
  const [allUsers,     setAllUsers]     = useState<UserAccountResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState<"all"|"admin"|"manager"|"user">("all");
  const [statusFilter, setStatusFilter] = useState<"all"|"Active"|"Banned"|"Unverified">("all");
  const [page,         setPage]         = useState(1);
  const [detailUser,   setDetailUser]   = useState<UserAccountResponse | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllAccounts("", 1, 500);
      setAllUsers(data?.items ?? []);
    } catch { setAllUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total:    allUsers.length,
    active:   allUsers.filter(u => u.status === "Active").length,
    managers: allUsers.filter(u => u.role?.roleId === 2).length,
    admins:   allUsers.filter(u => u.role?.roleId === 1).length,
  }), [allUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allUsers.filter(u => {
      const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === "all"
        || (roleFilter === "admin"   && u.role?.roleId === 1)
        || (roleFilter === "manager" && u.role?.roleId === 2)
        || (roleFilter === "user"    && u.role?.roleId === 3);
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage  = () => setPage(1);

  const handleSaved = (updated: UserAccountResponse) => {
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    // keep drawer open so user sees the change
    setDetailUser(updated);
  };

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <AnimatePresence>
        {detailUser && (
          <UserDetailDrawer
            user={detailUser}
            onClose={() => setDetailUser(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Quản lý người dùng</h1>
        <p className="text-sm text-slate-400 mt-0.5">Bấm vào hàng để xem chi tiết và phân quyền tài khoản</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Tổng người dùng" value={stats.total}    color="#6366F1" bg="#EEF2FF" />
        <StatCard icon={UserCheck} label="Đang hoạt động"  value={stats.active}   color="#059669" bg="#D1FAE5" />
        <StatCard icon={Briefcase} label="Quản lý"         value={stats.managers} color="#2563EB" bg="#DBEAFE" />
        <StatCard icon={Shield}    label="Admin"           value={stats.admins}   color="#7C3AED" bg="#EDE9FE" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-400 transition">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            placeholder="Tìm tên hoặc email..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
          {search && (
            <button onClick={() => { setSearch(""); resetPage(); }}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-semibold">
          {(["all","admin","manager","user"] as const).map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); resetPage(); }}
              className={`px-3 py-2 transition ${roleFilter === r ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {r === "all" ? "Tất cả" : r === "admin" ? "Admin" : r === "manager" ? "Manager" : "User"}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-semibold">
          {(["all","Active","Banned","Unverified"] as const).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); resetPage(); }}
              className={`px-3 py-2 transition ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {s === "all" ? "Tất cả" : STATUS[s].label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-indigo-300">
            <Loader2 size={20} className="animate-spin" /> Đang tải...
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">Không có người dùng nào khớp.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Người dùng</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Gói dịch vụ</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Điểm</th>
                <th className="px-5 py-3.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(u => {
                const rc       = ROLE_COLORS[u.role?.roleId ?? 3] ?? ROLE_COLORS[3];
                const sc       = STATUS[u.status] ?? STATUS.Unverified;
                const StatusIcon = sc.Icon;
                const initials = u.fullName.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
                const scoreCol = u.systemScore >= 75 ? "#10B981" : u.systemScore >= 50 ? "#F59E0B" : "#EF4444";
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    onClick={() => setDetailUser(u)}
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: `linear-gradient(135deg, ${rc.text}, ${rc.text}cc)` }}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background: rc.bg, color: rc.text }}>
                        {u.role?.roleName ?? "User"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background: sc.bg, color: sc.color }}>
                        <StatusIcon size={10} /> {sc.label}
                      </span>
                    </td>

                    {/* Active Plan */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {u.activePlanName ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ background: "#EEF2FF", color: "#6366F1" }}>
                          {u.activePlanName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">Miễn phí</span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm font-bold" style={{ color: scoreCol }}>{u.systemScore}</span>
                      <span className="text-xs text-slate-300">/100</span>
                    </td>

                    {/* Arrow hint */}
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    </td>
                  </tr>
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
    </div>
  );
}
