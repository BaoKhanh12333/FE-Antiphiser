import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RARITY_CONFIG, AchievementRarity } from "../data/achievements";
import { X } from "lucide-react";

interface ToastItem {
  id: string;
  icon: string;
  title: string;
  rarity: AchievementRarity;
}

interface SingleToastProps extends ToastItem {
  onDismiss: () => void;
}

function SingleToast({ icon, title, rarity, onDismiss }: SingleToastProps) {
  const cfg = RARITY_CONFIG[rarity];

  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 64, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 32, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      onClick={onDismiss}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px 14px 16px",
        background: "#fff",
        borderRadius: 16,
        border: `1.5px solid ${cfg.borderColor}`,
        boxShadow: `${cfg.glowShadow}, 0 2px 8px rgba(0,0,0,0.06)`,
        minWidth: 270,
        maxWidth: 330,
        cursor: "pointer",
        fontFamily: "'Be Vietnam Pro', sans-serif",
        position: "relative",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: cfg.bgGrad,
          border: `1px solid ${cfg.borderColor}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, color: cfg.textColor, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
          🎉 Thành tựu mới mở khoá!
        </p>
        <p style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </p>
        <span style={{
          display: "inline-block",
          fontSize: "0.6rem",
          fontWeight: 700,
          background: cfg.badgeBg,
          color: cfg.badgeText,
          padding: "1px 7px",
          borderRadius: 99,
          marginTop: 3,
        }}>
          {cfg.label}
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{ color: "#CBD5E1", flexShrink: 0, padding: 2, marginLeft: -4 }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function AchievementToastManager({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((t) => (
          <SingleToast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
