import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  CheckCircle2, Circle, ChevronDown, X, ArrowRight,
  UserCheck, BookOpen, Target, BarChart3, Zap,
} from "lucide-react";

const DISMISS_KEY = "ap_checklist_dismissed";
const REPORT_VISITED_KEY = "ap_visited_baocao";

interface Props {
  completedLessons: number;
  processedEmails: number;
  hasPlan: boolean;
}

interface CheckItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  desc: string;
  done: boolean;
  action?: { label: string; to: string };
}

export function GettingStartedChecklist({ completedLessons, processedEmails, hasPlan }: Props) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISS_KEY));
  const [visitedReport, setVisitedReport] = useState(() => !!localStorage.getItem(REPORT_VISITED_KEY));
  const [allDoneShown, setAllDoneShown] = useState(false);

  const items: CheckItem[] = [
    {
      id: "register",
      icon: UserCheck,
      iconColor: "#10B981",
      iconBg: "rgba(16,185,129,0.1)",
      label: "Tạo tài khoản",
      desc: "Chào mừng bạn đến với AntiPhisher!",
      done: true,
    },
    {
      id: "lesson",
      icon: BookOpen,
      iconColor: "#6366F1",
      iconBg: "rgba(99,102,241,0.1)",
      label: "Xem bài học đầu tiên",
      desc: "Học Phase 1 để nắm nền tảng nhận diện phishing",
      done: completedLessons > 0,
      action: { label: "Học ngay", to: "/nguoi-dung/lo-trinh" },
    },
    {
      id: "simulation",
      icon: Target,
      iconColor: "#F59E0B",
      iconBg: "rgba(245,158,11,0.1)",
      label: "Thực hành mô phỏng",
      desc: "Xử lý ít nhất 1 email phishing mô phỏng",
      done: processedEmails > 0,
      action: { label: "Thực hành", to: "/nguoi-dung/mo-phong" },
    },
    {
      id: "report",
      icon: BarChart3,
      iconColor: "#8B5CF6",
      iconBg: "rgba(139,92,246,0.1)",
      label: "Xem báo cáo AI",
      desc: "Khám phá phân tích điểm mạnh & yếu của bạn",
      done: visitedReport,
      action: { label: "Xem báo cáo", to: "/nguoi-dung/bao-cao-ai" },
    },
    {
      id: "upgrade",
      icon: Zap,
      iconColor: "#EC4899",
      iconBg: "rgba(236,72,153,0.1)",
      label: "Nâng cấp tài khoản",
      desc: "Mở khoá đầy đủ bài học và tính năng nâng cao",
      done: hasPlan,
      action: { label: "Xem gói", to: "/nguoi-dung/mua-goi" },
    },
  ];

  const doneCount = items.filter(i => i.done).length;
  const total = items.length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  useEffect(() => {
    if (allDone && !allDoneShown) {
      setAllDoneShown(true);
      const t = setTimeout(() => {
        localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [allDone, allDoneShown]);

  if (dismissed) return null;

  function handleAction(item: CheckItem) {
    if (!item.action) return;
    if (item.id === "report") {
      localStorage.setItem(REPORT_VISITED_KEY, "1");
      setVisitedReport(true);
    }
    navigate(item.action.to);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: allDone
            ? "linear-gradient(135deg, #ECFDF5, #F0FDF4)"
            : "#fff",
          border: allDone ? "1.5px solid #A7F3D0" : "1.5px solid #E0E7FF",
          boxShadow: allDone
            ? "0 4px 20px rgba(16,185,129,0.12)"
            : "0 4px 20px rgba(99,102,241,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 cursor-pointer"
          onClick={() => setCollapsed(c => !c)}
          style={{ borderBottom: collapsed ? "none" : allDone ? "1px solid #D1FAE5" : "1px solid #EEF2FF" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {allDone ? (
                <CheckCircle2 size={18} style={{ color: "#10B981" }} />
              ) : (
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}
                >
                  {doneCount}
                </div>
              )}
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: allDone ? "#065F46" : "#1E293B",
                }}
              >
                {allDone ? "🎉 Hoàn tất! Bạn đã sẵn sàng!" : "Bắt đầu nào!"}
              </span>
            </div>

            {/* Progress bar */}
            {!allDone && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#6366F1,#8B5CF6)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600 }}>
                  {doneCount}/{total}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} style={{ color: "#94A3B8" }} />
            </motion.div>
            <button
              onClick={e => { e.stopPropagation(); handleDismiss(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors ml-1"
              title="Ẩn checklist"
            >
              <X size={12} style={{ color: "#94A3B8" }} />
            </button>
          </div>
        </div>

        {/* Items */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {allDone ? (
                <div className="px-5 py-5 text-center">
                  <p style={{ fontSize: "0.82rem", color: "#065F46", fontWeight: 600 }}>
                    Tuyệt vời! Bạn đã hoàn thành toàn bộ bước khởi động.
                    Checklist này sẽ tự đóng sau giây lát.
                  </p>
                </div>
              ) : (
                <div className="px-5 py-3 space-y-1">
                  {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 py-2.5 group"
                        style={{
                          borderBottom: idx < items.length - 1 ? "1px solid #F1F5F9" : "none",
                        }}
                      >
                        {/* Status icon */}
                        <div className="shrink-0">
                          {item.done ? (
                            <CheckCircle2 size={18} style={{ color: "#10B981" }} />
                          ) : (
                            <Circle size={18} style={{ color: "#CBD5E1" }} />
                          )}
                        </div>

                        {/* Icon badge */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: item.iconBg }}
                        >
                          <Icon size={15} style={{ color: item.iconColor }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: item.done ? 500 : 700,
                              color: item.done ? "#94A3B8" : "#1E293B",
                              textDecoration: item.done ? "line-through" : "none",
                            }}
                          >
                            {item.label}
                          </p>
                          {!item.done && (
                            <p style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 1 }}>
                              {item.desc}
                            </p>
                          )}
                        </div>

                        {/* CTA button */}
                        {!item.done && item.action && (
                          <button
                            onClick={() => handleAction(item)}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100 hover:scale-[1.03] active:scale-[0.97]"
                            style={{
                              background: `${item.iconColor}15`,
                              border: `1px solid ${item.iconColor}30`,
                              color: item.iconColor,
                            }}
                          >
                            {item.action.label} <ArrowRight size={11} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}

                  <div className="pt-2 pb-1">
                    <button
                      onClick={handleDismiss}
                      className="text-[11px] text-slate-400 hover:text-slate-500 transition-colors"
                    >
                      Ẩn danh sách này
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
