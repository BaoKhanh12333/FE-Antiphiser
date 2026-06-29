import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Users, Building2, CreditCard, TrendingUp, AlertTriangle,
  Shield, Loader2, Search, ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { analyticsService } from "../../services/analyticsService";
import axiosInstance from "../../api/axiosInstance";
import mascotPoint from "../../../data/mascot/point.png";
import mascotSurprised from "../../../data/mascot/surprised.png";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverviewData {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalTransactions: number;
  paidTransactions: number;
  pendingTransactions: number;
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalCompanies: number;
  revenueByMonth: { month: string; value: number }[];
  userGrowthByMonth: { month: string; value: number }[];
  planBreakdown: { planName: string; count: number; revenue: number }[];
}

// ─── AI insight generator ─────────────────────────────────────────────────────

function generateInsights(d: OverviewData): { level: "info" | "warn" | "good"; text: string }[] {
  const insights: { level: "info" | "warn" | "good"; text: string }[] = [];

  // Subscription penetration
  const subRate = d.totalUsers > 0 ? Math.round((d.activeSubscriptions / d.totalUsers) * 100) : 0;
  if (subRate < 20) {
    insights.push({ level: "warn", text: `Tỷ lệ chuyển đổi gói trả phí chỉ đạt ${subRate}% — hệ thống có nhiều người dùng miễn phí chưa được chuyển đổi. Cần xem xét chiến dịch upsell hoặc giới hạn tính năng miễn phí.` });
  } else if (subRate < 40) {
    insights.push({ level: "info", text: `Tỷ lệ chuyển đổi gói trả phí là ${subRate}% (${d.activeSubscriptions}/${d.totalUsers} người dùng). Còn ${d.totalUsers - d.activeSubscriptions} người dùng tiềm năng chưa đăng ký.` });
  } else {
    insights.push({ level: "good", text: `Tỷ lệ chuyển đổi gói trả phí đạt ${subRate}% — cao hơn mức trung bình ngành SaaS. Cần duy trì chất lượng dịch vụ để giữ chân người dùng hiện tại.` });
  }

  // Revenue growth
  if (d.revenueLastMonth > 0) {
    const growth = Math.round(((d.revenueThisMonth - d.revenueLastMonth) / d.revenueLastMonth) * 100);
    if (growth > 0) {
      insights.push({ level: "good", text: `Doanh thu tháng này tăng ${growth}% so với tháng trước (${fmtVND(d.revenueThisMonth)} vs ${fmtVND(d.revenueLastMonth)}). Xu hướng tăng trưởng tích cực.` });
    } else if (growth < -10) {
      insights.push({ level: "warn", text: `Doanh thu tháng này giảm ${Math.abs(growth)}% so với tháng trước. Cần phân tích nguyên nhân — có thể do giảm gia hạn hoặc tăng churn rate.` });
    } else {
      insights.push({ level: "info", text: `Doanh thu tháng này ${growth >= 0 ? "tăng nhẹ" : "giảm nhẹ"} ${Math.abs(growth)}% — ổn định so với tháng trước.` });
    }
  } else if (d.revenueThisMonth > 0) {
    insights.push({ level: "good", text: `Doanh thu tháng này đạt ${fmtVND(d.revenueThisMonth)} — đây là tháng đầu tiên có giao dịch thành công trong hệ thống.` });
  }

  // New users
  if (d.newUsersThisMonth === 0) {
    insights.push({ level: "warn", text: `Không có người dùng mới nào đăng ký trong tháng này. Kiểm tra lại chiến dịch acquisition hoặc landing page.` });
  } else {
    const avgPerDay = Math.round(d.newUsersThisMonth / 30);
    insights.push({ level: "info", text: `${d.newUsersThisMonth} người dùng mới tháng này (≈ ${avgPerDay}/ngày). Tổng hệ thống hiện có ${d.totalUsers.toLocaleString("vi-VN")} tài khoản trải qua ${d.totalCompanies} tổ chức.` });
  }

  // Pending payments
  if (d.pendingTransactions > d.paidTransactions * 0.3) {
    insights.push({ level: "warn", text: `${d.pendingTransactions} giao dịch đang chờ xử lý — chiếm tỷ lệ cao bất thường. Cần kiểm tra pipeline thanh toán VNPAY và xử lý webhook timeout.` });
  }

  // Plan concentration
  if (d.planBreakdown.length > 0) {
    const top = [...d.planBreakdown].sort((a, b) => b.count - a.count)[0];
    const topPct = d.activeSubscriptions > 0 ? Math.round((top.count / d.activeSubscriptions) * 100) : 0;
    if (topPct > 70) {
      insights.push({ level: "info", text: `Gói "${top.planName}" chiếm ${topPct}% tổng đăng ký — hệ thống đang phụ thuộc nhiều vào một gói duy nhất. Cân nhắc tạo thêm gói trung gian để đa dạng hóa doanh thu.` });
    }
  }

  return insights.slice(0, 5);
}

function fmtVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function revGrowth(current: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

const PLAN_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

// ─── KPI card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, iconBg, label, value, sub, subGood }: {
  icon: React.ElementType; iconBg: string; label: string;
  value: string; sub: string; subGood?: boolean;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 16px", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 4px 16px rgba(99,102,241,0.05)" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={18} color="#6366F1" />
      </div>
      <p style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 7 }}>{value}</p>
      <p style={{ fontSize: "0.78rem", color: subGood === true ? "#059669" : subGood === false ? "#DC2626" : "#64748B", fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminBaoCaoAI() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Org search (internal tool — kept for power users)
  const [companyId, setCompanyId] = useState("");
  const [orgReport, setOrgReport] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSearched, setOrgSearched] = useState(false);
  const [orgExpanded, setOrgExpanded] = useState(false);

  useEffect(() => {
    analyticsService
      .getAdminOverview()
      .then(setData)
      .catch((e: Error) => setError(e?.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  function handleOrgSearch() {
    const id = parseInt(companyId, 10);
    if (!id || id <= 0) { setOrgError("ID phải là số nguyên dương."); return; }
    setOrgLoading(true); setOrgError(null); setOrgReport(null); setOrgSearched(true);
    (axiosInstance as any)
      .get(`org-report?companyId=${id}`)
      .then((d: any) => setOrgReport(d))
      .catch(() => setOrgError("Không tìm thấy báo cáo hoặc công ty chưa có dữ liệu."))
      .finally(() => setOrgLoading(false));
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, gap: 12, color: "#94A3B8" }}>
        <Loader2 size={24} className="animate-spin" />
        <span>Đang tải dữ liệu hệ thống...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 12 }}>
        <img src={mascotSurprised} alt="mascot" style={{ width: 64, height: 64, objectFit: "contain" }} />
        <p style={{ color: "#DC2626", fontSize: "0.9rem" }}>{error || "Không thể tải dữ liệu."}</p>
      </div>
    );
  }

  const insights = generateInsights(data);
  const subRate = data.totalUsers > 0 ? Math.round((data.activeSubscriptions / data.totalUsers) * 100) : 0;
  const growth = revGrowth(data.revenueThisMonth, data.revenueLastMonth);

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
          Báo cáo AI Hệ thống
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: 4 }}>
          Phân tích tổng thể toàn bộ người dùng, tổ chức và doanh thu trong hệ thống AntiPhisher
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users} iconBg="#EEF2FF" label="Tổng người dùng"
          value={data.totalUsers.toLocaleString("vi-VN")}
          sub={`+${data.newUsersThisMonth} người dùng tháng này`}
          subGood={data.newUsersThisMonth > 0}
        />
        <KpiCard
          icon={Building2} iconBg="#F0FDF4" label="Tổ chức"
          value={data.totalCompanies.toLocaleString("vi-VN")}
          sub="Doanh nghiệp đang hoạt động"
        />
        <KpiCard
          icon={CreditCard} iconBg="#FFF7ED" label="Đăng ký hoạt động"
          value={data.activeSubscriptions.toLocaleString("vi-VN")}
          sub={`${subRate}% tỷ lệ chuyển đổi`}
          subGood={subRate >= 30}
        />
        <KpiCard
          icon={TrendingUp} iconBg="#FEF2F2" label="Doanh thu tháng này"
          value={fmtVND(data.revenueThisMonth)}
          sub={growth !== null ? `${growth >= 0 ? "+" : ""}${growth}% so với tháng trước` : "Tháng đầu tiên"}
          subGood={growth !== null ? growth >= 0 : undefined}
        />
      </div>

      {/* AI Insight Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(99,102,241,0.1)", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <img src={mascotPoint} alt="mascot" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A" }}>Nhận xét AI Hệ thống</p>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: 2 }}>
              Phân tích tự động từ {data.totalUsers} tài khoản, {data.totalCompanies} tổ chức và {data.totalTransactions} giao dịch
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => {
            const bgColor = ins.level === "warn" ? "#FEF2F2" : ins.level === "good" ? "#ECFDF5" : "#F0F4FF";
            const iconColor = ins.level === "warn" ? "#DC2626" : ins.level === "good" ? "#059669" : "#6366F1";
            const Icon = ins.level === "warn" ? AlertTriangle : ins.level === "good" ? Shield : ChevronRight;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: bgColor }}
              >
                <Icon size={16} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: "0.85rem", color: "#1E293B", lineHeight: 1.7 }}>{ins.text}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* User growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Users size={16} style={{ color: "#6366F1" }} />
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Tăng trưởng người dùng</p>
          </div>
          {data.userGrowthByMonth.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "0.82rem", textAlign: "center", padding: "24px 0" }}>Chưa có dữ liệu theo tháng</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.userGrowthByMonth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
                <Area type="monotone" dataKey="value" name="Người dùng mới" stroke="#6366F1" strokeWidth={2.5} fill="url(#userGrad)" dot={{ fill: "#6366F1", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <TrendingUp size={16} style={{ color: "#10B981" }} />
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Doanh thu theo tháng</p>
          </div>
          {data.revenueByMonth.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "0.82rem", textAlign: "center", padding: "24px 0" }}>Chưa có dữ liệu theo tháng</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.revenueByMonth}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(v: number) => [fmtVND(v), "Doanh thu"]}
                />
                <Area type="monotone" dataKey="value" name="Doanh thu" stroke="#10B981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#10B981", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Plan breakdown */}
      {data.planBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
        >
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", marginBottom: 18 }}>Phân bổ gói dịch vụ</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.planBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="planName" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
                <Bar dataKey="count" name="Số đăng ký" radius={[0, 6, 6, 0]}>
                  {data.planBreakdown.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.planBreakdown.map((p, i) => {
                const pct = data.activeSubscriptions > 0 ? Math.round((p.count / data.activeSubscriptions) * 100) : 0;
                return (
                  <div key={p.planName}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>{p.planName}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: PLAN_COLORS[i % PLAN_COLORS.length] }}>
                        {p.count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "#F1F5F9", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: PLAN_COLORS[i % PLAN_COLORS.length], transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)", overflow: "hidden" }}
      >
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Tổng quan giao dịch</p>
        </div>
        <div className="grid grid-cols-3" style={{ textAlign: "center" }}>
          {[
            { label: "Tổng giao dịch",    value: data.totalTransactions,   color: "#0F172A" },
            { label: "Thành công",         value: data.paidTransactions,    color: "#059669" },
            { label: "Đang chờ xử lý",    value: data.pendingTransactions, color: "#D97706" },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{ padding: "20px 16px", borderRight: i < 2 ? "1px solid #F1F5F9" : "none" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Org report tool (collapsed by default — flow bug acknowledged) */}
      <div style={{ borderRadius: 16, border: "1.5px dashed #E2E8F0", overflow: "hidden" }}>
        <button
          onClick={() => setOrgExpanded(v => !v)}
          style={{
            width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: orgExpanded ? "#F8FAFC" : "transparent", border: "none", cursor: "pointer",
            fontFamily: "'Be Vietnam Pro', sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={15} style={{ color: "#94A3B8" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>Tra cứu báo cáo theo tổ chức (công cụ nội bộ)</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 99 }}>Bug đã biết</span>
          </div>
          <ChevronRight size={15} style={{ color: "#94A3B8", transform: orgExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {orgExpanded && (
          <div style={{ padding: "0 20px 20px" }}>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.6, marginBottom: 14 }}>
              ⚠️ Flow này yêu cầu nhập ID công ty nội bộ (số nguyên). Đây là bug thiết kế vì doanh nghiệp đăng ký không có mã riêng — tra cứu ID tại trang <strong>Quản lý người dùng</strong> trước khi dùng tính năng này.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="number" min={1} value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleOrgSearch()}
                placeholder="Nhập company ID nội bộ (vd: 1, 2, 3...)"
                style={{ flex: 1, minWidth: 220, height: 40, border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "0 12px", fontSize: "0.85rem", outline: "none", fontFamily: "'Be Vietnam Pro', sans-serif" }}
              />
              <button
                onClick={handleOrgSearch} disabled={orgLoading}
                style={{ height: 40, padding: "0 18px", borderRadius: 10, background: orgLoading ? "#94A3B8" : "#6366F1", color: "#fff", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: orgLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                {orgLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {orgLoading ? "Đang tải..." : "Xem"}
              </button>
            </div>
            {orgError && <p style={{ marginTop: 8, fontSize: "0.78rem", color: "#DC2626" }}>{orgError}</p>}

            {!orgLoading && orgReport && (
              <div style={{ marginTop: 16, padding: 16, background: "#F8FAFC", borderRadius: 12 }}>
                <p style={{ fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{orgReport.companyName} — ID {orgReport.companyId}</p>
                <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.7 }}>{orgReport.executiveSummary}</p>
                {orgReport.topRisks?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>Rủi ro chính</p>
                    {orgReport.topRisks.slice(0, 3).map((r: string, i: number) => (
                      <p key={i} style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 3 }}>• {r}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!orgLoading && orgSearched && !orgReport && !orgError && (
              <p style={{ marginTop: 10, fontSize: "0.78rem", color: "#94A3B8" }}>Không có kết quả.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
