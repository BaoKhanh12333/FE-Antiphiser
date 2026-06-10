import { useState, useEffect, useMemo } from "react";
import {
  Search, X, ChevronRight, ChevronLeft, AlertTriangle,
  Edit2, Loader2, Users, UserCheck, Shield, Briefcase,
  CheckCircle, Ban, Clock,
} from "lucide-react";
import { userService } from "../../services/userService";
import { motion, AnimatePresence } from "motion/react";

export interface RoleResponse  { roleId: number; roleName: string }
export interface UserAccountResponse {
  id: number; fullName: string; email: string; avatarUrl: string;
  createdAt: string; lastLogin?: string; role: RoleResponse;
  status: string; systemScore: number; riskLevel: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const RISK: Record<string, { label: string; color: string; bg: string }> = {
  Low:    { label: "Thấp",     color: "#059669", bg: "#D1FAE5" },
  Medium: { label: "TB",       color: "#D97706", bg: "#FEF3C7" },
  High:   { label: "Cao",      color: "#DC2626", bg: "#FEE2E2" },
};
const STATUS: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  Active:     { label: "Hoạt động",    color: "#059669", bg: "#D1FAE5", Icon: CheckCircle },
  Banned:     { label: "Đã khóa",      color: "#DC2626", bg: "#FEE2E2", Icon: Ban },
  Unverified: { label: "Chưa xác minh",color: "#D97706", bg: "#FEF3C7", Icon: Clock },
};
const ROLE_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#EDE9FE", text: "#7C3AED" },
  2: { bg: "#DBEAFE", text: "#1D4ED8" },
  3: { bg: "#F1F5F9", text: "#475569" },
};
const PAGE_SIZE = 12;

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditDialog({ user, onClose, onSaved }: {
  user: UserAccountResponse; onClose: () => void; onSaved: (u: UserAccountResponse) => void;
}) {
  const [roleId,  setRoleId]  = useState(user.role?.roleId  ?? 3);
  const [status,  setStatus]  = useState(user.status        ?? "Unverified");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setErr(null);
    try {
      await userService.updateUserStatusOrRole({
        userId: user.id, roleId, status,
        systemScore: user.systemScore, riskLevel: user.riskLevel,
      });
      onSaved({ ...user, status, role: { roleId, roleName: ["Admin","Manager","User"][roleId-1] } });
    } catch (e: any) { setErr(e?.message ?? "Cập nhật thất bại"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)" }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{user.fullName}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition">
            <X size={18}/>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vai trò</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 1, label: "Admin" }, { id: 2, label: "Manager" }, { id: 3, label: "User" }].map(r => (
                <button key={r.id} onClick={() => setRoleId(r.id)}
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
                <button key={key} onClick={() => setStatus(key)}
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
              <AlertTriangle size={13} className="shrink-0"/> {err}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition">
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin"/> : null}
            Lưu thay đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number | string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={18} style={{ color }}/>
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
  const [allUsers,  setAllUsers]  = useState<UserAccountResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [roleFilter, setRoleFilter] = useState<"all"|"admin"|"manager"|"user">("all");
  const [statusFilter, setStatusFilter] = useState<"all"|"Active"|"Banned"|"Unverified">("all");
  const [page,      setPage]      = useState(1);
  const [editUser,  setEditUser]  = useState<UserAccountResponse | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllAccounts("", 1, 500);
      setAllUsers(data?.items ?? []);
    } catch { setAllUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── derived stats ──
  const stats = useMemo(() => ({
    total:    allUsers.length,
    active:   allUsers.filter(u => u.status === "Active").length,
    managers: allUsers.filter(u => u.role?.roleId === 2).length,
    admins:   allUsers.filter(u => u.role?.roleId === 1).length,
  }), [allUsers]);

  // ── filter + search ──
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
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleSaved = (updated: UserAccountResponse) => {
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditUser(null);
  };

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <AnimatePresence>
        {editUser && <EditDialog user={editUser} onClose={() => setEditUser(null)} onSaved={handleSaved}/>}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Quản lý người dùng</h1>
        <p className="text-sm text-slate-400 mt-0.5">Phân quyền và quản lý trạng thái tài khoản trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Tổng người dùng" value={stats.total}    color="#6366F1" bg="#EEF2FF"/>
        <StatCard icon={UserCheck} label="Đang hoạt động"  value={stats.active}   color="#059669" bg="#D1FAE5"/>
        <StatCard icon={Briefcase} label="Quản lý"         value={stats.managers} color="#2563EB" bg="#DBEAFE"/>
        <StatCard icon={Shield}    label="Admin"           value={stats.admins}   color="#7C3AED" bg="#EDE9FE"/>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-400 transition">
          <Search size={15} className="text-slate-400 shrink-0"/>
          <input className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            placeholder="Tìm tên hoặc email..."
            value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}/>
          {search && <button onClick={() => { setSearch(""); resetPage(); }}><X size={13} className="text-slate-400"/></button>}
        </div>

        {/* Role tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-semibold">
          {(["all","admin","manager","user"] as const).map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); resetPage(); }}
              className={`px-3 py-2 transition ${roleFilter === r ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {r === "all" ? "Tất cả" : r === "admin" ? "Admin" : r === "manager" ? "Manager" : "User"}
            </button>
          ))}
        </div>

        {/* Status filter */}
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
            <Loader2 size={20} className="animate-spin"/> Đang tải...
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Không có người dùng nào khớp.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Người dùng</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Điểm / Rủi ro</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                <th className="px-5 py-3.5 w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(u => {
                const rc = ROLE_COLORS[u.role?.roleId ?? 3] ?? ROLE_COLORS[3];
                const sc = STATUS[u.status] ?? STATUS.Unverified;
                const rk = RISK[u.riskLevel]  ?? RISK.Low;
                const StatusIcon = sc.Icon;
                const initials = u.fullName.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
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
                        <StatusIcon size={10}/> {sc.label}
                      </span>
                    </td>

                    {/* Score / Risk */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{u.systemScore}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          style={{ background: rk.bg, color: rk.color }}>
                          {rk.label}
                        </span>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <button onClick={() => setEditUser(u)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition opacity-0 group-hover:opacity-100">
                        <Edit2 size={15}/>
                      </button>
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
                <ChevronLeft size={14}/>
              </button>
              <span className="text-xs text-slate-500 px-2">Trang {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
