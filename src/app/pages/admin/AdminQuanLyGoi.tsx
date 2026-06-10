import { useState, useEffect } from "react";
import { Edit2, X, Check, Loader2, AlertTriangle } from "lucide-react";
import { subscriptionService } from "../../services/subscriptionService";

interface Plan {
  id: number;
  name: string;
  price: number | null;
  durationInMonths: number;
  description: string | null;
  feature: string | null;
  isActive: boolean;
  maxSlots: number;
  activeSubscribersCount: number;
}

interface EditForm {
  name: string;
  description: string;
  featureText: string;
  price: string;
  durationMonth: string;
  isActive: boolean;
  maxSlots: string;
}

function featureToText(feature: string | null): string {
  if (!feature) return "";
  return feature.split(", ").join("\n");
}

function textToFeature(text: string): string {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(", ");
}

/* ── Edit Modal ─────────────────────────────────────────────────────── */
function EditModal({
  plan,
  onClose,
  onRefresh,
}: {
  plan: Plan;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name: plan.name,
    description: plan.description ?? "",
    featureText: featureToText(plan.feature),
    price: plan.price?.toString() ?? "",
    durationMonth: plan.durationInMonths.toString(),
    isActive: plan.isActive,
    maxSlots: plan.maxSlots.toString(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate
    if (!form.name.trim()) {
      setError("Tên gói không được để trống.");
      return;
    }
    const price = parseFloat(form.price);
    const durationMonth = parseInt(form.durationMonth, 10);
    const maxSlots = parseInt(form.maxSlots, 10);
    if (isNaN(price) || price < 0) {
      setError("Giá không hợp lệ.");
      return;
    }
    if (isNaN(durationMonth) || durationMonth < 1) {
      setError("Thời hạn không hợp lệ.");
      return;
    }
    if (isNaN(maxSlots) || maxSlots < 1) {
      setError("Số slot không hợp lệ.");
      return;
    }

    // Cảnh báo hạ MaxSlots
    if (maxSlots < plan.maxSlots) {
      const confirmed = window.confirm(
        "Hạ giới hạn nhân viên có thể chặn các công ty đang dùng gói này mời thêm nhân viên nếu họ đã vượt mức mới. Nhân viên hiện có sẽ KHÔNG bị xóa. Tiếp tục?"
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setError(null);
    try {
      // Chỉ gửi field có giá trị — không gửi null
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        price,
        durationMonth,
        isActive: form.isActive,
        maxSlots,
      };
      if (form.description.trim()) body.description = form.description.trim();
      const featureStr = textToFeature(form.featureText);
      if (featureStr) body.feature = featureStr;

      await subscriptionService.updatePlan(plan.id, body);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.25)" }}
        onClick={onClose}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl"
        style={{
          width: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-5 pb-4 flex justify-between items-start"
          style={{ borderBottom: "1px solid #F1F5F9" }}
        >
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
              Chỉnh sửa gói
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 2 }}>
              {plan.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                fontSize: "0.85rem",
              }}
            >
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Tên gói */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 4,
              }}
            >
              Tên gói
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl outline-none text-slate-800"
              style={{
                fontSize: "0.9rem",
                border: "1px solid #E2E8F0",
              }}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 4,
              }}
            >
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 rounded-xl outline-none text-slate-800 resize-none"
              style={{ fontSize: "0.9rem", border: "1px solid #E2E8F0" }}
            />
          </div>

          {/* Lợi ích */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 4,
              }}
            >
              Lợi ích{" "}
              <span style={{ fontWeight: 400, color: "#94A3B8" }}>
                (mỗi mục 1 dòng)
              </span>
            </label>
            <textarea
              value={form.featureText}
              onChange={(e) =>
                setForm((f) => ({ ...f, featureText: e.target.value }))
              }
              rows={4}
              className="w-full px-3 py-2 rounded-xl outline-none text-slate-800 resize-none"
              style={{
                fontSize: "0.875rem",
                border: "1px solid #E2E8F0",
                fontFamily: "inherit",
              }}
              placeholder={"10 nhân viên\n50 kịch bản\nBáo cáo cơ bản"}
            />
            <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: 3 }}>
              Lưu tự động ghép lại bằng dấu phẩy. Dòng trống sẽ được bỏ qua.
            </p>
          </div>

          {/* Giá + Thời hạn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Giá (VND)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                min={0}
                className="w-full px-3 py-2 rounded-xl outline-none text-slate-800"
                style={{ fontSize: "0.9rem", border: "1px solid #E2E8F0" }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Thời hạn (tháng)
              </label>
              <input
                type="number"
                value={form.durationMonth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationMonth: e.target.value }))
                }
                min={1}
                className="w-full px-3 py-2 rounded-xl outline-none text-slate-800"
                style={{ fontSize: "0.9rem", border: "1px solid #E2E8F0" }}
              />
            </div>
          </div>

          {/* MaxSlots */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 4,
              }}
            >
              Số nhân viên tối đa{" "}
              <span style={{ fontWeight: 400, color: "#94A3B8" }}>(slot)</span>
            </label>
            <input
              type="number"
              value={form.maxSlots}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxSlots: e.target.value }))
              }
              min={1}
              className="w-full px-3 py-2 rounded-xl outline-none text-slate-800"
              style={{ fontSize: "0.9rem", border: "1px solid #E2E8F0" }}
            />
            {!isNaN(parseInt(form.maxSlots, 10)) &&
              parseInt(form.maxSlots, 10) < plan.maxSlots && (
                <p
                  className="flex items-center gap-1 mt-1.5"
                  style={{ fontSize: "0.75rem", color: "#D97706" }}
                >
                  <AlertTriangle size={11} />
                  Thấp hơn mức hiện tại ({plan.maxSlots}) — sẽ yêu cầu xác
                  nhận.
                </p>
              )}
          </div>

          {/* IsActive */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Trạng thái gói
              </p>
              <p style={{ fontSize: "0.77rem", color: "#94A3B8", marginTop: 1 }}>
                Tắt gói ngừng cho phép đăng ký mới
              </p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: form.isActive ? "#ECFDF5" : "#F8FAFC",
                color: form.isActive ? "#059669" : "#94A3B8",
                border: `1px solid ${
                  form.isActive ? "rgba(16,185,129,0.3)" : "#E2E8F0"
                }`,
              }}
            >
              {form.isActive ? "Đang mở" : "Đã khóa"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 pt-2 flex gap-3"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            style={{ fontSize: "0.9rem", fontWeight: 600 }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main ───────────────────────────────────────────────────────────── */
export function AdminQuanLyGoi() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await subscriptionService.getAllPlans();
      setPlans(data ?? []);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Không thể tải danh sách gói."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }} className="space-y-8">
      {editPlan && (
        <EditModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onRefresh={fetchPlans}
        />
      )}

      {/* Header */}
      <div>
        <h1
          style={{ fontWeight: 700, fontSize: "1.3rem", color: "#0F172A" }}
        >
          Quản lý gói dịch vụ
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginTop: 4 }}>
          {plans.length > 0
            ? `${plans.length} gói · Sửa giá, lợi ích và giới hạn nhân viên`
            : "Sửa giá, lợi ích và giới hạn nhân viên"}
        </p>
      </div>

      {/* Lỗi tải */}
      {fetchError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "0.88rem",
          }}
        >
          <AlertTriangle size={16} className="shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
        </div>
      )}

      {/* Cards */}
      {!loading && !fetchError && (
        <div className="grid gap-5 lg:grid-cols-3 sm:grid-cols-1">
          {plans.map((plan) => {
            const features = plan.feature
              ? plan.feature.split(", ").filter(Boolean)
              : [];
            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Tên + trạng thái */}
                <div className="flex items-start justify-between gap-2">
                  <h2
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#0F172A",
                    }}
                  >
                    {plan.name}
                  </h2>
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-lg"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: plan.isActive ? "#ECFDF5" : "#F8FAFC",
                      color: plan.isActive ? "#059669" : "#94A3B8",
                      border: `1px solid ${
                        plan.isActive
                          ? "rgba(16,185,129,0.25)"
                          : "#E2E8F0"
                      }`,
                    }}
                  >
                    {plan.isActive ? "Đang mở" : "Đã khóa"}
                  </span>
                </div>

                {/* Giá */}
                <div className="flex items-baseline gap-1">
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#0F172A",
                    }}
                  >
                    {plan.price != null
                      ? plan.price.toLocaleString("vi-VN")
                      : "—"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
                    đ / {plan.durationInMonths} tháng
                  </span>
                </div>

                {/* Meta */}
                <p style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  Tối đa{" "}
                  <strong style={{ color: "#334155" }}>{plan.maxSlots}</strong>{" "}
                  nhân viên
                  {plan.activeSubscribersCount > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <strong style={{ color: "#334155" }}>
                        {plan.activeSubscribersCount}
                      </strong>{" "}
                      công ty đang dùng
                    </>
                  )}
                </p>

                {/* Lợi ích */}
                {features.length > 0 && (
                  <ul className="space-y-1.5">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2"
                        style={{ fontSize: "0.85rem", color: "#475569" }}
                      >
                        <Check
                          size={13}
                          style={{
                            color: "#10B981",
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Nút sửa */}
                <button
                  onClick={() => setEditPlan(plan)}
                  className="mt-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  style={{ fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
              </div>
            );
          })}

          {plans.length === 0 && (
            <p
              className="col-span-3 text-center py-12"
              style={{ color: "#94A3B8", fontSize: "0.9rem" }}
            >
              Chưa có gói nào.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
