import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Star,
  Zap,
  Brain,
  Cpu,
  Activity,
  RefreshCw,
  Check,
} from "lucide-react";

/* ── DATA ─────────────────────────────────────────── */
const aiInsightTags = [
  { label: "URL rút gọn", weight: 9, color: "#EF4444" },
  { label: "Tên miền giả", weight: 8, color: "#F59E0B" },
  { label: "Tạo sự cấp bách", weight: 10, color: "#EC4899" },
  { label: "Yêu cầu mật khẩu", weight: 7, color: "#6366F1" },
  { label: "File đính kèm .exe", weight: 6, color: "#8B5CF6" },
  { label: "Giả mạo CEO", weight: 8, color: "#EF4444" },
  { label: "Link Google Docs giả", weight: 5, color: "#3B82F6" },
  { label: "Thông báo trúng thưởng", weight: 4, color: "#10B981" },
  { label: "QR Code độc hại", weight: 7, color: "#F59E0B" },
  { label: "Deepfake email", weight: 6, color: "#EC4899" },
  { label: "Kỹ thuật Social Engineering", weight: 9, color: "#6366F1" },
  { label: "Phishing qua SMS", weight: 5, color: "#14B8A6" },
  { label: "Giả mạo ngân hàng", weight: 10, color: "#EF4444" },
  { label: "Email nội bộ giả", weight: 7, color: "#8B5CF6" },
  { label: "Tấn công chuỗi cung ứng", weight: 4, color: "#F59E0B" },
];

const aiMetrics = [
  { label: "Mô hình đang hoạt động", value: "GPT-Phish v3.2", icon: Cpu, color: "#6366F1" },
  { label: "Kịch bản đã tạo", value: "1,247", icon: Brain, color: "#10B981" },
  { label: "Độ chính xác", value: "96.8%", icon: Activity, color: "#F59E0B" },
  { label: "Lần cập nhật cuối", value: "2 giờ trước", icon: RefreshCw, color: "#8B5CF6" },
];

/* ── iOS-style Slider ─────────────────────────────── */
function GradientSlider({
  label,
  emoji,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  gradientFrom,
  gradientTo,
  minLabel,
  maxLabel,
}: {
  label: string;
  emoji: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  displayValue: string;
  gradientFrom: string;
  gradientTo: string;
  minLabel: string;
  maxLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/80" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
          {emoji} {label}
        </span>
        <span
          className="px-3 py-1 rounded-xl"
          style={{
            fontWeight: 700,
            fontSize: "0.88rem",
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {displayValue}
        </span>
      </div>

      {/* Custom slider track */}
      <div
        ref={trackRef}
        className="relative w-full cursor-pointer"
        style={{ height: 8, borderRadius: 20 }}
        onClick={(e) => {
          if (!trackRef.current) return;
          const rect = trackRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const newVal = Math.round((min + x * (max - min)) / (step || 1)) * (step || 1);
          onChange(newVal);
        }}
      >
        {/* Background track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 0 12px ${gradientFrom}40`,
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-150"
          style={{
            left: `calc(${pct}% - 10px)`,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 3px ${gradientFrom}40`,
          }}
        />
      </div>

      {/* Hidden native input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-1 opacity-0 absolute"
        style={{ height: 0 }}
      />

      <div className="flex justify-between mt-2">
        <span className="text-white/30" style={{ fontSize: "0.72rem" }}>{minLabel}</span>
        <span className="text-white/30" style={{ fontSize: "0.72rem" }}>{maxLabel}</span>
      </div>
    </div>
  );
}

/* ── ANIMATED TAGS ────────────────────────────────── */
function AIInsightTags() {
  return (
    <div className="flex flex-wrap gap-2">
      {aiInsightTags.map((tag, i) => {
        const size = 0.72 + (tag.weight / 10) * 0.28;
        return (
          <span
            key={tag.label}
            className="px-3 py-1.5 rounded-full cursor-default transition-all duration-300 hover:scale-105"
            style={{
              fontSize: `${size}rem`,
              fontWeight: tag.weight >= 8 ? 700 : 500,
              color: tag.color,
              background: `${tag.color}12`,
              border: `1px solid ${tag.color}25`,
              boxShadow: tag.weight >= 8 ? `0 0 12px ${tag.color}15` : "none",
              animation: `tagFloat ${3 + (i % 4) * 0.5}s ease-in-out ${i * 0.2}s infinite`,
            }}
          >
            {tag.label}
          </span>
        );
      })}
      <style>{`
        @keyframes tagFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────── */
export function AdminAIController() {
  const [difficulty, setDifficulty] = useState(3);
  const [frequency, setFrequency] = useState(4);
  const [personalization, setPersonalization] = useState(78);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 2500);
  }

  function handleSaveConfig() {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0F172A" }}>
          Bộ điều khiển AI
        </h1>
        <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.88rem" }}>
          Cấu hình hành vi AI và tạo kịch bản tự động
        </p>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aiMetrics.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.03)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}12` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{label}</p>
                <p className="text-slate-800" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Settings — Control panel */}
        <div
          className="lg:col-span-2 rounded-3xl p-6 space-y-5"
          style={{
            background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 60%, #3730A3 100%)",
            boxShadow: "0 8px 40px rgba(30,27,75,0.4)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Cpu size={20} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="text-white" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>
                Cài đặt AI
              </h3>
              <p className="text-indigo-400" style={{ fontSize: "0.75rem" }}>Điều chỉnh thông số hệ thống</p>
            </div>
          </div>

          <GradientSlider
            label="Độ khó kịch bản"
            emoji="⚡"
            value={difficulty}
            min={1}
            max={5}
            step={1}
            onChange={setDifficulty}
            displayValue={`${difficulty}/5`}
            gradientFrom="#6366F1"
            gradientTo="#06B6D4"
            minLabel="Dễ"
            maxLabel="Rất khó"
          />

          <GradientSlider
            label="Tần suất gửi tự động"
            emoji="📬"
            value={frequency}
            min={1}
            max={7}
            step={1}
            onChange={setFrequency}
            displayValue={`${frequency}/tuần`}
            gradientFrom="#F59E0B"
            gradientTo="#06B6D4"
            minLabel="1 lần/tuần"
            maxLabel="Hàng ngày"
          />

          <GradientSlider
            label="Tỷ lệ cá nhân hóa"
            emoji="🎯"
            value={personalization}
            min={0}
            max={100}
            step={5}
            onChange={setPersonalization}
            displayValue={`${personalization}%`}
            gradientFrom="#EC4899"
            gradientTo="#06B6D4"
            minLabel="Chung"
            maxLabel="Hoàn toàn riêng"
          />

          {/* Difficulty stars display */}
          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={`diff-star-${s}`}
                size={20}
                fill={s <= difficulty ? "#FBBF24" : "transparent"}
                className={s <= difficulty ? "text-yellow-400" : "text-white/15"}
                style={{
                  filter: s <= difficulty ? "drop-shadow(0 0 6px rgba(251,191,36,0.6))" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setDifficulty(s)}
              />
            ))}
          </div>

          <button
            onClick={handleSaveConfig}
            className="w-full py-3 rounded-2xl text-white transition-all hover:opacity-90"
            style={{
              background: configSaved
                ? "linear-gradient(135deg, #10B981, #34D399)"
                : "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {configSaved ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={16} /> Đã lưu cấu hình!
              </span>
            ) : (
              "Áp dụng cấu hình"
            )}
          </button>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Insights — Tags */}
          <div
            className="rounded-3xl p-6"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Brain size={18} className="text-indigo-500" />
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>
                  AI Insights
                </h3>
                <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                  Các hành vi & từ khóa AI đang tập trung phân tích
                </p>
              </div>
            </div>

            <AIInsightTags />

            <p className="text-slate-400 mt-4" style={{ fontSize: "0.75rem" }}>
              Kích thước thẻ phản ánh mức độ ưu tiên phân tích của AI. Thẻ lớn hơn = tần suất xuất hiện cao hơn trong các cuộc tấn công gần đây.
            </p>
          </div>

          {/* Generate AI Scenario — Neon button */}
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0F172A 0%, #1E1B4B 100%)",
              boxShadow: "0 8px 40px rgba(15,23,42,0.3)",
            }}
          >
            {/* Neon border effect */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                border: "1.5px solid transparent",
                backgroundImage: "linear-gradient(#0F172A, #1E1B4B), linear-gradient(135deg, #6366F1, #06B6D4, #EC4899, #6366F1)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            />

            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-30%",
                right: "-10%",
                width: 250,
                height: 250,
                background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: "-20%",
                left: "-5%",
                width: 200,
                height: 200,
                background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))",
                    border: "1px solid rgba(99,102,241,0.2)",
                    boxShadow: "0 0 24px rgba(99,102,241,0.15)",
                  }}
                >
                  <Sparkles size={28} className="text-indigo-400" />
                </div>
              </div>

              <h3
                className="text-white mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}
              >
                Tạo kịch bản bằng AI
              </h3>
              <p className="text-slate-400 mb-6" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
                AI sẽ phân tích xu hướng tấn công mới nhất và tạo kịch bản phishing phù hợp với cấu hình hiện tại của bạn.
              </p>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="relative px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03] active:scale-[0.98] disabled:hover:scale-100"
                style={{
                  background: generated
                    ? "linear-gradient(135deg, #10B981, #34D399)"
                    : "linear-gradient(135deg, #6366F1, #06B6D4)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: generated
                    ? "0 0 32px rgba(16,185,129,0.4), 0 0 64px rgba(16,185,129,0.15)"
                    : "0 0 32px rgba(99,102,241,0.3), 0 0 64px rgba(6,182,212,0.15)",
                }}
              >
                {/* Sparkle animation */}
                {!generating && !generated && (
                  <span
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                      backgroundSize: "200% 200%",
                      animation: "shimmer 3s infinite",
                    }}
                  />
                )}

                <span className="relative flex items-center gap-2">
                  {generating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Đang tạo kịch bản...
                    </>
                  ) : generated ? (
                    <>
                      <Check size={18} />
                      Đã tạo thành công!
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Tạo kịch bản mới
                    </>
                  )}
                </span>
              </button>

              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200% -200%; }
                  100% { background-position: 200% 200%; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
