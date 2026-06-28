import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import axiosInstance from "../../api/axiosInstance";
import mascotIdle from "../../../data/mascot/idle.png";

interface LeaderboardEntry {
  userId: number;
  fullName: string;
  email: string;
  totalAttempts: number;
  correctRate: number;
  rank: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

const MEDAL = ["🥇", "🥈", "🥉"];

const TOP3_BG: Record<number, string> = {
  1: "rgba(251, 191, 36,  0.08)",
  2: "rgba(148, 163, 184, 0.10)",
  3: "rgba(180, 120,  60, 0.08)",
};

function rateColor(rate: number): string {
  if (rate >= 70) return "#10B981";
  if (rate >= 40) return "#F97316";
  return "#EF4444";
}

function RateBar({ rate }: { rate: number }) {
  const color = rateColor(rate);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-100 shrink-0">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(rate, 100)}%`, background: color }}
        />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: "0.85rem", minWidth: 44 }}>
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}

export function ManagerLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (axiosInstance as any)
      .get("Analytics/company-leaderboard")
      .then((data: LeaderboardResponse) => setEntries(data.entries ?? []))
      .catch((err: any) => console.error("Leaderboard load error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
        >
          <Trophy size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0F172A" }}>
            Bảng xếp hạng nhân viên
          </h1>
          <p className="text-slate-400" style={{ fontSize: "0.82rem" }}>
            Xếp hạng theo tỉ lệ phát hiện phishing
          </p>
        </div>
      </div>

      {/* Table card */}
      <div
        className="rounded-3xl overflow-hidden border border-white/80 shadow-sm"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)" }}
      >
        {entries.length === 0 ? (
          // ── Empty state ────────────────────────────────────
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.img
              src={mascotIdle}
              alt="mascot"
              className="w-24 h-24 object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            <p className="text-slate-400 text-base">Công ty chưa có nhân viên nào.</p>
          </div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #EEF2FF" }}>
                {["Hạng", "Tên nhân viên", "Email", "Số lần thử", "Tỉ lệ đúng"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left"
                    style={{ fontWeight: 600, fontSize: "0.78rem", color: "#94A3B8", letterSpacing: "0.04em" }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  style={{
                    background: TOP3_BG[entry.rank] ?? "transparent",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  {/* Hạng */}
                  <td className="px-6 py-4">
                    {entry.rank <= 3 ? (
                      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                        {MEDAL[entry.rank - 1]}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#CBD5E1",
                          minWidth: 24,
                          display: "inline-block",
                          textAlign: "center",
                        }}
                      >
                        {entry.rank}
                      </span>
                    )}
                  </td>

                  {/* Tên */}
                  <td className="px-6 py-4">
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A" }}>
                      {entry.fullName || "—"}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                      {entry.email}
                    </span>
                  </td>

                  {/* Số lần thử */}
                  <td className="px-6 py-4">
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: entry.totalAttempts === 0 ? "#CBD5E1" : "#0F172A",
                      }}
                    >
                      {entry.totalAttempts === 0 ? "—" : entry.totalAttempts}
                    </span>
                  </td>

                  {/* Tỉ lệ đúng */}
                  <td className="px-6 py-4">
                    {entry.totalAttempts === 0 ? (
                      <span style={{ fontSize: "0.82rem", color: "#CBD5E1" }}>Chưa thử</span>
                    ) : (
                      <RateBar rate={entry.correctRate} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
