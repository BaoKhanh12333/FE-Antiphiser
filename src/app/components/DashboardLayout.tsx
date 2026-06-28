import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import axiosInstance from "../api/axiosInstance";
import {
  LayoutDashboard, BookOpen, ShieldAlert, BarChart3,
  X, LogOut, Settings, Menu, Bell, Search,
  Users, LayoutGrid, Sliders, Library, ChevronDown, PlusCircle, Package,
  ChevronsLeft, ChevronsRight, Trophy,
} from "lucide-react";
import logoNgang from "../../data/logo ngang.png";
import logoVuong from "../../data/logo vuoong.png";
import { BaselineModal } from "./BaselineModal";

type Role = "user" | "manager" | "admin";

interface DashboardLayoutProps {
  role: Role;
}

const navByRole: Record<Role, { to: string; label: string; icon: React.ElementType; badge?: string; end?: boolean; comingSoon?: boolean }[]> = {
  user: [
    { to: "/nguoi-dung", label: "Tổng quan", icon: LayoutDashboard, end: true },
    { to: "/nguoi-dung/lo-trinh", label: "Bài học", icon: BookOpen },
    { to: "/nguoi-dung/mo-phong", label: "Mô phỏng", icon: ShieldAlert },
    { to: "/nguoi-dung/bao-cao-ai", label: "Báo cáo AI", icon: BarChart3 },
  ],
  manager: [
    { to: "/quan-ly", label: "Tổng quan", icon: LayoutDashboard, end: true },
    { to: "/quan-ly/tao-chien-dich", label: "Tạo chiến dịch", icon: PlusCircle },
    { to: "/quan-ly/nhan-vien", label: "Nhân viên", icon: Users },
    { to: "/quan-ly/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/quan-ly/bao-cao", label: "Báo cáo & AI", icon: BarChart3 },
  ],
  admin: [
    { to: "/quan-tri", label: "Tổng quan hệ thống", icon: LayoutDashboard, end: true },
    { to: "/quan-tri/tao-chien-dich", label: "Tạo chiến dịch", icon: PlusCircle },
    { to: "/quan-tri/bai-hoc", label: "Quản lý bài học", icon: BookOpen },
    { to: "/quan-tri/kich-ban", label: "Thư viện kịch bản", icon: Library },
    { to: "/quan-tri/goi-dich-vu", label: "Quản lý gói dịch vụ", icon: Package },
    { to: "/quan-tri/ai-controller", label: "Bộ điều khiển AI", icon: Sliders },
    { to: "/quan-tri/quan-ly", label: "Quản lý người dùng", icon: LayoutGrid },
    { to: "/quan-tri/bao-cao-ai", label: "Báo cáo AI Tổ chức", icon: BarChart3 },
  ],
};

const defaultRoleLabels: Record<Role, { dept: string; color: string }> = {
  user:    { dept: "Nhân viên",      color: "#10B981" },
  manager: { dept: "Quản lý",        color: "#6366F1" },
  admin:   { dept: "Quản trị viên",  color: "#F59E0B" },
};

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed]       = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const navItems  = navByRole[role];

  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; role?: { roleName: string } } | null>(null);
  const [showBaseline, setShowBaseline] = useState(false);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    if (role === "user" && !localStorage.getItem("baselineCompleted")) {
      setShowBaseline(true);
    }
  }, [role]);

  useEffect(() => {
    if (role !== "user") return;
    (axiosInstance as any)
      .get("Analytics/my-report")
      .then((data: { recentTrend: { date: string; correct: number; total: number }[] }) => {
        const trend = data.recentTrend ?? [];
        let s = 0;
        for (let i = trend.length - 1; i >= 0; i--) {
          if (trend[i].total > 0) s++;
          else break;
        }
        setStreak(s);
      })
      .catch(() => {});
  }, [role]);

  const handleBaselineComplete = () => {
    localStorage.setItem("baselineCompleted", "true");
    setShowBaseline(false);
  };

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
  const abbr        = displayName.split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase() || "U";
  const roleColor   = defaultRoleLabels[role].color;
  const roleDept    = userProfile?.role?.roleName || defaultRoleLabels[role].dept;
  const user        = { name: displayName, dept: roleDept, abbr, color: roleColor };

  const handleLogout = () => authService.logout();

  const sidebarBg = "linear-gradient(180deg, #0f1631 0%, #1a1760 55%, #1e1b7e 100%)";

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: "#F0F2FF" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          ${collapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
        style={{ background: sidebarBg }}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-white/10 transition-all duration-300 ${collapsed ? "justify-center px-3 py-5" : "px-4 py-4 gap-3"}`}>
          {collapsed ? (
            /* Collapsed: square logo, click to expand */
            <button onClick={() => setCollapsed(false)} className="focus:outline-none" title="Mở rộng">
              <img src={logoVuong} alt="AntiPhisher" style={{ width: 42, height: 42, objectFit: "contain" }} />
            </button>
          ) : (
            /* Expanded: horizontal logo + collapse button */
            <>
              <div style={{ flex: 1, minWidth: 0, height: 44 }}>
                <img
                  src={logoNgang}
                  alt="AntiPhisher"
                  style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center", display: "block" }}
                />
              </div>
              <button
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                onClick={() => setCollapsed(true)}
                title="Thu gọn"
              >
                <ChevronsLeft size={16} />
              </button>
              <button className="lg:hidden text-indigo-300 hover:text-white shrink-0" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </>
          )}
        </div>

        {/* User card */}
        {collapsed ? (
          /* Collapsed: just avatar */
          <div className="flex justify-center mt-4 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontWeight: 700, fontSize: "0.85rem" }}
              title={user.name}
            >
              {user.abbr}
            </div>
          </div>
        ) : (
          /* Expanded: full user card */
          <div className="mx-4 mt-4 rounded-xl p-3 relative" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontWeight: 700 }}
              >
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
                  className="w-full text-left px-3 py-2 text-red-300 hover:bg-red-500/10 transition-all"
                  style={{ fontSize: "0.82rem" }}
                  onClick={handleLogout}
                >
                  <LogOut size={13} className="inline mr-1.5" />Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          {!collapsed && (
            <p className="px-3 mb-2 text-indigo-400 uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.1em", fontWeight: 600 }}>
              Menu chính
            </p>
          )}
          {navItems.map(({ to, label, icon: Icon, badge, end, comingSoon }) =>
            comingSoon ? (
              <div
                key={label}
                title={label}
                className={`flex items-center rounded-xl cursor-not-allowed opacity-40 transition-all
                  ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"}`}
              >
                <Icon size={18} className="text-indigo-300 shrink-0" />
                {!collapsed && (
                  <>
                    <span style={{ fontSize: "0.9rem" }} className="text-indigo-200">{label}</span>
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md text-indigo-300"
                      style={{ background: "rgba(255,255,255,0.1)", letterSpacing: "0.03em" }}>
                      Soon
                    </span>
                  </>
                )}
              </div>
            ) : (
              <NavLink
                key={to} to={to} end={end}  
                title={collapsed ? label : undefined}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl transition-all group
                  ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"}
                  ${isActive ? "text-white shadow-md" : "text-indigo-300 hover:text-white hover:bg-white/10"}`
                }
                style={({ isActive }) => isActive ? { background: "linear-gradient(135deg, #6366F1, #818CF8)" } : {}}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`shrink-0 ${isActive ? "text-white" : "text-indigo-400 group-hover:text-white"}`} />
                    {!collapsed && (
                      <>
                        <span style={{ fontWeight: isActive ? 600 : 400, fontSize: "0.9rem" }}>{label}</span>
                        {badge && (
                          <span className="ml-auto text-white px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.65rem", background: "#F59E0B", fontWeight: 700 }}>
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Bottom actions */}
        <div className={`pb-4 space-y-0.5 border-t border-white/10 pt-3 ${collapsed ? "px-2" : "px-3"}`}>
          <button
            title={collapsed ? "Cài đặt" : undefined}
            className={`w-full flex items-center rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-all
              ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"}`}
            onClick={() => {
              const base = role === "user" ? "/nguoi-dung" : role === "manager" ? "/quan-ly" : "/quan-tri";
              navigate(`${base}/cai-dat`);
              setSidebarOpen(false);
            }}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span style={{ fontSize: "0.9rem" }}>Cài đặt</span>}
          </button>
          <button
            title={collapsed ? "Đăng xuất" : undefined}
            className={`w-full flex items-center rounded-xl text-indigo-300 hover:text-red-300 hover:bg-red-500/10 transition-all
              ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"}`}
            onClick={handleLogout}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span style={{ fontSize: "0.9rem" }}>Đăng xuất</span>}
          </button>

          {/* Expand button when collapsed */}
          {collapsed && (
            <button
              title="Mở rộng"
              className="w-full flex items-center justify-center rounded-xl text-indigo-400 hover:text-white hover:bg-white/10 transition-all px-2 py-2.5 mt-1"
              onClick={() => setCollapsed(false)}
            >
              <ChevronsRight size={16} />
            </button>
          )}
        </div>
      </aside>

      {showBaseline && <BaselineModal onComplete={handleBaselineComplete} />}

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-16 border-b shrink-0" style={{ background: "#fff", borderColor: "rgba(99,102,241,0.15)" }}>
          <button className="lg:hidden text-indigo-600 hover:text-indigo-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 flex-1 max-w-md rounded-xl px-3 py-2" style={{ background: "#F0F2FF" }}>
            <Search size={16} className="text-indigo-400 shrink-0" />
            <input
              className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-indigo-300"
              placeholder="Tìm kiếm..."
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-indigo-50 transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
            </button>
            {role === "user" && streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                <span style={{ fontSize: "1rem" }}>🔥</span>
                <span className="text-amber-700" style={{ fontWeight: 700, fontSize: "0.85rem" }}>{streak} ngày</span>
              </div>
            )}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontWeight: 700, fontSize: "0.85rem" }}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              {user.abbr}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
