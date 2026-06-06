import { Cpu, Sparkles, Settings2, Activity, BarChart2, Wrench } from "lucide-react";

const PLANNED = [
  { icon: Sparkles,  label: "Tạo kịch bản phishing tự động theo xu hướng tấn công mới nhất" },
  { icon: Settings2, label: "Cấu hình độ khó, tần suất gửi, mức độ cá nhân hóa" },
  { icon: Activity,  label: "Theo dõi hiệu suất và độ chính xác của mô hình AI" },
  { icon: BarChart2, label: "Phân tích chỉ số lừa đảo và xu hướng hành vi người dùng" },
];

export function AdminAIController() {
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
          Bộ điều khiển AI
        </h1>
        <p className="text-slate-400 mt-1" style={{ fontSize: "0.875rem" }}>
          Cấu hình hành vi AI và tạo kịch bản tự động
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
            background: "linear-gradient(90deg, #8B5CF6, #6366F1, #06B6D4)",
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
              background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)",
              boxShadow: "0 8px 32px rgba(139,92,246,0.18)",
            }}
          >
            <Cpu size={36} className="text-violet-500" />
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
            Bộ điều khiển AI cần backend riêng (AI generation endpoints, config storage) chưa
            được xây dựng. Tính năng sẽ được bổ sung khi hạ tầng AI sẵn sàng.
          </p>

          {/* Planned features */}
          <div
            className="w-full rounded-2xl p-6 text-left"
            style={{
              background: "#FAFAFF",
              border: "1px solid rgba(139,92,246,0.08)",
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
                    style={{ background: "#F5F3FF" }}
                  >
                    <Icon size={14} className="text-violet-400" />
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
