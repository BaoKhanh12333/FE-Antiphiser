import { useState, useEffect } from "react";
import { User, Mail, Save, CheckCircle2 } from "lucide-react";
import { userService } from "../services/userService";
import { lessonService } from "../services/lessonService";
import { campaignService } from "../services/campaignService";
import { scenarioService } from "../services/scenarioService";

// ─── Settings card wrapper ───────────────────────────────────────────────────

function SettingsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 bg-white border border-slate-100 shadow-sm ${className}`}
      style={{
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Styled input ──────────────────────────────────────────────────────────────

function LightInput({
  label, icon: Icon, type = "text", value = "", onChange, placeholder = "", suffix,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-slate-700 text-sm font-medium transition-all duration-200"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "12px 14px 12px 42px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#4F46E5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Progress Summary Stats
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load user profile
        const profile = await userService.getUserProfile();
        if (profile) {
          setFullName(profile.fullName || "");
          setEmail(profile.email || "");
          setAvatarUrl(profile.avatarUrl || "");
        }

        // Load progress summary
        if (profile?.id) {
          const [allLessons, progressList, myCampaigns] = await Promise.all([
            lessonService.getAllLessons().catch(() => []),
            lessonService.getUserProgress(profile.id).catch(() => []),
            campaignService.getMyCampaigns().catch(() => []),
          ]);

          let attemptCount = 0;
          if (myCampaigns && myCampaigns.length > 0) {
            const allAttemptsLists = await Promise.all(
              myCampaigns.map((c: any) =>
                scenarioService.getMyAttempts(c.campaignId).catch(() => [])
              )
            );
            attemptCount = allAttemptsLists.flat().length;
          }

          setStats({
            completedLessons: progressList.filter((p: any) => p.isCompleted).length,
            totalLessons: allLessons.length || 0,
            totalAttempts: attemptCount,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu cấu hình:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSave() {
    try {
      setError("");
      setSaved(false);
      await userService.updateUserProfile({
        fullName,
        email,
        avatarUrl,
      });

      // Cập nhật thông tin user trong localStorage để phản hồi UI lập tức
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const u = JSON.parse(userJson);
        u.fullName = fullName;
        u.email = email;
        localStorage.setItem("user", JSON.stringify(u));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi lưu thông tin");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative mx-auto mb-4" style={{ width: 50, height: 50 }}>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full max-w-lg mx-auto py-6 space-y-6"
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* ── Page header ─────────────────────────────────── */}
      <div className="text-center">
        <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: "#0F172A" }}>
          User Settings
        </h1>
        <p style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 4 }}>
          Cập nhật thông tin tài khoản cá nhân
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Personal Profile
      ══════════════════════════════════════════════════ */}
      <SettingsCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 shrink-0">
            <User size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-800">Thông tin cá nhân</h2>
            <p className="text-xs text-slate-400">Hồ sơ hiển thị trên nền tảng AntiPhisher</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-red-500 text-xs font-semibold bg-red-50 border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <LightInput
            label="Họ và tên"
            icon={User}
            value={fullName}
            onChange={setFullName}
            placeholder="Họ và tên của bạn"
          />
          <LightInput
            label="Địa chỉ Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Địa chỉ email"
          />
        </div>

        {/* Progress Summary Sub-Block */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-700">Tóm tắt tiến độ cá nhân</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Lý thuyết</span>
              <span className="font-bold text-slate-700 text-xs block mt-1">
                {stats.completedLessons} / {stats.totalLessons} bài học
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Mô phỏng</span>
              <span className="font-bold text-slate-700 text-xs block mt-1">
                {stats.totalAttempts} email đã làm
              </span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── Save bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400 max-w-[240px]">
          Thông tin thay đổi sẽ được áp dụng ngay lập tức sau khi lưu.
        </p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: saved ? "#10B981" : "#4F46E5",
            boxShadow: saved
              ? "0 4px 14px rgba(16, 185, 129, 0.3)"
              : "0 4px 14px rgba(79, 70, 229, 0.3)",
            minWidth: 140,
            justifyContent: "center",
          }}
        >
          {saved ? (
            <><CheckCircle2 size={16} /> Đã lưu!</>
          ) : (
            <><Save size={16} /> Lưu thay đổi</>
          )}
        </button>
      </div>
    </div>
  );
}
