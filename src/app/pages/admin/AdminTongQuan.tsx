import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CreditCard, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function fmtVND(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function growthPct(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function statusBadge(status: string): { bg: string; color: string; label: string } {
  if (status === "Paid") return { bg: "#ECFDF5", color: "#059669", label: "Thành công" };
  if (status === "Pending") return { bg: "#FFFBEB", color: "#D97706", label: "Chờ TT" };
  return { bg: "#FEF2F2", color: "#DC2626", label: "Đã hủy" };
}

const PLAN_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B"];

// ─── types ───────────────────────────────────────────────────────────────────

interface MonthlyItem {
  month: string;
  value: number;
}

interface PlanItem {
  planName: string;
  count: number;
  revenue: number;
}

interface OrderItem {
  orderId: number;
  userEmail: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
}

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
  revenueByMonth: MonthlyItem[];
  userGrowthByMonth: MonthlyItem[];
  planBreakdown: PlanItem[];
  recentOrders: OrderItem[];
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  title,
  value,
  sub,
  subPositive,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  sub: string;
  subPositive?: boolean;
}) {
  const subColor =
    subPositive === true ? "#059669" : subPositive === false ? "#DC2626" : "#64748B";
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(99,102,241,0.1)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 4px 16px rgba(99,102,241,0.06)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "#EEF2FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Icon size={20} color="#6366F1" />
      </div>
      <p
        style={{
          fontSize: "0.72rem",
          color: "#94A3B8",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "1.85rem",
          fontWeight: 800,
          color: "#0F172A",
          letterSpacing: "-0.03em",
          marginBottom: 8,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: "0.8rem", color: subColor, fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function Card({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      <h3
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "#0F172A",
          marginBottom: 20,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  fontSize: 13,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminTongQuan() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService
      .getAdminOverview()
      .then(setData)
      .catch((e: Error) => setError(e?.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 320,
          color: "#94A3B8",
          fontSize: "0.95rem",
        }}
      >
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 320,
          color: "#DC2626",
          fontSize: "0.95rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) return null;

  const revGrowth = growthPct(data.revenueThisMonth, data.revenueLastMonth);
  const successRate =
    data.totalTransactions > 0
      ? Math.round((data.paidTransactions / data.totalTransactions) * 100)
      : 0;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }} className="space-y-6">
      {/* ── Header ── */}
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
        <p style={{ color: "#94A3B8", marginTop: 4, fontSize: "0.875rem" }}>
          Giám sát doanh thu, người dùng và hoạt động toàn hệ thống
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <KpiCard
          icon={CreditCard}
          title="Tổng doanh thu"
          value={fmtShort(data.totalRevenue) + " ₫"}
          sub={
            revGrowth !== null
              ? `${revGrowth >= 0 ? "+" : ""}${revGrowth}% so với tháng trước`
              : `Tháng này: ${fmtShort(data.revenueThisMonth)} ₫`
          }
          subPositive={revGrowth !== null ? revGrowth >= 0 : undefined}
        />
        <KpiCard
          icon={TrendingUp}
          title="Giao dịch thành công"
          value={data.paidTransactions.toString()}
          sub={`${successRate}% tỉ lệ thành công · ${data.pendingTransactions} chờ TT`}
        />
        <KpiCard
          icon={Users}
          title="Tổng người dùng"
          value={data.totalUsers.toString()}
          sub={`+${data.newUsersThisMonth} người dùng mới tháng này`}
          subPositive={data.newUsersThisMonth > 0}
        />
        <KpiCard
          icon={ShieldCheck}
          title="Gói đang hoạt động"
          value={data.activeSubscriptions.toString()}
          sub={`${data.totalCompanies} tổ chức đang đăng ký`}
        />
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Revenue Area Chart */}
        <Card title="Doanh thu theo tháng">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={data.revenueByMonth}
              margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtShort(v)}
                width={48}
              />
              <Tooltip
                formatter={(v: number) => [fmtVND(v), "Doanh thu"]}
                labelStyle={{ color: "#0F172A", fontWeight: 600 }}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ fill: "#6366F1", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* User Growth Bar Chart */}
        <Card title="Người dùng mới theo tháng">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={data.userGrowthByMonth}
              margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                formatter={(v: number) => [v, "Người dùng mới"]}
                labelStyle={{ color: "#0F172A", fontWeight: 600 }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="value" fill="#818CF8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Plan breakdown + Recent orders ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Plan Pie Chart */}
        <Card title="Phân bố gói dịch vụ">
          {data.planBreakdown.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", textAlign: "center", padding: "32px 0" }}>
              Chưa có dữ liệu
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.planBreakdown}
                    dataKey="count"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={52}
                    paddingAngle={3}
                  >
                    {data.planBreakdown.map((_entry, i) => (
                      <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, name) => [v + " gói", name]}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 12 }} className="space-y-2.5">
                {data.planBreakdown.map((p, i) => (
                  <div
                    key={p.planName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: PLAN_COLORS[i % PLAN_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                        {p.planName}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "#94A3B8",
                        }}
                      >
                        {fmtShort(p.revenue)} ₫
                      </span>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#0F172A",
                          minWidth: 24,
                          textAlign: "right",
                        }}
                      >
                        {p.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Recent Orders Table */}
        <Card title="Giao dịch gần đây">
          {data.recentOrders.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", textAlign: "center", padding: "32px 0" }}>
              Chưa có giao dịch nào
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Email", "Gói", "Số tiền", "Trạng thái", "Thời gian"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#94A3B8",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            padding: "0 10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #F1F5F9",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o, i) => {
                    const badge = statusBadge(o.status);
                    const isLast = i === data.recentOrders.length - 1;
                    return (
                      <tr
                        key={o.orderId}
                        style={{
                          borderBottom: isLast ? "none" : "1px solid #F8FAFC",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: "0.8rem",
                            color: "#94A3B8",
                          }}
                        >
                          #{o.orderId}
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: "0.82rem",
                            color: "#1E293B",
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {o.userEmail}
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              background: "#EEF2FF",
                              color: "#6366F1",
                              padding: "3px 9px",
                              borderRadius: 6,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {o.planName}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtShort(o.amount)} ₫
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span
                            style={{
                              fontSize: "0.73rem",
                              background: badge.bg,
                              color: badge.color,
                              padding: "3px 9px",
                              borderRadius: 6,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 10px",
                            fontSize: "0.78rem",
                            color: "#94A3B8",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(o.paidAt || o.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
