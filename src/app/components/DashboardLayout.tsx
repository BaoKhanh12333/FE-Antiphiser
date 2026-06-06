import { Outlet, NavLink, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import {
  LayoutDashboard, BookOpen, ShieldAlert, BarChart3,
  X, Shield, LogOut, Settings, Menu, Bell, Search,
  Users, FileCheck, LayoutGrid, Sliders, Library, ChevronDown, PlusCircle,
} from "lucide-react";

type Role = "user" | "manager" | "admin";

interface DashboardLayoutProps {
  role: Role;
}

const navByRole: Record<Role, { to: string; label: string; icon: React.ElementType; badge?: string; end?: boolean }[]> = {
  user: [
    { to: "/nguoi-dung/lo-trinh", label: "Bài học", icon: BookOpen },
    { to: "/nguoi-dung/mo-phong", label: "Mô phỏng", icon: ShieldAlert },
  ],
  manager: [
    { to: "/quan-ly", label: "Tổng quan", icon: LayoutDashboard, end: true },
    { to: "/quan-ly/tao-chien-dich", label: "Tạo chiến dịch", icon: PlusCircle },
    { to: "/quan-ly/doi-ngu", label: "Đội ngũ", icon: Users },
    { to: "/quan-ly/bao-cao", label: "Báo cáo & AI", icon: BarChart3 },
  ],
  admin: [
    { to: "/quan-tri", label: "Tổng quan hệ thống", icon: LayoutDashboard, end: true },
    { to: "/quan-tri/kich-ban", label: "Thư viện kịch bản", icon: Library },
    { to: "/quan-tri/ai-controller", label: "Bộ điều khiển AI", icon: Sliders },
    { to: "/quan-tri/quan-ly", label: "Quản lý người dùng", icon: LayoutGrid },
  ],
};

const defaultRoleLabels: Record<Role, { dept: string; color: string }> = {
  user:    { dept: "Nhân viên",      color: "#10B981" },
  manager: { dept: "Quản lý",       color: "#6366F1" },
  admin:   { dept: "Quản trị viên", color: "#F59E0B" },
};

const roleSwitchTargets: Record<Role, { label: string; path: string }[]> = {
  user:    [{ label: "Quản lý", path: "/quan-ly" }, { label: "Admin", path: "/quan-tri" }],
  manager: [{ label: "Nhân viên", path: "/nguoi-dung" }, { label: "Admin", path: "/quan-tri" }],
  admin:   [{ label: "Nhân viên", path: "/nguoi-dung" }, { label: "Quản lý", path: "/quan-ly" }],
};

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const navItems = navByRole[role];
  // const switchTargets = roleSwitchTargets[role]; // Unused after removing quick role switch

  // Load real user profile from localStorage (populated after login)
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; role?: { roleName: string } } | null>(null);

  useEffect(() => {
    const cached = userService.getCurrentUser();
    if (cached) {
      setUserProfile(cached);
    } else if (authService.isAuthenticated()) {
      userService.getUserProfile()
        .then((profile) => setUserProfile(profile))
        .catch(() => {});
    }
  }, []);

  const displayName = userProfile?.fullName || "Người dùng";
  const displayEmail = userProfile?.email || "";
  const abbr = displayName.split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase() || "U";
  const roleColor = defaultRoleLabels[role].color;
  const roleDept = userProfile?.role?.roleName || defaultRoleLabels[role].dept;

  // Dữ liệu user cho sidebar và topbar
  const user = { name: displayName, dept: roleDept, abbr, color: roleColor };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: "#F0F2FF" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 700, fontSize: "1.1rem" }}>AntiPhisher</p>
            <p className="text-indigo-300" style={{ fontSize: "0.72rem" }}>
              {role === "user" ? "Nền tảng bảo mật AI" : role === "manager" ? "Bảng quản lý đội nhóm" : "Bảng điều khiển hệ thống"}
            </p>
          </div>
          <button className="ml-auto lg:hidden text-indigo-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User info + role switcher */}
        <div className="mx-4 mt-4 rounded-xl p-3 relative" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontWeight: 700 }}>
              {user.abbr}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white truncate" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user.name}</p>
              <p className="text-indigo-300 truncate" style={{ fontSize: "0.7rem" }}>{user.dept}</p>
            </div>
            <button onClick={() => setDropdownOpen((v) => !v)} className="text-indigo-300 hover:text-white">
              <ChevronDown size={16} />
            </button>
          </div>
          {dropdownOpen && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
              <button
                className="w-full text-left px-3 py-2 text-red-300 hover:bg-red-500/10 transition-all border-white/10"
                style={{ fontSize: "0.82rem" }}
                onClick={handleLogout}
              >
                <LogOut size={13} className="inline mr-1.5" />Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-indigo-400 uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.1em", fontWeight: 600 }}>Menu chính</p>
          {navItems.map(({ to, label, icon: Icon, badge, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? "text-white shadow-lg" : "text-indigo-200 hover:text-white hover:bg-white/10"}`
              }
              style={({ isActive }) => isActive ? { background: "linear-gradient(135deg, #6366F1, #818CF8)" } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-white" : "text-indigo-300 group-hover:text-white"} />
                  <span style={{ fontWeight: isActive ? 600 : 400, fontSize: "0.9rem" }}>{label}</span>
                  {badge && <span className="ml-auto text-white px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.65rem", background: "#F59E0B", fontWeight: 700 }}>{badge}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => {
              const base = role === "user" ? "/nguoi-dung" : role === "manager" ? "/quan-ly" : "/quan-tri";
              navigate(`${base}/cai-dat`);
              setSidebarOpen(false);
            }}
          >
            <Settings size={18} /><span style={{ fontSize: "0.9rem" }}>Cài đặt</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-200 hover:text-red-300 hover:bg-red-500/10 transition-all" onClick={handleLogout}>
            <LogOut size={18} /><span style={{ fontSize: "0.9rem" }}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-16 border-b shrink-0" style={{ background: "#fff", borderColor: "rgba(99,102,241,0.15)" }}>
          <button className="lg:hidden text-indigo-600 hover:text-indigo-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 flex-1 max-w-md rounded-xl px-3 py-2" style={{ background: "#F0F2FF" }}>
            <Search size={16} className="text-indigo-400 shrink-0" />
            <input className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-indigo-300" placeholder="Tìm kiếm..." style={{ fontSize: "0.875rem" }} />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-indigo-50 transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
            </button>
            {role === "user" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                <span style={{ fontSize: "1rem" }}>🔥</span>
                <span className="text-amber-700" style={{ fontWeight: 700, fontSize: "0.85rem" }}>7 ngày</span>
              </div>
            )}
            <div
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontWeight: 700, fontSize: "0.85rem" }}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              {user.abbr}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
