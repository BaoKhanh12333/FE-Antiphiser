import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../services/authService";
import {
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  User,
  Lock,
} from "lucide-react";

type Role = "user" | "manager" | "admin";

const rolesList = [
  { value: "user", label: "Nhân viên", emoji: "👤", roleId: 1, roleName: "User" },
  { value: "manager", label: "Quản lý", emoji: "👔", roleId: 2, roleName: "Manager" },
  { value: "admin", label: "Quản trị", emoji: "⚙️", roleId: 3, roleName: "Admin" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  
  // UX states
  const [step, setStep] = useState<1 | 2>(1); // 1: Register Form, 2: OTP Verification
  const [userId, setUserId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = fullName.trim().length >= 2;
  const isPassValid = password.length >= 6;
  const isConfirmValid = password === confirmPassword;
  const isFormValid = isEmailValid && isNameValid && isPassValid && isConfirmValid;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMsg("");
    
    try {
      const selected = rolesList.find(r => r.value === selectedRole)!;
      const data = {
        email,
        fullName,
        password,
        confirmPassword,
        roleId: selected.roleId,
        roleName: selected.roleName
      };

      const response = await authService.register(data);

      if (response && response.isSuccess) {
        setUserId(response.result.userId);
        setStep(2); // Chuyển sang bước nhập OTP
        setSuccessMsg("Đăng ký thành công! Vui lòng kiểm tra Email để lấy mã OTP xác minh.");
      } else {
        setErrorMsg(response.errorMessage || "Đăng ký thất bại");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Không thể đăng ký. Email có thể đã tồn tại!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6 || !userId) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await authService.verifyEmail(userId, otpCode);
      if (response && response.isSuccess) {
        setSuccessMsg("Xác minh tài khoản thành công! Đang chuyển hướng về trang đăng nhập...");
        setTimeout(() => {
          navigate("/dang-nhap");
        }, 2000);
      } else {
        setErrorMsg(response.errorMessage || "Mã OTP chưa chính xác");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Mã xác minh không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-6"
      style={{
        background: "linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)",
        fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif"
      }}
    >
      {/* Background neon mesh accents */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "10%",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          right: "10%",
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div
        className="w-full bg-white relative overflow-hidden"
        style={{
          maxWidth: 480,
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(99,102,241,0.05), 0 1px 3px rgba(0,0,0,0.02)",
          border: "1px solid rgba(99,102,241,0.08)"
        }}
      >
        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <div
            className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
            }}
          >
            <Shield size={24} className="text-white" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 850, color: "#0F172A", letterSpacing: "-0.02em" }}>
            {step === 1 ? "Đăng ký tài khoản" : "Xác minh Email"}
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            {step === 1
              ? "Tham gia hệ thống mô phỏng an toàn thông tin"
              : `Mã xác nhận 6 số đã được gửi đến email: ${email}`}
          </p>
        </div>

        {/* Form area */}
        <div className="px-8 pb-8 pt-4">
          
          {/* Error and Success Display */}
          {errorMsg && (
            <div
              className="mb-5 rounded-2xl p-4 flex items-center gap-2.5"
              style={{
                background: "#FEF2F2",
                border: "1.5px solid rgba(239,68,68,0.15)",
                color: "#991B1B",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <Shield size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="mb-5 rounded-2xl p-4 flex items-center gap-2.5"
              style={{
                background: "#ECFDF5",
                border: "1.5px solid rgba(16,185,129,0.15)",
                color: "#065F46",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 outline-none transition-all"
                  style={{
                    borderRadius: 14,
                    border: "1.5px solid rgba(99,102,241,0.12)",
                    background: "#F8FAFF",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="Email công ty"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 outline-none transition-all"
                  style={{
                    borderRadius: 14,
                    border: "1.5px solid rgba(99,102,241,0.12)",
                    background: "#F8FAFF",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mật khẩu (ít nhất 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 outline-none transition-all"
                  style={{
                    borderRadius: 14,
                    border: "1.5px solid rgba(99,102,241,0.12)",
                    background: "#F8FAFF",
                    fontSize: "0.9rem"
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 outline-none transition-all"
                  style={{
                    borderRadius: 14,
                    border: "1.5px solid rgba(99,102,241,0.12)",
                    background: "#F8FAFF",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Đăng ký với vai trò</label>
                <div className="grid grid-cols-3 gap-2">
                  {rolesList.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value as Role)}
                      className="py-2.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all border"
                      style={{
                        background: selectedRole === r.value ? "#EEF2FF" : "#FFF",
                        borderColor: selectedRole === r.value ? "#6366F1" : "rgba(99,102,241,0.1)",
                        color: selectedRole === r.value ? "#4F46E5" : "#64748B",
                        fontWeight: selectedRole === r.value ? 700 : 500,
                        fontSize: "0.75rem"
                      }}
                    >
                      <span className="text-base mb-1">{r.emoji}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-3.5 mt-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.2)"
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  <><CheckCircle2 size={16} /> Đăng ký ngay <ArrowRight size={16} /></>
                )}
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* OTP Code */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Nhập 6 số mã OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 pr-4 py-3.5 outline-none transition-all text-center tracking-[0.4em] font-extrabold text-lg"
                  style={{
                    borderRadius: 14,
                    border: "1.5px solid rgba(99,102,241,0.12)",
                    background: "#F8FAFF",
                  }}
                  required
                />
              </div>

              {/* Submit Verification */}
              <button
                type="submit"
                disabled={otpCode.length !== 6 || loading}
                className="w-full py-3.5 mt-2 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.2)"
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang kiểm tra...</>
                ) : (
                  <><CheckCircle2 size={16} /> Xác nhận mã OTP</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-all font-semibold"
              >
                <ArrowLeft size={14} /> Quay lại trang đăng ký
              </button>

            </form>
          )}

          {/* Bottom Back Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={() => navigate("/dang-nhap")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors font-bold"
            >
              Đã có tài khoản? Đăng nhập ngay
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
