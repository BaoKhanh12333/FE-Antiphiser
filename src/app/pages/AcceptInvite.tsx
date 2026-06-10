import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2, Shield, ArrowRight, LogIn } from "lucide-react";
import { companyService } from "../services/companyService";

type Status = "loading" | "success" | "error";

export function AcceptInvite() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get("token") ?? "";

  const [status, setStatus]   = useState<Status>("loading");
  const [result, setResult]   = useState<any>(null);
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrMsg("Link không hợp lệ hoặc thiếu token."); return; }

    companyService.acceptInvitation(token)
      .then((data) => { setResult(data); setStatus("success"); })
      .catch((err: any) => { setErrMsg(err?.message || "Xác nhận thất bại."); setStatus("error"); });
  }, [token]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)", fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
          <Shield size={20} className="text-white" />
        </div>
        <span className="font-bold text-slate-800 text-lg">AntiPhisher</span>
      </div>

      <div
        className="w-full max-w-md rounded-2xl p-8 bg-white text-center"
        style={{ boxShadow: "0 8px 40px rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.1)" }}
      >
        {/* ── Loading ── */}
        {status === "loading" && (
          <div className="py-6">
            <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="font-semibold text-slate-700">Đang xác nhận lời mời...</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Xác nhận thành công!</h1>
            <p className="text-slate-500 text-sm mb-1">
              Bạn đã gia nhập <span className="font-bold text-indigo-600">{result?.companyName ?? "công ty"}</span>.
            </p>

            {result?.isNewUser && (
              <div className="mt-4 p-3 rounded-xl text-left"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <p className="text-xs font-bold text-emerald-700 mb-1">Tài khoản đã được kích hoạt</p>
                <p className="text-xs text-emerald-600">
                  Email: <b>{result?.email}</b><br />
                  Mật khẩu tạm thời đã được gửi trong email mời. Vui lòng đăng nhập và đổi mật khẩu ngay.
                </p>
              </div>
            )}

            <button
              onClick={() => navigate("/dang-nhap")}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              <LogIn size={15} /> Đăng nhập ngay <ArrowRight size={13} />
            </button>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Xác nhận thất bại</h1>
            <p className="text-sm text-slate-500 mb-6">{errMsg}</p>
            <button
              onClick={() => navigate("/dang-nhap")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
            >
              Quay lại trang đăng nhập
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6">© 2025 AntiPhisher · Nền tảng đào tạo an toàn thông tin</p>
    </div>
  );
}
