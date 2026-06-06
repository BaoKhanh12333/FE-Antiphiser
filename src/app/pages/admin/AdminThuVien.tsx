import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Mail,
  AlertCircle,
} from "lucide-react";
import { scenarioService } from "../../services/scenarioService";

/* ── Types ─────────────────────────────────────────────── */
interface Scenario {
  scenarioId: number;
  categoryId: number;
  categoryName: string | null;
  difficultyId: number;
  difficultyName: string | null;
  title: string;
  description: string;
  isPhishing: boolean;
  isActive: boolean;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  subject: string;
  emailBodyHtml: string;
  phishingIndicators: string | null;
  explanationHint: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateForm {
  title: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  emailBodyHtml: string;
  isPhishing: boolean;
  phishingIndicators: string;
  explanationHint: string;
  categoryId: string;
  difficultyId: string;
}

interface UpdateForm {
  subject: string;
  senderEmail: string;
  emailBodyHtml: string;
  isPhishing: boolean;
  phishingIndicators: string;
  difficultyId: string;
}

interface CategoryOption { id: number; name: string }
interface DifficultyOption { id: number; name: string }

const EMPTY_CREATE: CreateForm = {
  title: "",
  description: "",
  subject: "",
  senderName: "",
  senderEmail: "",
  recipientName: "",
  emailBodyHtml: "",
  isPhishing: true,
  phishingIndicators: "",
  explanationHint: "",
  categoryId: "",
  difficultyId: "",
};

/* ── Helpers ──────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ── Shared UI primitives ─────────────────────────────── */
const inputCls =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 " +
  "outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition";

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-slate-100" />
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#CBD5E1",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      className="rounded-xl p-3 flex gap-2 items-start"
      style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.15)" }}
    >
      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
      <p style={{ fontSize: "0.8rem", color: "#991B1B", fontWeight: 600 }}>{msg}</p>
    </div>
  );
}

function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
    >
      {children}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  footer,
  children,
  maxWidth = 640,
}: {
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div
      className="w-full flex flex-col bg-white rounded-3xl overflow-hidden"
      style={{
        maxWidth,
        maxHeight: "92vh",
        boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid #F1F5F9" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)" }}
          >
            <Mail size={15} className="text-indigo-500" />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A" }}>{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1">{children}</div>

      {/* Sticky footer */}
      <div
        className="px-6 py-4 flex gap-3 shrink-0"
        style={{ borderTop: "1px solid #F1F5F9" }}
      >
        {footer}
      </div>
    </div>
  );
}

function ModalFooter({
  loading,
  onClose,
  onSubmit,
  submitLabel,
  submitDanger,
}: {
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDanger?: boolean;
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="flex-1 py-2.5 rounded-xl font-semibold transition"
        style={{
          fontSize: "0.875rem",
          color: "#64748B",
          border: "1px solid #E2E8F0",
          background: "white",
        }}
      >
        Hủy
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-1 py-2.5 rounded-xl font-bold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{
          fontSize: "0.875rem",
          background: submitDanger
            ? "linear-gradient(135deg,#EF4444,#F87171)"
            : "linear-gradient(135deg,#6366F1,#818CF8)",
          boxShadow: submitDanger
            ? "0 4px 12px rgba(239,68,68,0.3)"
            : "0 4px 12px rgba(99,102,241,0.3)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </>
  );
}

/* ── CreateModal ──────────────────────────────────────── */
function CreateModal({
  categories,
  difficulties,
  onClose,
  onSuccess,
}: {
  categories: CategoryOption[];
  difficulties: DifficultyOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CreateForm>(EMPTY_CREATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof CreateForm, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit() {
    const required = [
      form.title,
      form.description,
      form.subject,
      form.senderName,
      form.senderEmail,
      form.recipientName,
      form.emailBodyHtml,
      form.explanationHint,
      form.categoryId,
      form.difficultyId,
    ];
    if (required.some((v) => !v)) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await scenarioService.createScenario({
        title: form.title,
        description: form.description,
        subject: form.subject,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        recipientName: form.recipientName,
        emailBodyHtml: form.emailBodyHtml,
        isPhishing: form.isPhishing,
        phishingIndicators: form.phishingIndicators || null,
        explanationHint: form.explanationHint,
        categoryId: Number(form.categoryId),
        difficultyId: Number(form.difficultyId),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không thể tạo kịch bản. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay>
      <ModalShell
        title="Thêm kịch bản mới"
        onClose={onClose}
        footer={
          <ModalFooter
            loading={loading}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel="Tạo kịch bản"
          />
        }
      >
        <div className="flex flex-col gap-4 p-6">
          {error && <ErrorBanner msg={error} />}

          <SectionDivider label="Thông tin cơ bản" />

          <FormField label="Tiêu đề kịch bản" required>
            <input
              className={inputCls}
              placeholder="Email giả mạo ngân hàng Vietcombank..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </FormField>

          <FormField label="Mô tả ngắn" required>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Mô tả ngắn về kịch bản, mục tiêu lừa đảo..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Danh mục" required>
              <select
                className={inputCls}
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">— Chọn danh mục —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Độ khó" required>
              <select
                className={inputCls}
                value={form.difficultyId}
                onChange={(e) => set("difficultyId", e.target.value)}
              >
                <option value="">— Chọn độ khó —</option>
                {difficulties.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Loại kịch bản" required>
            <div className="flex gap-4">
              {[
                { val: true, label: "Phishing (lừa đảo)", color: "#EF4444" },
                { val: false, label: "An toàn", color: "#10B981" },
              ].map(({ val, label, color }) => (
                <label
                  key={String(val)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="create_isPhishing"
                    checked={form.isPhishing === val}
                    onChange={() => set("isPhishing", val)}
                    style={{ accentColor: color }}
                  />
                  <span style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 500 }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          <SectionDivider label="Thông tin email" />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tên người gửi" required>
              <input
                className={inputCls}
                placeholder="Ngân hàng Vietcombank"
                value={form.senderName}
                onChange={(e) => set("senderName", e.target.value)}
              />
            </FormField>
            <FormField label="Email người gửi" required>
              <input
                className={inputCls}
                type="email"
                placeholder="support@vcb-secure.com"
                value={form.senderEmail}
                onChange={(e) => set("senderEmail", e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tên người nhận" required>
              <input
                className={inputCls}
                placeholder="Học viên"
                value={form.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
              />
            </FormField>
            <FormField label="Tiêu đề email (Subject)" required>
              <input
                className={inputCls}
                placeholder="[KHẨN] Tài khoản bị tạm khóa"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </FormField>
          </div>

          <SectionDivider label="Nội dung HTML" />

          <FormField label="Email body (HTML)" required>
            <textarea
              className={inputCls}
              style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: "0.78rem" }}
              rows={7}
              placeholder={"<p>Kính gửi {{recipientName}},</p>\n<p>Tài khoản của bạn đã bị tạm khóa...</p>"}
              value={form.emailBodyHtml}
              onChange={(e) => set("emailBodyHtml", e.target.value)}
            />
          </FormField>

          <SectionDivider label="Hỗ trợ học tập" />

          <FormField label="Lời giải thích sau khi làm bài" required>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Email này là phishing vì... Dấu hiệu nhận biết: domain giả, ngôn ngữ khẩn cấp..."
              value={form.explanationHint}
              onChange={(e) => set("explanationHint", e.target.value)}
            />
          </FormField>

          <FormField label="Chỉ số lừa đảo (JSON, tuỳ chọn)">
            <input
              className={inputCls}
              placeholder='["domain_spoof","urgency_pressure","credential_request"]'
              value={form.phishingIndicators}
              onChange={(e) => set("phishingIndicators", e.target.value)}
            />
          </FormField>
        </div>
      </ModalShell>
    </ModalOverlay>
  );
}

/* ── EditModal ────────────────────────────────────────── */
function EditModal({
  scenario,
  difficulties,
  onClose,
  onSuccess,
}: {
  scenario: Scenario;
  difficulties: DifficultyOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<UpdateForm>({
    subject: scenario.subject,
    senderEmail: scenario.senderEmail,
    emailBodyHtml: scenario.emailBodyHtml,
    isPhishing: scenario.isPhishing,
    phishingIndicators: scenario.phishingIndicators ?? "",
    difficultyId: String(scenario.difficultyId),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof UpdateForm, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit() {
    if (!form.subject || !form.senderEmail || !form.emailBodyHtml || !form.difficultyId) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await scenarioService.updateScenario(scenario.scenarioId, {
        subject: form.subject,
        senderEmail: form.senderEmail,
        emailBodyHtml: form.emailBodyHtml,
        isPhishing: form.isPhishing,
        phishingIndicators: form.phishingIndicators || null,
        difficultyId: Number(form.difficultyId),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không thể cập nhật kịch bản. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay>
      <ModalShell
        title={`Chỉnh sửa kịch bản`}
        onClose={onClose}
        footer={
          <ModalFooter
            loading={loading}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel="Lưu thay đổi"
          />
        }
      >
        <div className="flex flex-col gap-4 p-6">
          {/* Context chip */}
          <div
            className="rounded-2xl p-3.5 flex gap-3 items-start"
            style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.12)" }}
          >
            <Mail size={15} className="text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p
                style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1E293B", marginBottom: 2 }}
              >
                {scenario.title}
              </p>
              <p style={{ fontSize: "0.78rem", color: "#64748B" }}>
                Danh mục: {scenario.categoryName ?? `#${scenario.categoryId}`} ·{" "}
                <span className="italic text-amber-600">
                  Title &amp; Description chỉ sửa được từ database (giới hạn API hiện tại)
                </span>
              </p>
            </div>
          </div>

          {error && <ErrorBanner msg={error} />}

          <SectionDivider label="Thông tin email" />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email người gửi" required>
              <input
                className={inputCls}
                type="email"
                value={form.senderEmail}
                onChange={(e) => set("senderEmail", e.target.value)}
              />
            </FormField>
            <FormField label="Tiêu đề email (Subject)" required>
              <input
                className={inputCls}
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Độ khó" required>
              <select
                className={inputCls}
                value={form.difficultyId}
                onChange={(e) => set("difficultyId", e.target.value)}
              >
                <option value="">— Chọn độ khó —</option>
                {difficulties.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Loại kịch bản" required>
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { val: true, label: "Phishing", color: "#EF4444" },
                  { val: false, label: "An toàn", color: "#10B981" },
                ].map(({ val, label, color }) => (
                  <label
                    key={String(val)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="edit_isPhishing"
                      checked={form.isPhishing === val}
                      onChange={() => set("isPhishing", val)}
                      style={{ accentColor: color }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>{label}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>

          <SectionDivider label="Nội dung HTML" />

          <FormField label="Email body (HTML)" required>
            <textarea
              className={inputCls}
              style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: "0.78rem" }}
              rows={7}
              value={form.emailBodyHtml}
              onChange={(e) => set("emailBodyHtml", e.target.value)}
            />
          </FormField>

          <SectionDivider label="Chỉ số lừa đảo" />

          <FormField label="Phishing Indicators (JSON, tuỳ chọn)">
            <input
              className={inputCls}
              placeholder='["domain_spoof","urgency_pressure"]'
              value={form.phishingIndicators}
              onChange={(e) => set("phishingIndicators", e.target.value)}
            />
          </FormField>
        </div>
      </ModalShell>
    </ModalOverlay>
  );
}

/* ── DeleteModal ──────────────────────────────────────── */
function DeleteModal({
  scenario,
  onClose,
  onSuccess,
}: {
  scenario: Scenario;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    try {
      await scenarioService.deleteScenario(scenario.scenarioId);
      onSuccess();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không thể xóa kịch bản. Vui lòng thử lại."
      );
      setLoading(false);
    }
  }

  return (
    <ModalOverlay>
      <div
        className="w-full bg-white rounded-3xl overflow-hidden"
        style={{
          maxWidth: 400,
          boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-7 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#FEF2F2" }}
          >
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h3
            style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0F172A", marginBottom: 8 }}
          >
            Xóa kịch bản?
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: 6 }}>
            Bạn sắp xóa vĩnh viễn:
          </p>
          <p
            className="rounded-xl px-4 py-2 mb-4 mx-2"
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#1E293B",
              background: "#F8FAFF",
              border: "1px solid #E2E8F0",
            }}
          >
            {scenario.title}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94A3B8", marginBottom: 20 }}>
            Hành động này không thể hoàn tác.
          </p>

          {error && (
            <div className="mb-4">
              <ErrorBanner msg={error} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold transition hover:bg-slate-50"
              style={{ fontSize: "0.875rem", color: "#64748B", border: "1px solid #E2E8F0" }}
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#EF4444,#F87171)",
                boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
              }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><Trash2 size={14} /> Xóa</>}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── ScenarioCard ─────────────────────────────────────── */
function ScenarioCard({
  scenario,
  onEdit,
  onDelete,
}: {
  scenario: Scenario;
  onEdit: (s: Scenario) => void;
  onDelete: (s: Scenario) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isP = scenario.isPhishing;

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-300"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: hovered
          ? "0 16px 48px rgba(99,102,241,0.14), 0 4px 16px rgba(0,0,0,0.05)"
          : "0 1px 4px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent gradient bar */}
      <div
        style={{
          height: 4,
          background: isP
            ? "linear-gradient(90deg,#EF4444,#F87171,#FCA5A5)"
            : "linear-gradient(90deg,#10B981,#34D399,#6EE7B7)",
        }}
      />

      {/* Visual header */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: 100,
          background: isP
            ? "linear-gradient(135deg,rgba(239,68,68,0.05),rgba(248,113,113,0.08))"
            : "linear-gradient(135deg,rgba(16,185,129,0.05),rgba(52,211,153,0.08))",
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `1px solid ${isP ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)"}`,
          }}
        />
        <div
          className="absolute"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `1px solid ${isP ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)"}`,
          }}
        />

        {/* Icon */}
        <div
          className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: isP ? "#FEF2F2" : "#ECFDF5",
            boxShadow: `0 4px 16px ${isP ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)"}`,
          }}
        >
          {isP ? (
            <ShieldAlert size={22} className="text-red-500" />
          ) : (
            <ShieldCheck size={22} className="text-emerald-500" />
          )}
        </div>

        {/* Hover action overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 px-3 transition-all duration-200"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <button
            onClick={() => onEdit(scenario)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-white transition hover:scale-105"
            style={{
              fontSize: "0.78rem",
              background: "rgba(99,102,241,0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Pencil size={12} /> Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(scenario)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-white transition hover:scale-105"
            style={{
              fontSize: "0.78rem",
              background: "rgba(239,68,68,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Trash2 size={12} /> Xóa
          </button>
          <button
            disabled
            title="Tính năng đang phát triển"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold"
            style={{
              fontSize: "0.78rem",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              cursor: "not-allowed",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Zap size={12} /> Dùng ngay
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-lg"
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: isP ? "#DC2626" : "#059669",
              background: isP ? "#FEF2F2" : "#ECFDF5",
            }}
          >
            {isP ? "Phishing" : "An toàn"}
          </span>
          {scenario.categoryName && (
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6366F1", background: "#EEF2FF" }}
            >
              {scenario.categoryName}
            </span>
          )}
          {scenario.difficultyName && (
            <span
              className="px-2.5 py-1 rounded-lg"
              style={{ fontSize: "0.72rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9" }}
            >
              {scenario.difficultyName}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-slate-800 mb-1.5 leading-snug"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontWeight: 700,
            fontSize: "0.97rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {scenario.title}
        </h3>

        {/* Description */}
        <p
          className="text-slate-400 mb-3"
          style={{
            fontSize: "0.82rem",
            lineHeight: 1.7,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {scenario.description}
        </p>

        {/* Subject preview */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 mb-4"
          style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.08)" }}
        >
          <Mail size={12} className="text-indigo-300 shrink-0" />
          <p
            className="text-slate-500 truncate"
            style={{ fontSize: "0.75rem", fontStyle: "italic" }}
          >
            {scenario.subject}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <span
            className="px-2 py-0.5 rounded-md"
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: scenario.isActive ? "#059669" : "#94A3B8",
              background: scenario.isActive ? "#ECFDF5" : "#F8FAFC",
            }}
          >
            {scenario.isActive ? "● Hoạt động" : "○ Ẩn"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
            {formatDate(scenario.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export function AdminThuVien() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Scenario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);

  async function loadScenarios() {
    setLoading(true);
    setError(null);
    try {
      const data = await scenarioService.getAllScenarios();
      setScenarios((data as Scenario[]) ?? []);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không thể tải danh sách kịch bản."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScenarios();
  }, []);

  const categories = useMemo<CategoryOption[]>(() => {
    const seen = new Set<number>();
    const list: CategoryOption[] = [];
    for (const s of scenarios) {
      if (s.categoryId && !seen.has(s.categoryId) && s.categoryName) {
        seen.add(s.categoryId);
        list.push({ id: s.categoryId, name: s.categoryName });
      }
    }
    return list.sort((a, b) => a.id - b.id);
  }, [scenarios]);

  const difficulties = useMemo<DifficultyOption[]>(() => {
    const seen = new Set<number>();
    const list: DifficultyOption[] = [];
    for (const s of scenarios) {
      if (s.difficultyId && !seen.has(s.difficultyId) && s.difficultyName) {
        seen.add(s.difficultyId);
        list.push({ id: s.difficultyId, name: s.difficultyName });
      }
    }
    return list.sort((a, b) => a.id - b.id);
  }, [scenarios]);

  const filtered = useMemo(() => {
    return scenarios.filter((s) => {
      const matchCat =
        activeCategory === "Tất cả" || s.categoryName === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [scenarios, activeCategory, search]);

  function handleActionSuccess() {
    setShowCreate(false);
    setEditTarget(null);
    setDeleteTarget(null);
    loadScenarios();
  }

  return (
    <div className="space-y-7 max-w-screen-xl mx-auto">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Thư viện kịch bản Phishing
          </h1>
          <p className="text-slate-400 mt-1" style={{ fontSize: "0.875rem" }}>
            {loading
              ? "Đang tải..."
              : `${scenarios.length} kịch bản · Quản lý và triển khai email giả lập`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadScenarios}
            disabled={loading}
            title="Làm mới"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
            style={{ border: "1px solid #E2E8F0", background: "white" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontSize: "0.875rem",
              background: "linear-gradient(135deg,#6366F1,#818CF8)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            <Plus size={16} /> Thêm kịch bản
          </button>
        </div>
      </div>

      {/* ── Search + filters ─────────────────────────── */}
      {!loading && !error && scenarios.length > 0 && (
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-2 flex-1 w-full sm:w-auto px-4 py-2.5 rounded-xl"
            style={{ background: "#F8FAFF", border: "1px solid rgba(99,102,241,0.1)" }}
          >
            <Search size={15} className="text-indigo-400 shrink-0" />
            <input
              className="bg-transparent outline-none flex-1 text-slate-700 placeholder:text-slate-400"
              placeholder="Tìm theo tiêu đề, mô tả, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Tất cả", ...categories.map((c) => c.name)].map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : "#64748B",
                    background: active ? "#6366F1" : "rgba(99,102,241,0.06)",
                    border: active ? "none" : "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-300" />
          <p style={{ fontSize: "0.875rem", color: "#94A3B8" }}>Đang tải kịch bản...</p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────── */}
      {!loading && error && (
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#FEE2E2" }}
          >
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#991B1B" }}>
              Không thể tải dữ liệu
            </p>
            <p style={{ fontSize: "0.8rem", color: "#EF4444", marginTop: 2 }}>{error}</p>
          </div>
          <button
            onClick={loadScenarios}
            className="px-4 py-2 rounded-xl font-semibold transition hover:bg-red-100"
            style={{ fontSize: "0.85rem", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Content ───────────────────────────────────── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#F1F5F9" }}
              >
                <Mail size={28} className="text-slate-300" />
              </div>
              <p style={{ fontWeight: 700, fontSize: "1rem", color: "#94A3B8", marginBottom: 6 }}>
                {search || activeCategory !== "Tất cả"
                  ? "Không tìm thấy kịch bản phù hợp"
                  : "Chưa có kịch bản nào"}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>
                {search || activeCategory !== "Tất cả"
                  ? "Thử tìm kiếm với từ khóa khác hoặc đổi bộ lọc."
                  : "Bấm \"Thêm kịch bản\" để tạo kịch bản đầu tiên."}
              </p>
            </div>
          ) : (
            <>
              {/* Results count */}
              {(search || activeCategory !== "Tất cả") && (
                <p style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                  Hiển thị {filtered.length}/{scenarios.length} kịch bản
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((sc) => (
                  <ScenarioCard
                    key={sc.scenarioId}
                    scenario={sc}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Modals ────────────────────────────────────── */}
      {showCreate && (
        <CreateModal
          categories={categories}
          difficulties={difficulties}
          onClose={() => setShowCreate(false)}
          onSuccess={handleActionSuccess}
        />
      )}
      {editTarget && (
        <EditModal
          scenario={editTarget}
          difficulties={difficulties}
          onClose={() => setEditTarget(null)}
          onSuccess={handleActionSuccess}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          scenario={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
