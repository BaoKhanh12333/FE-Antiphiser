import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Shield, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { authService } from "../services/authService";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // No token in URL → invalid link
  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FAFAFF", fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        <div
          className="w-full mx-4 p-10 text-center bg-white rounded-3xl"
          style={{ maxWidth: 420, boxShadow: "0 8px 40px rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-5"
            style={{ borderRadius: 20, background: "#FEF2F2" }}
          >
            <Shield size={28} className="text-red-400" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0F172A", marginBottom: 8 }}>
            Link không hợp lệ
          </h2>
          <p style={{ fontSize: "0.87rem", color: "#64748B", marginBottom: 24 }}>
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <button
            onClick={() => navigate("/dang-nhap")}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)", boxShadow: "0 8px 24px rgba(99,102,241,0.2)" }}
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ token, newPassword, confirmPassword });
      if (res && res.isSuccess) {
        setDone(true);
        setTimeout(() => navigate("/dang-nhap"), 2000);
      } else {
        setError(res?.errorMessage || "Link không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FAFAFF", fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      <div
        className="w-full mx-4 bg-white rounded-3xl overflow-hidden"
        style={{ maxWidth: 420, boxShadow: "0 8px 40px rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.1)" }}
      >
        {/* Top gradient strip */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC)" }} />

        <div className="p-8 text-center">
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-5"
            style={{ borderRadius: 20, background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", boxShadow: "0 4px 16px rgba(99,102,241,0.12)" }}
          >
            <Lock size={28} className="text-indigo-600" />
          </div>

          <h2 style={{ fontWeight: 800, fontSize: "1.3rem", color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Đặt lại mật khẩu
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: 24 }}>
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {done ? (
            <div
              className="rounded-2xl p-5 flex flex-col items-center gap-3"
              style={{ background: "#F0FDF4", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <CheckCircle2 size={32} className="text-emerald-500" />
              <p style={{ fontWeight: 700, color: "#065F46", fontSize: "0.95rem" }}>
                Đặt lại thành công!
              </p>
              <p style={{ fontSize: "0.82rem", color: "#047857" }}>
                Đang chuyển về trang đăng nhập...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="rounded-xl p-3 mb-4 text-left"
                  style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <p style={{ fontSize: "0.82rem", color: "#991B1B", fontWeight: 600 }}>{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-5 text-left">
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full outline-none text-slate-700 text-sm"
                      style={{ border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 14px 12px 38px", background: "#FAFAFF" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="w-full outline-none text-slate-700 text-sm"
                      style={{ border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 14px 12px 38px", background: "#FAFAFF" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: loading ? "#A5B4FC" : "linear-gradient(135deg, #6366F1, #818CF8)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
