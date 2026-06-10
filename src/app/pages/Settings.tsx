import { useState, useEffect } from "react";
import {
  User, Mail, Save, CheckCircle2, Lock, Building2, Crown,
  AlertCircle, Clock, Users, ChevronRight, Star, Shield,
} from "lucide-react";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { lessonService } from "../services/lessonService";
import { campaignService } from "../services/campaignService";
import { scenarioService } from "../services/scenarioService";
import { companyService } from "../services/companyService";
import { subscriptionService } from "../services/subscriptionService";

// ─── Kiểu tab ─────────────────────────────────────────────────────────────────
type TabId = "profile" | "security" | "plan";

const TABS: { id: TabId; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: "profile",  label: "Hồ sơ",          desc: "Thông tin cá nhân",       Icon: User      },
  { id: "security", label: "Bảo mật",         desc: "Mật khẩu & xác thực",    Icon: Lock      },
  { id: "plan",     label: "Công ty & Gói",   desc: "Tổ chức & dịch vụ",      Icon: Building2 },
];

// ─── Input component ──────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, type = "text", value = "", onChange, placeholder = "", hint,
}: {
  label: string; icon: React.ElementType; type?: string; value?: string;
  onChange?: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white transition-all duration-150"
        style={{
          border: focused ? "1.5px solid #6366F1" : "1.5px solid #E2E8F0",
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
        }}
      >
        <Icon size={15} style={{ color: focused ? "#6366F1" : "#94A3B8" }} className="shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 outline-none text-sm text-slate-700 bg-transparent"
          style={{ fontFamily: "inherit" }}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-100" />
      {label && <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>}
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Settings() {
  const [tab, setTab]         = useState<TabId>("profile");
  const [loading, setLoading] = useState(true);

  // Profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved]       = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  // Password
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew]         = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdError, setPwdError]     = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Company / manager / plan
  const [company, setCompany]       = useState<any>(null);
  const [manager, setManager]       = useState<any>(null);
  const [planStatus, setPlanStatus] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({ completedLessons: 0, totalLessons: 0, totalAttempts: 0 });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        if (profile) {
          setFullName(profile.fullName || "");
          setEmail(profile.email || "");
          setAvatarUrl(profile.avatarUrl || "");
        }

        const [companyData, managerData, planData] = await Promise.all([
          companyService.getMyCompany().catch(() => null),
          userService.getMyManager().catch(() => null),
          subscriptionService.getMyPlanStatus().catch(() => null),
        ]);
        setCompany(companyData);
        setManager(managerData);
        setPlanStatus(planData);

        if (profile?.id) {
          const [allLessons, progressList, myCampaigns] = await Promise.all([
            lessonService.getAllLessons().catch(() => []),
            lessonService.getUserProgress(profile.id).catch(() => []),
            campaignService.getMyCampaigns().catch(() => []),
          ]);
          let attemptCount = 0;
          if (myCampaigns?.length) {
            const lists = await Promise.all(
              myCampaigns.map((c: any) => scenarioService.getMyAttempts(c.campaignId).catch(() => []))
            );
            attemptCount = lists.flat().length;
          }
          setStats({
            completedLessons: progressList.filter((p: any) => p.isCompleted).length,
            totalLessons: allLessons.length || 0,
            totalAttempts: attemptCount,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaveErr("");
    setSaved(false);
    try {
      await userService.updateUserProfile({ fullName, email, avatarUrl });
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        parsed.fullName = fullName;
        parsed.email = email;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveErr(err?.message || "Đã xảy ra lỗi khi lưu");
    }
  }

  async function handleChangePassword() {
    setPwdError(""); setPwdSuccess("");
    if (!pwdCurrent || !pwdNew || !pwdConfirm) { setPwdError("Vui lòng điền đầy đủ 3 ô."); return; }
    if (pwdNew.length < 6) { setPwdError("Mật khẩu mới tối thiểu 6 ký tự."); return; }
    if (pwdNew !== pwdConfirm) { setPwdError("Mật khẩu xác nhận không khớp."); return; }
    setPwdLoading(true);
    try {
      const res: any = await authService.changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew, confirmPassword: pwdConfirm });
      if (res?.isSuccess) { setPwdSuccess("Đổi mật khẩu thành công!"); setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); }
      else setPwdError(res?.errorMessage || "Đổi mật khẩu thất bại.");
    } catch (err: any) { setPwdError(err?.message || "Đã xảy ra lỗi."); }
    finally { setPwdLoading(false); }
  }

  // Avatar initials
  const abbr = fullName.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "U";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mx-auto mb-4 w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 text-sm font-medium">Đang tải...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="max-w-4xl mx-auto">

      {/* ── Outer card (2 columns) ────────────────────────────────────────── */}
      <div className="flex rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm min-h-[600px]"
        style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>

        {/* ═══════ LEFT SIDEBAR ═══════════════════════════════════════════ */}
        <aside className="w-56 shrink-0 flex flex-col border-r border-slate-100"
          style={{ background: "#FAFAFA" }}>

          {/* User card */}
          <div className="px-5 pt-7 pb-5 border-b border-slate-100">
            <div className="flex flex-col items-center text-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 border-2 border-white shadow"
                  style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
                  {abbr}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight truncate max-w-[140px]">{fullName || "Người dùng"}</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài khoản</p>
            {TABS.filter(t => t.id !== "plan").map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                style={{
                  background: tab === id ? "#EEF2FF" : "transparent",
                  color: tab === id ? "#4F46E5" : "#64748B",
                  fontWeight: tab === id ? 600 : 400,
                  fontSize: "0.875rem",
                }}
              >
                <Icon size={16} style={{ color: tab === id ? "#6366F1" : "#94A3B8" }} />
                {label}
              </button>
            ))}

            <div className="pt-3">
              <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổ chức</p>
              <button
                onClick={() => setTab("plan")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                style={{
                  background: tab === "plan" ? "#EEF2FF" : "transparent",
                  color: tab === "plan" ? "#4F46E5" : "#64748B",
                  fontWeight: tab === "plan" ? 600 : 400,
                  fontSize: "0.875rem",
                }}
              >
                <Building2 size={16} style={{ color: tab === "plan" ? "#6366F1" : "#94A3B8" }} />
                Công ty & Gói
              </button>
            </div>
          </nav>

          {/* Plan badge in sidebar */}
          <div className="px-4 pb-5">
            {planStatus?.hasPlan ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", border: "1px solid #C7D2FE" }}>
                <Crown size={13} style={{ color: "#6366F1" }} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-indigo-700 truncate">{planStatus.planName ?? "Gói doanh nghiệp"}</p>
                  <p className="text-[10px] text-indigo-400">{planStatus.daysRemaining ?? 0} ngày còn lại</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-200 bg-slate-50">
                <Star size={13} className="text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500 font-medium">Chưa có gói</p>
              </div>
            )}
          </div>
        </aside>

        {/* ═══════ RIGHT CONTENT ══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Section heading */}
          <div className="px-8 pt-7 pb-5 border-b border-slate-100">
            {TABS.map(t => t.id === tab && (
              <div key={t.id}>
                <h1 className="font-bold text-slate-900" style={{ fontSize: "1.25rem" }}>{t.label}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Section content */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">

            {/* ── TAB: Hồ sơ ─────────────────────────────────────────── */}
            {tab === "profile" && (
              <div className="space-y-6">
                {/* Avatar row */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Ảnh đại diện</p>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
                        {abbr}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500">Ảnh hiển thị trên hệ thống AntiPhisher</p>
                    </div>
                  </div>
                </div>

                <Divider label="Thông tin cơ bản" />

                {saveErr && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-semibold">
                    <AlertCircle size={14} className="shrink-0" /> {saveErr}
                  </div>
                )}

                <div className="space-y-4">
                  <Field label="Họ và tên" icon={User} value={fullName} onChange={setFullName} placeholder="Nhập họ và tên" />
                  <Field label="Địa chỉ Email" icon={Mail} type="email" value={email} onChange={setEmail}
                    placeholder="email@example.com" hint="Dùng để đăng nhập vào tài khoản" />
                </div>

                <Divider label="Tiến độ học tập" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4 border border-slate-100 bg-slate-50 text-center">
                    <p className="text-2xl font-extrabold text-indigo-600">{stats.completedLessons}
                      <span className="text-base font-bold text-slate-300">/{stats.totalLessons}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Bài học hoàn thành</p>
                  </div>
                  <div className="rounded-xl p-4 border border-slate-100 bg-slate-50 text-center">
                    <p className="text-2xl font-extrabold text-indigo-600">{stats.totalAttempts}</p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Email mô phỏng đã làm</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Bảo mật ───────────────────────────────────────── */}
            {tab === "security" && (
              <div className="space-y-4 max-w-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Đổi mật khẩu</p>
                  <p className="text-xs text-slate-400">Mật khẩu mới phải có ít nhất 6 ký tự.</p>
                </div>

                {pwdError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-semibold">
                    <AlertCircle size={14} className="shrink-0" /> {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 size={14} className="shrink-0" /> {pwdSuccess}
                  </div>
                )}

                <Divider />

                <div className="space-y-4">
                  <Field label="Mật khẩu hiện tại" icon={Lock} type="password" value={pwdCurrent} onChange={setPwdCurrent} placeholder="••••••••" />
                  <Field label="Mật khẩu mới" icon={Shield} type="password" value={pwdNew} onChange={setPwdNew} placeholder="Ít nhất 6 ký tự" />
                  <Field label="Xác nhận mật khẩu mới" icon={Shield} type="password" value={pwdConfirm} onChange={setPwdConfirm} placeholder="Nhập lại mật khẩu mới" />
                </div>
              </div>
            )}

            {/* ── TAB: Công ty & Gói ─────────────────────────────────── */}
            {tab === "plan" && (
              <div className="space-y-5">

                {/* Company block */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Công ty</p>
                  {company ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt="logo" className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-100" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Building2 size={20} className="text-indigo-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{company.companyName || "—"}</p>
                        {company.domain && <p className="text-xs text-slate-400 mt-0.5">{company.domain}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 text-center">
                      Bạn chưa được gán vào công ty nào.
                    </div>
                  )}
                </div>

                {/* Manager block */}
                {manager && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quản lý của bạn</p>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Users size={16} className="text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{manager.managerName}</p>
                        {manager.managerEmail && <p className="text-xs text-slate-400 mt-0.5">{manager.managerEmail}</p>}
                        {manager.teamName && <p className="text-xs text-indigo-400 mt-0.5">Nhóm: {manager.teamName}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan block */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gói dịch vụ</p>

                  {planStatus?.hasPlan ? (
                    <div className="rounded-xl border border-indigo-200 overflow-hidden">
                      {/* Plan banner */}
                      <div className="px-5 py-4 flex items-center gap-3"
                        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)" }}>
                        <Crown size={20} className="text-yellow-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm">{planStatus.planName ?? "Gói doanh nghiệp"}</p>
                          <p className="text-indigo-200 text-xs mt-0.5">Đang hoạt động</p>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full shrink-0">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      </div>
                      {/* Plan details */}
                      <div className="px-5 py-4 bg-white space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
                          <span className="text-slate-500 flex items-center gap-2"><Clock size={13} />Ngày hết hạn</span>
                          <span className="font-semibold text-slate-700">
                            {planStatus.endDate
                              ? new Date(planStatus.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
                          <span className="text-slate-500 flex items-center gap-2"><Clock size={13} />Còn lại</span>
                          <span className={`font-bold ${(planStatus.daysRemaining ?? 0) <= 14 ? "text-red-500" : "text-indigo-600"}`}>
                            {planStatus.daysRemaining ?? 0} ngày
                          </span>
                        </div>
                        {planStatus.maxSlots != null && (
                          <div className="flex items-center justify-between py-2 text-sm">
                            <span className="text-slate-500 flex items-center gap-2"><Users size={13} />Thành viên</span>
                            <span className="font-semibold text-slate-700">{planStatus.usedSlots}/{planStatus.maxSlots} slot</span>
                          </div>
                        )}
                        {(planStatus.daysRemaining ?? 0) <= 14 && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 mt-2">
                            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-500 font-medium">Gói sắp hết hạn. Vui lòng liên hệ quản lý để gia hạn kịp thời.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Star size={20} className="text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm mb-1">
                        {planStatus?.status === "Expired" ? "Gói dịch vụ đã hết hạn" : "Chưa có gói dịch vụ"}
                      </p>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        {planStatus?.status === "Expired"
                          ? "Liên hệ quản lý để gia hạn và tiếp tục truy cập toàn bộ nội dung."
                          : "Nâng cấp để mở khoá đầy đủ bài học, mô phỏng thực chiến và báo cáo AI."}
                      </p>
                      <div className="space-y-2 text-left max-w-xs mx-auto mb-5">
                        {[
                          "Truy cập đầy đủ 4 phase học tập",
                          "Mô phỏng phishing thực chiến",
                          "Báo cáo & phân tích rủi ro AI",
                        ].map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 size={12} className="text-indigo-400 shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="text-xs text-indigo-700 font-semibold">Liên hệ quản lý để đăng ký gói</span>
                        <ChevronRight size={14} className="text-indigo-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom action bar ─────────────────────────────────────── */}
          {tab !== "plan" && (
            <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3"
              style={{ background: "#FAFAFA" }}>
              <button
                onClick={() => {
                  if (tab === "profile") {
                    const u = userService.getCurrentUser();
                    if (u) { setFullName(u.fullName || ""); setEmail(u.email || ""); }
                    setSaveErr("");
                  } else {
                    setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); setPwdError(""); setPwdSuccess("");
                  }
                }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>

              {tab === "profile" && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: saved ? "#10B981" : "linear-gradient(135deg, #4F46E5, #6366F1)",
                    minWidth: 140, justifyContent: "center",
                  }}
                >
                  {saved ? <><CheckCircle2 size={15} /> Đã lưu!</> : <><Save size={15} /> Lưu thay đổi</>}
                </button>
              )}

              {tab === "security" && (
                <button
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: pwdLoading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5, #6366F1)",
                    cursor: pwdLoading ? "not-allowed" : "pointer",
                    minWidth: 160, justifyContent: "center",
                  }}
                >
                  {pwdLoading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                    : <><Lock size={14} /> Đổi mật khẩu</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
