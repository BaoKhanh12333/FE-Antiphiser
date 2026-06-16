import { useState, useEffect } from "react";
import { Edit2, X, Check, Loader2, AlertTriangle, Plus, Trash2 } from "lucide-react";
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
  selectedFeatures: string[];
  customFeatures: string[];
  price: string;
  durationMonth: string;
  isActive: boolean;
  maxSlots: string;
}

const PREDEFINED_FEATURES = [
  "Chỉ dành cho 1 người dùng",
  "1-2 chiến dịch phishing/tháng",
  "2-3 chiến dịch phishing/tháng",
  "Chiến dịch phishing không giới hạn",
  "Cảnh báo rủi ro email thời gian thực",
  "Báo cáo điểm AI cá nhân hóa",
  "Báo cáo điểm AI chi tiết",
  "Dashboard theo dõi tiến độ",
  "Dashboard doanh nghiệp tùy chỉnh",
  "1 tài khoản Manager riêng",
  "Tối đa 10 nhân viên",
  "Tối đa 50 nhân viên",
  "Tối đa 100 nhân viên",
  "Không giới hạn nhân viên",
  "Cảnh báo rủi ro theo nhóm",
  "Xuất báo cáo PDF hàng tháng",
  "AI scoring & phản hồi cá nhân hóa",
  "Báo cáo rủi ro nâng cao theo bộ phận",
  "Xuất báo cáo tuân thủ (Compliance)",
  "Tích hợp SSO & Active Directory",
  "Hỗ trợ ưu tiên 24/7",
];

function parseFeatureString(feature: string | null): { selected: string[]; custom: string[] } {
  if (!feature) return { selected: [], custom: [] };
  const items = feature.split(",").map((s) => s.trim()).filter(Boolean);
  const selected = items.filter((f) => PREDEFINED_FEATURES.includes(f));
  const custom = items.filter((f) => !PREDEFINED_FEATURES.includes(f));
  return { selected, custom };
}

function buildFeatureString(selected: string[], custom: string[]): string {
  return [...selected, ...custom.map((s) => s.trim()).filter(Boolean)].join(", ");
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
  const { selected: initSelected, custom: initCustom } = parseFeatureString(plan.feature);
  const [form, setForm] = useState<EditForm>({
    name: plan.name,
    description: plan.description ?? "",
    selectedFeatures: initSelected,
    customFeatures: initCustom,
    price: plan.price?.toString() ?? "",
    durationMonth: plan.durationInMonths.toString(),
    isActive: plan.isActive,
    maxSlots: plan.maxSlots.toString(),
  });
  const [newCustom, setNewCustom] = useState("");
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
      const featureStr = buildFeatureString(form.selectedFeatures, form.customFeatures);
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

          {/* Lợi ích — checkbox list */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 6,
              }}
            >
              Lợi ích{" "}
              <span style={{ fontWeight: 400, color: "#94A3B8" }}>
                (tích để chọn)
              </span>
            </label>
            <div
              className="rounded-xl overflow-y-auto"
              style={{
                border: "1px solid #E2E8F0",
                maxHeight: 220,
                padding: "8px 4px",
              }}
            >
              {PREDEFINED_FEATURES.map((feat) => {
                const checked = form.selectedFeatures.includes(feat);
                return (
                  <label
                    key={feat}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          selectedFeatures: checked
                            ? f.selectedFeatures.filter((x) => x !== feat)
                            : [...f.selectedFeatures, feat],
                        }))
                      }
                      className="shrink-0 w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors"
                      style={{
                        background: checked ? "#6366F1" : "#fff",
                        border: checked ? "none" : "1.5px solid #CBD5E1",
                      }}
                    >
                      {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.83rem", color: checked ? "#3730A3" : "#475569" }}>
                      {feat}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Custom features */}
            {form.customFeatures.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {form.customFeatures.map((cf, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm text-slate-700"
                      style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
                    >
                      {cf}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          customFeatures: f.customFeatures.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom feature */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCustom}
                onChange={(e) => setNewCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCustom.trim()) {
                    e.preventDefault();
                    setForm((f) => ({ ...f, customFeatures: [...f.customFeatures, newCustom.trim()] }));
                    setNewCustom("");
                  }
                }}
                placeholder="Thêm lợi ích tuỳ chỉnh..."
                className="flex-1 px-3 py-1.5 rounded-lg outline-none text-slate-800"
                style={{ fontSize: "0.83rem", border: "1px solid #E2E8F0" }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCustom.trim()) return;
                  setForm((f) => ({ ...f, customFeatures: [...f.customFeatures, newCustom.trim()] }));
                  setNewCustom("");
                }}
                className="px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ background: "#EEF2FF", color: "#6366F1", border: "1px solid #C7D2FE" }}
              >
                <Plus size={13} />
                Thêm
              </button>
            </div>
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
