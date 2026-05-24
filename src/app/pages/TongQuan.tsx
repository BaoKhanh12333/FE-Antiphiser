import { useState } from "react";
import {
  Mail, Bot, CheckCircle2, XCircle, MinusCircle, AlertTriangle,
  Flame, ArrowUpRight, Star, Paperclip, AlertCircle, Sparkles,
  ChevronRight, Clock, Link2, AtSign, FileWarning, Eye,
  PlayCircle, Lock, TrendingUp,
} from "lucide-react";
import { GaugeChart } from "../components/GaugeChart";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: "T2", score: 58 },
  { day: "T3", score: 62 },
  { day: "T4", score: 55 },
  { day: "T5", score: 70 },
  { day: "T6", score: 74 },
  { day: "T7", score: 80 },
  { day: "CN", score: 83 },
];

const recentActivity = [
  { id: 1, time: "10:23 hôm nay", subject: "Xác nhận đơn hàng Shopee #9281", sender: "order-confirm@sh0pee-vn.com", status: "reported", statusLabel: "Đã báo cáo" },
  { id: 2, time: "09:01 hôm nay", subject: "Tài khoản ngân hàng cần xác minh", sender: "security@vcb-online.net", status: "clicked", statusLabel: "Đã click" },
  { id: 3, time: "Hôm qua 16:45", subject: "Thư mời họp từ Ban giám đốc", sender: "ceo@company-vn.org", status: "ignored", statusLabel: "Đã bỏ qua" },
  { id: 4, time: "Hôm qua 14:12", subject: "Bạn vừa nhận được phần thưởng!", sender: "prize@vietlott-official.xyz", status: "reported", statusLabel: "Đã báo cáo" },
];

const statusConfig = {
  reported: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0", icon: CheckCircle2 },
  clicked:  { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", icon: XCircle },
  ignored:  { bg: "#EEF2FF", text: "#6366F1", border: "#C7D2FE", icon: MinusCircle },
};

const AI_WEAKNESSES = [
  {
    icon: Eye,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Urgency Tactics",
    desc: 'Bạn dễ bị kích động bởi tiêu đề "KHẨN", "24 giờ", "tài khoản bị khóa" — mất cảnh giác trước áp lực thời gian.',
    risk: "Cao",
    riskColor: "#EF4444",
  },
  {
    icon: AtSign,
    color: "#F59E0B",
    bg: "#FFFBEB",
    title: "Fake Domains",
    desc: 'Đã bỏ sót "paypa1.com" và "vcb-banking.net" — các ký tự thay thế tinh vi trong tên miền giả mạo.',
    risk: "Trung bình",
    riskColor: "#F59E0B",
  },
  {
    icon: Link2,
    color: "#EF4444",
    bg: "#FEF2F2",
    title: "Grammar Manipulation",
    desc: "Chưa chú ý đến các lỗi chính tả cố ý và cú pháp bất thường thường xuất hiện trong email lừa đảo.",
    risk: "Thấp",
    riskColor: "#10B981",
  },
  {
    icon: FileWarning,
    color: "#6366F1",
    bg: "#EEF2FF",
    title: "Malicious Attachments",
    desc: "Tệp .exe giả mạo hóa đơn PDF — chưa kiểm tra phần mở rộng thực của tệp đính kèm.",
    risk: "Trung bình",
    riskColor: "#F59E0B",
  },
];

// ─── Email Preview ─────────────────────────────────────────────────────────────

function EmailPreview() {
  const [revealed, setRevealed] = useState(false);
  const [scanning, setScanning] = useState(false);

  function handleAnalyze() {
    setScanning(true);
    setTimeout(() => { setScanning(false); setRevealed(true); }, 1500);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        border: "2px dashed rgba(245,158,11,0.35)",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 28px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md flex items-center gap-1"
        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <AlertTriangle size={10} className="text-amber-500" />
        <span className="text-amber-600" style={{ fontSize: "0.6rem", fontWeight: 700 }}>VÙNG CÁCH LY</span>
      </div>

      {scanning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(4px)" }}>
          <div className="text-center">
            <div className="relative mx-auto mb-3" style={{ width: 44, height: 44 }}>
              <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <Bot size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
            </div>
            <p className="text-indigo-600" style={{ fontWeight: 700, fontSize: "0.85rem" }}>AI đang phân tích...</p>
          </div>
          <div className="absolute left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #6366F1, transparent)", animation: "scanLine 1.5s ease-in-out infinite" }} />
          <style>{`@keyframes scanLine { 0%{top:0;opacity:1} 50%{opacity:0.5} 100%{top:100%;opacity:1} }`}</style>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background: "#FAFBFF", borderColor: "rgba(99,102,241,0.08)" }}>
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <Mail size={11} className="ml-1.5 text-indigo-400" />
        <span className="text-slate-400" style={{ fontSize: "0.7rem" }}>Mô phỏng #14</span>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(99,102,241,0.06)" }}>
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "#EF4444", fontWeight: 700, fontSize: "0.8rem" }}>VB</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-800" style={{ fontWeight: 700, fontSize: "0.88rem" }}>Vietcombank Hỗ trợ</span>
              <AlertCircle size={13} className="text-red-500 shrink-0" />
            </div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Từ:</span>
              <span className="px-1.5 py-0.5 rounded text-red-600" style={{ fontSize: "0.72rem", background: "#FEF2F2", fontWeight: 600 }}>security@vcb-banking.net</span>
              {revealed && <span className="text-red-600" style={{ fontSize: "0.68rem", fontWeight: 600 }}>⚠ Giả mạo!</span>}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Star size={14} className="text-slate-300" />
            <Paperclip size={14} className="text-red-400" />
          </div>
        </div>
        <p className="mt-2.5 text-slate-800" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          🚨 KHẨN: Tài khoản bị tạm khóa – Xác minh ngay!
        </p>
      </div>

      <div className="px-4 py-3 space-y-2.5" style={{ fontSize: "0.82rem", color: "#374151" }}>
        <p>Kính gửi <strong>Nguyễn Thị Lan</strong>,</p>
        <p>Phát hiện hoạt động <strong className="text-red-600">đáng ngờ</strong>. Vui lòng xác minh trong <strong className="text-red-600">24 giờ</strong>.</p>
        <div className="flex gap-2 pt-1 flex-wrap">
          <button className="px-4 py-2 rounded-lg text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>Xác minh ngay →</button>
          <button
            onClick={handleAnalyze}
            disabled={revealed || scanning}
            className="px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
          >
            <Sparkles size={13} /> Phân tích AI
          </button>
        </div>
        {revealed && (
          <div className="rounded-xl p-3 mt-1" style={{ background: "rgba(245,158,11,0.06)", border: "1.5px solid #FDE68A" }}>
            <p className="text-amber-800 font-bold mb-1.5" style={{ fontSize: "0.78rem" }}>🎯 AI phát hiện 4 dấu hiệu:</p>
            <ul className="space-y-1" style={{ fontSize: "0.75rem", color: "#92400E" }}>
              <li>🚩 Tên miền giả: <code className="px-1 rounded text-xs" style={{ background: "#FEF2F2" }}>vcb-banking.net</code></li>
              <li>🚩 Tạo tâm lý cấp bách: "KHẨN", "24 giờ"</li>
              <li>🚩 Nút không dẫn đến website chính thức</li>
              <li>🚩 Yêu cầu thông tin cá nhân qua email</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function TongQuan() {
  const [paywallHit] = useState(false); // set true to demo paywall state

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">

      {/* ── Row 1: Greeting + AI bubble ───────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.45rem", color: "#0F172A" }}>
            Chào mừng quay trở lại, Thị Lan! 👋
          </h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
            Thứ Năm, 05 tháng 3 năm 2026 · Gói:{" "}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", color: "#92400E", border: "1px solid #FCD34D" }}
            >
              ⚡ PRO / ENTERPRISE
            </span>
          </p>
          <div className="flex items-start gap-2 mt-3 max-w-sm">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF2FF" }}>
              <Bot size={14} className="text-indigo-500" />
            </div>
            <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm" style={{ background: "#EEF2FF", border: "1px solid rgba(99,102,241,0.1)" }}>
              <p className="text-indigo-700" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                Tuần này bạn cải thiện <strong>+25 điểm</strong>! Hoàn thành chiến dịch đang chạy để đạt mốc "Nhân viên xuất sắc" 🎯
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Active Campaign Card (tiêu điểm) ──────────── */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #E0F2FE 100%)",
          border: "1.5px solid rgba(99,102,241,0.2)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)" }}
        />

        <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
          {/* Left: info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(99,102,241,0.12)", color: "#4F46E5", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                ● ĐANG CHẠY
              </span>
              <span className="text-slate-400 text-xs">Độ khó: Trung bình</span>
            </div>

            <h2 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#0F172A" }}>
              Basic Banking Phishing Awareness
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Kiểm tra khả năng nhận biết email giả mạo tổ chức tài chính
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500" style={{ fontSize: "0.78rem" }}>Tiến độ</span>
                <span className="font-bold text-indigo-600" style={{ fontSize: "0.78rem" }}>4 / 10 Email</span>
              </div>
              <div className="h-2.5 rounded-full w-full" style={{ background: "rgba(99,102,241,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "40%",
                    background: "linear-gradient(90deg, #6366F1, #818CF8)",
                    boxShadow: "0 0 8px rgba(99,102,241,0.3)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            {paywallHit ? (
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed"
                style={{ background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                disabled
              >
                <Lock size={15} />
                Đạt giới hạn tháng này
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                }}
              >
                <PlayCircle size={18} />
                Vào Hộp Thư Mô Phỏng
              </button>
            )}
            {paywallHit && (
              <button className="text-xs text-indigo-600 font-semibold hover:underline">
                Nâng cấp ngay →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: 4 Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng email đã xử lý */}
        <div
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Email đã xử lý</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Mail size={17} className="text-indigo-500" />
            </div>
          </div>
          <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#0F172A" }}>47</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} className="text-emerald-500" />
            <span className="text-emerald-600" style={{ fontSize: "0.72rem", fontWeight: 600 }}>+12 tuần này</span>
          </div>
        </div>

        {/* Card 2: Phát hiện chính xác */}
        <div
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(16,185,129,0.12)",
            boxShadow: "0 2px 12px rgba(16,185,129,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Phát hiện chính xác</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5" }}>
              <CheckCircle2 size={17} className="text-emerald-500" />
            </div>
          </div>
          <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#0F172A" }}>41</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} className="text-emerald-500" />
            <span className="text-emerald-600" style={{ fontSize: "0.72rem", fontWeight: 600 }}>87% độ chính xác</span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ dính bẫy */}
        <div
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(245,158,11,0.15)",
            boxShadow: "0 2px 12px rgba(245,158,11,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Lần dính bẫy</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
              <AlertTriangle size={17} className="text-amber-500" />
            </div>
          </div>
          <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#F59E0B" }}>3</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>↓ Giảm 5 lần so với trước</span>
          </div>
        </div>

        {/* Card 4: Chuỗi ngày an toàn */}
        <div
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
            border: "1px solid rgba(249,115,22,0.2)",
            boxShadow: "0 2px 12px rgba(249,115,22,0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-orange-600" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Chuỗi ngày an toàn</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
              <Flame size={17} className="text-orange-500" />
            </div>
          </div>
          <div className="flex items-end gap-1">
            <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#EA580C" }}>7</p>
            <p className="text-orange-400 pb-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>ngày</p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Flame size={11} className="text-orange-400" />
            <span className="text-orange-500" style={{ fontSize: "0.72rem", fontWeight: 600 }}>Tiếp tục duy trì!</span>
          </div>
          {/* decorative flame */}
          <div className="absolute -bottom-3 -right-2 text-4xl opacity-10 select-none pointer-events-none">🔥</div>
        </div>
      </div>

      {/* ── Row 4: Gauge + AI Hub ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Personal Risk Score (2/5) */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col"
          style={{
            background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 60%, #3730A3 100%)",
            boxShadow: "0 8px 40px rgba(30,27,75,0.25)",
          }}
        >
          <p className="text-indigo-300 mb-1" style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em" }}>
            CHỈ SỐ TÍN NHIỆM BẢO MẬT
          </p>
          <p className="text-indigo-200 mb-4" style={{ fontSize: "0.78rem" }}>Personal Risk Score</p>

          {/* Gauge */}
          <div className="flex justify-center">
            <GaugeChart value={83} size={180} />
          </div>

          {/* Sub-metrics */}
          <div className="mt-5 space-y-3">
            {[
              { label: "Phát hiện Phishing", val: 90, from: "#10B981", to: "#6366F1" },
              { label: "Cảnh giác link lạ", val: 80, from: "#F59E0B", to: "#6366F1" },
              { label: "Thói quen mật khẩu", val: 75, from: "#6366F1", to: "#8B5CF6" },
            ].map(({ label, val, from, to }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-indigo-300" style={{ fontSize: "0.75rem" }}>{label}</span>
                  <span style={{ fontSize: "0.75rem", color: from, fontWeight: 700 }}>{val}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${val}%`,
                      background: `linear-gradient(90deg, ${from}, ${to})`,
                      boxShadow: `0 0 6px ${from}50`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AI Analytics Hub (3/5) */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 flex flex-col"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Bot size={20} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
                AI Analytics Hub
              </h3>
              <p className="text-slate-400" style={{ fontSize: "0.73rem" }}>Trợ lý bảo mật cá nhân — Phân tích từ OpenAI</p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
            >
              ● Live
            </div>
          </div>

          {/* AI Summary bubble */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#6366F1" }}>
                <Bot size={14} className="text-white" />
              </div>
              <div>
                <p className="text-indigo-800" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
                  Hệ thống phát hiện bạn có xu hướng dính bẫy bởi các email đánh vào tâm lý{" "}
                  <strong>khẩn cấp (Urgency Tactics)</strong> và{" "}
                  <strong>tên miền giả mạo (Fake Domains)</strong>. Bạn thường bỏ sót các lỗi{" "}
                  <strong>chính tả cố ý (Grammar Manipulation)</strong> từ kẻ lừa đảo.
                </p>
                <button
                  className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  Xem lại các email đã làm sai để sửa lỗi
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Weakness items */}
          <div className="space-y-2.5 flex-1">
            {AI_WEAKNESSES.map(({ icon: Icon, color, bg, title, desc, risk, riskColor }) => (
              <div
                key={title}
                className="flex items-start gap-2.5 p-3 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: "#FAFBFF",
                  border: "1px solid rgba(99,102,241,0.07)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-slate-700" style={{ fontWeight: 700, fontSize: "0.82rem" }}>{title}</span>
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ fontSize: "0.6rem", fontWeight: 700, color: riskColor, background: `${riskColor}12` }}
                    >
                      {risk}
                    </span>
                  </div>
                  <p className="text-slate-400" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>{desc}</p>
                </div>
                <ArrowUpRight size={13} className="text-slate-300 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Email Preview + Chart + Activity ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Email giả lập */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={15} className="text-amber-500" />
            <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>
              Email giả lập cách ly
            </h3>
          </div>
          <EmailPreview />
        </div>

        {/* Weekly score chart */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(99,102,241,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>Điểm số tuần này</h3>
              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Tiến độ hàng ngày</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
              <TrendingUp size={13} /> +25 pts
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={22} id="user-weekly-bar">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[40, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [`${v} điểm`, "Điểm số"]}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry) => (
                  <Cell key={`score-${entry.day}`} fill={entry.day === "CN" ? "#6366F1" : "#C7D2FE"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(99,102,241,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-indigo-500" />
            <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>
              Hoạt động gần đây
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const cfg = statusConfig[item.status as keyof typeof statusConfig];
              const StatusIcon = cfg.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: "rgba(99,102,241,0.06)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                    <StatusIcon size={13} style={{ color: cfg.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 truncate" style={{ fontWeight: 600, fontSize: "0.78rem" }}>{item.subject}</p>
                    <p className="text-slate-400 truncate" style={{ fontSize: "0.68rem" }}>{item.sender}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-1.5 py-0.5 rounded-full block" style={{ fontSize: "0.62rem", fontWeight: 700, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {item.statusLabel}
                    </span>
                    <p className="text-slate-300 mt-0.5" style={{ fontSize: "0.62rem" }}>{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
