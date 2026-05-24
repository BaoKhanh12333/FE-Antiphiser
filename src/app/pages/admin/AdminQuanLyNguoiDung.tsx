import { useState } from "react";
import {
  Search,
  Plus,
  X,
  ChevronRight,
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
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const users = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@congty.vn",
    dept: "Kế toán",
    role: "Nhân viên",
    score: 83,
    risk: "low",
    lastActive: "10 phút trước",
    lessons: 12,
    totalLessons: 20,
    errors: ["Đường link giả mạo", "Tên miền giả"],
    history: [
      { date: "05/03/2026", action: "Hoàn thành bài học: Nhận diện URL giả", result: "pass" },
      { date: "04/03/2026", action: "Mô phỏng: Email Vietcombank giả", result: "fail" },
      { date: "03/03/2026", action: "Hoàn thành bài học: Social Engineering", result: "pass" },
      { date: "02/03/2026", action: "Mô phỏng: CEO Fraud email", result: "pass" },
      { date: "01/03/2026", action: "Mô phỏng: Shopee xác nhận đơn hàng", result: "fail" },
    ],
  },
  {
    id: 2,
    name: "Trần Minh Khoa",
    email: "khoa.tran@congty.vn",
    dept: "HR & Đào tạo",
    role: "Quản lý",
    score: 91,
    risk: "low",
    lastActive: "30 phút trước",
    lessons: 18,
    totalLessons: 20,
    errors: ["Tệp đính kèm độc hại"],
    history: [
      { date: "05/03/2026", action: "Phê duyệt chiến dịch phishing Q1", result: "pass" },
      { date: "04/03/2026", action: "Xem báo cáo đội nhóm", result: "pass" },
      { date: "03/03/2026", action: "Mô phỏng: Tax scam email", result: "pass" },
    ],
  },
  {
    id: 3,
    name: "Phạm Hồng Nhung",
    email: "nhung.pham@congty.vn",
    dept: "Marketing",
    role: "Nhân viên",
    score: 45,
    risk: "high",
    lastActive: "2 giờ trước",
    lessons: 6,
    totalLessons: 20,
    errors: ["Đường link giả mạo", "Tên miền giả", "Kỹ thuật tạo sự cấp bách", "File đính kèm .exe"],
    history: [
      { date: "05/03/2026", action: "Mô phỏng: Facebook login giả", result: "fail" },
      { date: "04/03/2026", action: "Mô phỏng: CEO Fraud email", result: "fail" },
      { date: "02/03/2026", action: "Hoàn thành bài học: Mật khẩu an toàn", result: "pass" },
    ],
  },
  {
    id: 4,
    name: "Lê Văn Đức",
    email: "duc.le@congty.vn",
    dept: "IT",
    role: "Quản trị",
    score: 96,
    risk: "low",
    lastActive: "5 phút trước",
    lessons: 20,
    totalLessons: 20,
    errors: [],
    history: [
      { date: "05/03/2026", action: "Cấu hình AI Controller", result: "pass" },
      { date: "04/03/2026", action: "Tạo kịch bản mới bằng AI", result: "pass" },
    ],
  },
  {
    id: 5,
    name: "Hoàng Thị Mai",
    email: "mai.hoang@congty.vn",
    dept: "Kinh doanh",
    role: "Nhân viên",
    score: 58,
    risk: "medium",
    lastActive: "1 ngày trước",
    lessons: 9,
    totalLessons: 20,
    errors: ["Tên miền giả", "Kỹ thuật tạo sự cấp bách"],
    history: [
      { date: "04/03/2026", action: "Mô phỏng: Shopee đơn hàng giả", result: "pass" },
      { date: "03/03/2026", action: "Mô phỏng: Email thuế TNCN giả", result: "fail" },
      { date: "01/03/2026", action: "Hoàn thành bài học: Nhận diện phishing", result: "pass" },
    ],
  },
  {
    id: 6,
    name: "Vũ Quang Huy",
    email: "huy.vu@congty.vn",
    dept: "Vận hành",
    role: "Nhân viên",
    score: 72,
    risk: "medium",
    lastActive: "3 giờ trước",
    lessons: 14,
    totalLessons: 20,
    errors: ["Đường link giả mạo"],
    history: [
      { date: "05/03/2026", action: "Mô phỏng: Link reset mật khẩu giả", result: "fail" },
      { date: "04/03/2026", action: "Hoàn thành bài học: QR Code scam", result: "pass" },
    ],
  },
  {
    id: 7,
    name: "Đỗ Thanh Tùng",
    email: "tung.do@congty.vn",
    dept: "Kế toán",
    role: "Nhân viên",
    score: 38,
    risk: "high",
    lastActive: "2 ngày trước",
    lessons: 4,
    totalLessons: 20,
    errors: ["Đường link giả mạo", "Tên miền giả", "File đính kèm .exe", "Yêu cầu mật khẩu"],
    history: [
      { date: "03/03/2026", action: "Mô phỏng: Hóa đơn giả nhà cung cấp", result: "fail" },
      { date: "02/03/2026", action: "Mô phỏng: Email ngân hàng giả", result: "fail" },
    ],
  },
];

type User = (typeof users)[number];

const riskConfig = {
  low: { label: "Thấp", color: "#10B981", glow: "rgba(16,185,129,0.3)" },
  medium: { label: "Trung bình", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  high: { label: "Cao", color: "#EF4444", glow: "rgba(239,68,68,0.3)" },
};

/* ── Side Panel ───────────────────────────────────── */
function UserDetailPanel({ user, onClose }: { user: User; onClose: () => void }) {
  const risk = riskConfig[user.risk as keyof typeof riskConfig];
  const progressPct = (user.lessons / user.totalLessons) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-y-auto"
        style={{
          width: "min(480px, 100vw)",
          background: "#FAFAFF",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          className="p-6 border-b shrink-0"
          style={{ borderColor: "rgba(99,102,241,0.08)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${risk.color}, ${risk.color}cc)`,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {user.name
                  .split(" ")
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#0F172A" }}>
                  {user.name}
                </h3>
                <p className="text-slate-400" style={{ fontSize: "0.82rem" }}>{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded-lg"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#6366F1", background: "#EEF2FF" }}
                  >
                    {user.dept}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-lg"
                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748B", background: "#F1F5F9" }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: risk.color }}>{user.score}</p>
              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Điểm số</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#6366F1" }}>
                {user.lessons}/{user.totalLessons}
              </p>
              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Bài học</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center justify-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: risk.color, boxShadow: `0 0 8px ${risk.glow}` }}
                />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: risk.color, marginTop: 4 }}>
                {risk.label}
              </p>
              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Mức rủi ro</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tiến độ đào tạo</span>
              <span className="text-indigo-600" style={{ fontSize: "0.82rem", fontWeight: 700 }}>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#F1F5F9" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 80 ? "#10B981" : progressPct >= 50 ? "#F59E0B" : "#EF4444",
                }}
              />
            </div>
          </div>

          {/* Errors */}
          {user.errors.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-500" />
                <span className="text-slate-700" style={{ fontSize: "0.85rem", fontWeight: 700 }}>Lỗi hay mắc phải</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.errors.map((err) => (
                  <span
                    key={err}
                    className="px-3 py-1.5 rounded-xl"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#F59E0B",
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    {err}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} className="text-indigo-500" />
              <span className="text-slate-700" style={{ fontSize: "0.85rem", fontWeight: 700 }}>Lịch sử học tập</span>
            </div>
            <div className="space-y-3">
              {user.history.map((h, i) => (
                <div
                  key={`hist-${user.id}-${i}`}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                  style={{ borderColor: "rgba(99,102,241,0.06)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: h.result === "pass" ? "#ECFDF5" : "#FEF2F2",
                    }}
                  >
                    {h.result === "pass" ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <X size={14} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {h.action}
                    </p>
                    <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <Mail size={15} /> Gửi nhắc nhở
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all hover:bg-slate-50"
              style={{
                background: "#fff",
                border: "1px solid rgba(99,102,241,0.15)",
                color: "#6366F1",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <Target size={15} /> Gán bài học
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function AdminQuanLyNguoiDung() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = users.filter(
    (u) =>
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
            {users.length} người dùng · Theo dõi và quản lý toàn bộ nhân sự
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50"
            style={{
              background: "#fff",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "#6366F1",
              fontWeight: 600,
              fontSize: "0.85rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Download size={15} /> Xuất Excel
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              fontWeight: 700,
              fontSize: "0.85rem",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            <UserPlus size={15} /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{
          background: "#fff",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Search size={18} className="text-indigo-400 shrink-0" />
        <input
          className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          placeholder="Tìm theo tên, email hoặc phòng ban..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: "0.9rem" }}
        />
        <span className="text-slate-400" style={{ fontSize: "0.78rem" }}>
          {filtered.length} kết quả
        </span>
      </div>

      {/* Table — borderless, spaced rows */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
        }}
      >
        {/* Table header */}
        <div
          className="grid items-center px-6 py-4"
          style={{
            gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr 0.5fr",
            borderBottom: "1px solid rgba(99,102,241,0.06)",
          }}
        >
          {["Người dùng", "Phòng ban", "Vai trò", "Điểm số", "Rủi ro", ""].map((h) => (
            <span key={h} className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        <div className="px-3 py-2 space-y-2">
          {filtered.map((user) => {
            const risk = riskConfig[user.risk as keyof typeof riskConfig];
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="grid items-center px-3 py-3.5 rounded-2xl cursor-pointer transition-all hover:shadow-sm group"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr 0.5fr",
                  background: "#fff",
                }}
              >
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${risk.color}, ${risk.color}cc)`,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {user.name
                      .split(" ")
                      .slice(-2)
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 truncate" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                      {user.name}
                    </p>
                    <p className="text-slate-400 truncate" style={{ fontSize: "0.75rem" }}>{user.email}</p>
                  </div>
                </div>

                {/* Department */}
                <span className="text-slate-600" style={{ fontSize: "0.85rem" }}>{user.dept}</span>

                {/* Role */}
                <span
                  className="px-2.5 py-1 rounded-lg w-fit"
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#6366F1",
                    background: "#EEF2FF",
                  }}
                >
                  {user.role}
                </span>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full flex-1 max-w-[80px]" style={{ background: "#F1F5F9" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${user.score}%`,
                        background: user.score >= 75 ? "#10B981" : user.score >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: user.score >= 75 ? "#10B981" : user.score >= 50 ? "#F59E0B" : "#EF4444" }}>
                    {user.score}
                  </span>
                </div>

                {/* Risk — blurry circle */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span
                      className="block w-3 h-3 rounded-full"
                      style={{ background: risk.color }}
                    />
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: risk.color,
                        filter: "blur(4px)",
                        opacity: 0.5,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: risk.color }}>
                    {risk.label}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel */}
      {selectedUser && (
        <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
