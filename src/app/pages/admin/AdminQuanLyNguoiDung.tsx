import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Mail,
  Shield,
  UserPlus,
  Download,
  Edit2,
  RefreshCw,
  Loader2
} from "lucide-react";
import { userService } from "../../services/userService";
import { motion, AnimatePresence } from "framer-motion";

export interface RoleResponse {
    roleId: number;
    roleName: string;
}

export interface UserAccountResponse {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  lastLogin?: string;
  role: RoleResponse;
  status: string;
  systemScore: number;
  riskLevel: string;
}

const riskConfig = {
  Low: { label: "Thấp", color: "#10B981", glow: "rgba(16,185,129,0.3)" },
  Medium: { label: "Trung bình", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  High: { label: "Cao", color: "#EF4444", glow: "rgba(239,68,68,0.3)" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  Active: { label: "Hoạt động", color: "#059669", bg: "#D1FAE5" },
  Banned: { label: "Khóa", color: "#DC2626", bg: "#FEE2E2" },
  Unverified: { label: "Chưa xác minh", color: "#D97706", bg: "#FEF3C7" },
};

/* ── Edit Dialog ──────────────────────────────────── */
function EditUserDialog({ user, onClose, onRefresh }: { user: UserAccountResponse; onClose: () => void; onRefresh: () => void }) {
  const [roleId, setRoleId] = useState(user.role?.roleId || 3);
  const [status, setStatus] = useState(user.status || "Unverified");
  const [score, setScore] = useState(user.systemScore || 0);
  const [risk, setRisk] = useState(user.riskLevel || "Low");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await userService.updateUserStatusOrRole({
        userId: user.id,
        roleId: roleId,
        status: status,
        systemScore: score,
        riskLevel: risk,
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-2xl"
        style={{
          width: 400,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          color: "#fff"
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Cập nhật tài khoản</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Người dùng</label>
            <div className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">{user.fullName} ({user.email})</div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Vai trò</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-indigo-500"
            >
              <option value={1}>Admin (Quản trị)</option>
              <option value={2}>Manager (Quản lý)</option>
              <option value={3}>User (Nhân viên)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Banned">Banned</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-white font-bold flex justify-center items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #10B981, #059669)",
            boxShadow: "0 0 20px rgba(16,185,129,0.3)"
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Xác nhận cập nhật"}
        </button>
      </motion.div>
    </>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function AdminQuanLyNguoiDung() {
  const [users, setUsers] = useState<UserAccountResponse[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<UserAccountResponse | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllAccounts(search, page, 10);
      if (data) {
        setUsers(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceRequest = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceRequest);
  }, [search, page]);

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      <AnimatePresence>
        {editUser && (
          <EditUserDialog
            user={editUser}
            onClose={() => setEditUser(null)}
            onRefresh={fetchUsers}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            {totalCount} người dùng · Quản trị phân quyền và trạng thái
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{
          background: "#fff",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Search size={18} className="text-indigo-400 shrink-0" />
        <input
          className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ fontSize: "0.9rem" }}
        />
        {loading && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
        <table className="w-full text-left">
          <thead style={{ background: "#F8FAFF", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Điểm / Risk</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(99,102,241,0.05)" }}>
            {users.map((u) => {
              const r = riskConfig[u.riskLevel as keyof typeof riskConfig] || riskConfig.Low;
              const s = statusConfig[u.status] || statusConfig.Unverified;
              
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">{u.role?.roleName || "User"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md" style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: r.color }}>{u.systemScore} điểm</span>
                      <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded uppercase tracking-wider text-white" style={{ background: r.color, boxShadow: `0 0 8px ${r.glow}` }}>
                        Risk: {r.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setEditUser(u)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Chưa có người dùng nào trùng khớp.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
          <p className="text-xs text-slate-500">Trang {page} ({users.length} trên tổng số {totalCount})</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < 10}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

