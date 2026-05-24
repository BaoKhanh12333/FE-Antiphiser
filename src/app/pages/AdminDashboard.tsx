import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell,
} from "recharts";
import { Sparkles, Plus, Star, Sliders, ShieldAlert, Users, Activity, Server } from "lucide-react";

const scenarios = [
  { id: 1, title: "Email giả mạo ngân hàng", tag: "Tài chính", difficulty: 3, uses: 142, icon: "🏦", color: "#EF4444", bg: "#FEF2F2" },
  { id: 2, title: "Thông báo thuế TNCN giả",  tag: "Chính phủ", difficulty: 4, uses: 98,  icon: "📋", color: "#F59E0B", bg: "#FFFBEB" },
  { id: 3, title: "Link reset mật khẩu giả",   tag: "Tài khoản", difficulty: 2, uses: 215, icon: "🔑", color: "#6366F1", bg: "#EEF2FF" },
  { id: 4, title: "Hóa đơn giả từ nhà cung cấp", tag: "Kế toán", difficulty: 5, uses: 67,  icon: "📄", color: "#10B981", bg: "#ECFDF5" },
  { id: 5, title: "Thông báo gói hàng giả",     tag: "Thương mại", difficulty: 1, uses: 320, icon: "📦", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: 6, title: "Email CEO giả mạo (BEC)",    tag: "Doanh nghiệp", difficulty: 5, uses: 44, icon: "👔", color: "#EC4899", bg: "#FDF2F8" },
];

const attackData = [
  { type: "Link giả mạo", click: 48, ignore: 30 },
  { type: "Domain giả",   click: 32, ignore: 52 },
  { type: "Cấp bách",     click: 61, ignore: 24 },
  { type: "File độc",     click: 28, ignore: 58 },
  { type: "BEC/CEO",      click: 55, ignore: 31 },
];

export function AdminDashboard() {
  const [aiIntelligence, setAiIntelligence] = useState(72);
  const [sendFrequency, setSendFrequency] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 800, fontSize: "1.5rem" }}>Dashboard Quản trị ⚙️</h1>
          <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.9rem" }}>Hệ thống AntiPhisher v2.4 · Trạng thái: <span className="text-emerald-600" style={{ fontWeight: 600 }}>Hoạt động bình thường</span></p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 relative overflow-hidden"
          style={{
            background: generating
              ? "linear-gradient(135deg, #10B981, #059669)"
              : "linear-gradient(135deg, #6366F1, #818CF8)",
            fontWeight: 700,
            fontSize: "0.875rem",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}
        >
          {generating ? (
            <><span className="animate-spin">⚙️</span> Đang tạo...</>
          ) : (
            <><Sparkles size={16} className="text-yellow-300" /> Tạo kịch bản mới bằng AI</>
          )}
        </button>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng người dùng", value: "1,247", icon: Users, color: "#6366F1", bg: "#EEF2FF" },
          { label: "Kịch bản hoạt động", value: "38", icon: ShieldAlert, color: "#EF4444", bg: "#FEF2F2" },
          { label: "Email giả lập/tuần", value: "4,820", icon: Activity, color: "#10B981", bg: "#ECFDF5" },
          { label: "Uptime hệ thống", value: "99.9%", icon: Server, color: "#F59E0B", bg: "#FFFBEB" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#fff", border: "1.5px solid rgba(99,102,241,0.1)" }}>
            <div className="flex items-center justify-between">
              <span className="text-slate-500" style={{ fontSize: "0.8rem" }}>{label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A" }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Controller */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <Sliders size={18} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="text-white" style={{ fontWeight: 700, fontSize: "1rem" }}>Bộ điều khiển AI</h3>
              <p className="text-indigo-400" style={{ fontSize: "0.72rem" }}>Cấu hình hành vi hệ thống</p>
            </div>
          </div>

          {/* Slider 1 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-indigo-200" style={{ fontSize: "0.82rem" }}>🧠 Độ thông minh AI</span>
              <span className="text-emerald-400" style={{ fontWeight: 700, fontSize: "0.85rem" }}>{aiIntelligence}%</span>
            </div>
            <input
              type="range" min={10} max={100} value={aiIntelligence}
              onChange={(e) => setAiIntelligence(Number(e.target.value))}
              className="w-full accent-indigo-400"
            />
            <div className="flex justify-between mt-1">
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>Cơ bản</span>
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>Chuyên gia</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-indigo-200" style={{ fontSize: "0.82rem" }}>📬 Tần suất email giả lập</span>
              <span className="text-amber-400" style={{ fontWeight: 700, fontSize: "0.85rem" }}>{sendFrequency}/tuần</span>
            </div>
            <input
              type="range" min={1} max={7} value={sendFrequency}
              onChange={(e) => setSendFrequency(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between mt-1">
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>1 lần/tuần</span>
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>Hàng ngày</span>
            </div>
          </div>

          {/* Slider 3 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-indigo-200" style={{ fontSize: "0.82rem" }}>⚡ Độ khó kịch bản</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill={s <= difficulty ? "#F59E0B" : "transparent"} className={s <= difficulty ? "text-amber-400" : "text-indigo-600"} />
                ))}
              </div>
            </div>
            <input
              type="range" min={1} max={5} value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between mt-1">
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>Dễ</span>
              <span className="text-indigo-500" style={{ fontSize: "0.65rem" }}>Rất khó</span>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl text-indigo-900 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #FCD34D, #F59E0B)", fontWeight: 700, fontSize: "0.875rem" }}>
            Áp dụng cấu hình
          </button>
        </div>

        {/* Stacked bar chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid rgba(99,102,241,0.1)" }}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={17} className="text-red-500" />
            <h3 className="text-slate-800" style={{ fontWeight: 700, fontSize: "1rem" }}>Phân tích loại tấn công</h3>
            <p className="text-slate-400 ml-1" style={{ fontSize: "0.75rem" }}>· Click nhầm vs. Bỏ qua</p>
          </div>
          <div style={{ width: "100%", minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attackData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Bar dataKey="click" name="Click nhầm" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ignore" name="Bỏ qua đúng" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#EF4444" }} />
              <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>Click nhầm (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#10B981" }} />
              <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>Bỏ qua đúng (%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario library */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800" style={{ fontWeight: 700, fontSize: "1rem" }}>📚 Thư viện kịch bản Phishing</h3>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition-all hover:opacity-90" style={{ background: "#6366F1", fontWeight: 600, fontSize: "0.78rem" }}>
            <Plus size={14} /> Thêm kịch bản
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => (
            <div key={sc.id} className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer" style={{ background: "#fff", border: "1.5px solid rgba(99,102,241,0.1)" }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: sc.bg }}>
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 truncate" style={{ fontWeight: 700, fontSize: "0.875rem" }}>{sc.title}</p>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem", fontWeight: 600, color: sc.color, background: sc.bg }}>
                    {sc.tag}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= sc.difficulty ? "#F59E0B" : "transparent"} className={s <= sc.difficulty ? "text-amber-400" : "text-slate-200"} />
                  ))}
                </div>
                <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>Đã dùng {sc.uses} lần</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg text-center transition-all hover:opacity-80" style={{ background: sc.bg, color: sc.color, fontWeight: 600, fontSize: "0.75rem" }}>
                  Triển khai
                </button>
                <button className="flex-1 py-1.5 rounded-lg text-center border transition-all hover:bg-indigo-50" style={{ borderColor: "#C7D2FE", color: "#6366F1", fontWeight: 600, fontSize: "0.75rem" }}>
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
