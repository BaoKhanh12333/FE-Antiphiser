import {
  BarChart2,
  Users,
  ShieldAlert,
  TrendingUp,
  Bell,
  Wrench,
} from "lucide-react";

const PLANNED = [
  { icon: BarChart2, label: "Biểu đồ xu hướng tấn công theo thời gian thực" },
  { icon: Users,    label: "Thống kê người dùng, công ty, gói đăng ký toàn hệ thống" },
  { icon: ShieldAlert, label: "Cảnh báo bảo mật và phát hiện bất thường" },
  { icon: TrendingUp,  label: "Điểm an toàn tổng hợp + KPI bảo mật" },
  { icon: Bell,     label: "Báo cáo nghi vấn mới từ các công ty" },
];

export function AdminTongQuan() {
  return (
    <div className="space-y-7 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div>
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}
        >
          Tổng quan hệ thống
        </h1>
        <p className="text-slate-400 mt-1" style={{ fontSize: "0.875rem" }}>
          Giám sát sức khỏe bảo mật toàn tổ chức theo thời gian thực
        </p>
      </div>

      {/* Under-development card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 8px 32px rgba(99,102,241,0.06)",
        }}
      >
        {/* Gradient top strip */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC)",
          }}
        />

        <div className="px-8 py-14 flex flex-col items-center text-center">
          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-6"
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#D97706",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
            }}
          >
            <Wrench size={11} />
            Đang phát triển
          </span>

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.15)",
            }}
          >
            <BarChart2 size={36} className="text-indigo-500" />
          </div>

          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "#0F172A",
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            Tính năng đang được xây dựng
          </h2>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#64748B",
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 40,
            }}
          >
            Màn hình Tổng quan Admin cần endpoint backend riêng (
            <code
              style={{
                fontSize: "0.82rem",
                color: "#6366F1",
                background: "#EEF2FF",
                padding: "1px 6px",
                borderRadius: 5,
              }}
            >
              /api/Analytics/admin-overview
            </code>
            ) để hiển thị dữ liệu thật. Tính năng sẽ được bổ sung trong giai đoạn tiếp theo.
          </p>

          {/* Planned features */}
          <div
            className="w-full rounded-2xl p-6 text-left"
            style={{
              background: "#F8FAFF",
              border: "1px solid rgba(99,102,241,0.08)",
              maxWidth: 560,
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Tính năng dự kiến
            </p>
            <ul className="space-y-3">
              {PLANNED.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "#EEF2FF" }}
                  >
                    <Icon size={14} className="text-indigo-400" />
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#475569" }}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
