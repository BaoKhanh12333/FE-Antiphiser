import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardCheck, Loader2, AlertCircle, CheckCircle2,
  XCircle, ShieldAlert, ShieldCheck, Calendar,
  ChevronRight, X, RefreshCw, Clock, Inbox,
} from "lucide-react";
import DOMPurify from "dompurify";
import { scenarioReviewService } from "../../services/scenarioReviewService";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES: Record<number, { name: string; bg: string; text: string }> = {
  1: { name: "Dễ", bg: "#ECFDF5", text: "#059669" },
  2: { name: "Trung bình", bg: "#FFF7ED", text: "#D97706" },
  3: { name: "Khó", bg: "#FEF2F2", text: "#DC2626" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingScenario {
  scenarioId: number;
  title: string;
  generationStatus: string;
  categoryId: number;
  difficultyId: number;
}

// ScenarioReviewService chỉ trả danh sách tóm tắt (SavedScenarioResponse).
// Để xem chi tiết email, dùng Scenarios/{id} hoặc hiển thị metadata đã có.

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  scenario,
  onClose,
  onApproved,
  onRejected,
}: {
  scenario: PendingScenario;
  onClose: () => void;
  onApproved: (id: number) => void;
  onRejected: (id: number) => void;
}) {
  const [fullData, setFullData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actErr, setActErr] = useState<string | null>(null);

  useEffect(() => {
    // Lấy chi tiết đầy đủ qua /api/Scenarios/{id}
    import("../../api/axiosInstance").then(({ default: axios }) => {
      (axios as any).get(`Scenarios/${scenario.scenarioId}`)
        .then((data: any) => {
          // Scenarios trả ApiResponse → cần unwrap .result
          setFullData(data?.result ?? data);
        })
        .catch(() => setFullData(null))
        .finally(() => setDetailLoading(false));
    });
  }, [scenario.scenarioId]);

  const handleApprove = async () => {
    setActing(true);
    setActErr(null);
    try {
      await scenarioReviewService.approve(scenario.scenarioId);
      onApproved(scenario.scenarioId);
    } catch (e: any) {
      setActErr(e?.message || "Duyệt thất bại.");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setActErr("Vui lòng nhập lý do từ chối."); return; }
    setActing(true);
    setActErr(null);
    try {
      await scenarioReviewService.reject(scenario.scenarioId, rejectReason.trim());
      onRejected(scenario.scenarioId);
    } catch (e: any) {
      setActErr(e?.message || "Từ chối thất bại.");
    } finally {
      setActing(false);
    }
  };

  const diff = DIFFICULTIES[scenario.difficultyId] || DIFFICULTIES[2];
  const emailHtml = fullData?.emailBodyHtml
    ? DOMPurify.sanitize(fullData.emailBodyHtml)
    : null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(560px, 100vw)",
        background: "#fff",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Drawer header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 99,
                background: "#FFF7ED",
                color: "#D97706",
                border: "1px solid #FDE68A",
              }}
            >
              PendingReview
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 99,
                background: diff.bg,
                color: diff.text,
              }}
            >
              {diff.name}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>ID: {scenario.scenarioId}</span>
          </div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0F172A",
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {scenario.title}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", flexShrink: 0, padding: 4 }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }} className="space-y-5">
        {detailLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "#94A3B8" }}>
            <Loader2 size={20} className="animate-spin" />
            <span>Đang tải chi tiết...</span>
          </div>
        ) : !fullData ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: "0.85rem" }}>Không tải được chi tiết kịch bản.</p>
          </div>
        ) : (
          <>
            {/* Email preview */}
            <div>
              <p style={sectionTitle}>Email mô phỏng</p>
              <div
                style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 14,
                  overflow: "hidden",
                  marginTop: 10,
                }}
              >
                {/* Email header */}
                <div style={{ padding: "12px 16px", background: "#FAFAFA", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        flexShrink: 0,
                      }}
                    >
                      {fullData.senderName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.78rem", color: "#0F172A" }}>{fullData.senderName}</p>
                      <p style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{fullData.senderEmail}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1E293B" }}>{fullData.subject}</p>
                </div>
                {/* Email body */}
                {emailHtml ? (
                  <div
                    style={{ padding: "14px 16px", maxHeight: 260, overflowY: "auto", fontSize: "0.82rem", lineHeight: 1.7, color: "#334155" }}
                    dangerouslySetInnerHTML={{ __html: emailHtml }}
                  />
                ) : (
                  <div style={{ padding: "14px 16px", color: "#94A3B8", fontSize: "0.82rem" }}>
                    Không có nội dung HTML.
                  </div>
                )}
              </div>
            </div>

            {/* Phishing verdict */}
            <div
              style={{
                padding: "12px 16px",
                background: fullData.isPhishing ? "#FEF2F2" : "#ECFDF5",
                borderRadius: 12,
                border: `1px solid ${fullData.isPhishing ? "#FECACA" : "#A7F3D0"}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              {fullData.isPhishing
                ? <ShieldAlert size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }} />
                : <ShieldCheck size={16} style={{ color: "#059669", flexShrink: 0, marginTop: 1 }} />}
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.82rem", color: fullData.isPhishing ? "#DC2626" : "#059669", marginBottom: 4 }}>
                  {fullData.isPhishing ? "Email phishing" : "Email an toàn"}
                </p>
                {fullData.phishingIndicators && (
                  <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6, marginBottom: 3 }}>
                    <strong>Dấu hiệu:</strong> {fullData.phishingIndicators}
                  </p>
                )}
                {fullData.explanationHint && (
                  <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.6 }}>
                    <strong>Gợi ý:</strong> {fullData.explanationHint}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #F1F5F9",
          flexShrink: 0,
          background: "#FAFAFA",
        }}
      >
        {actErr && (
          <div style={{ padding: "8px 12px", background: "#FEF2F2", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <AlertCircle size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
            <p style={{ fontSize: "0.78rem", color: "#DC2626" }}>{actErr}</p>
          </div>
        )}

        {rejectMode ? (
          <div className="space-y-3">
            <label style={labelStyle}>Lý do từ chối <span style={{ color: "#DC2626" }}>*</span></label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối kịch bản này..."
              rows={3}
              style={{ ...inputStyle, height: "auto", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setRejectMode(false); setRejectReason(""); setActErr(null); }} style={btnSecondary}>
                Huỷ
              </button>
              <button
                onClick={handleReject}
                disabled={acting}
                style={{
                  ...btnDanger,
                  flex: 1,
                  justifyContent: "center",
                  opacity: acting ? 0.7 : 1,
                  cursor: acting ? "not-allowed" : "pointer",
                }}
              >
                {acting ? <><Loader2 size={14} className="animate-spin" /> Đang xử lý...</> : <><XCircle size={14} /> Xác nhận từ chối</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setRejectMode(true); setActErr(null); }}
              style={{ ...btnDanger, flex: 1, justifyContent: "center" }}
            >
              <XCircle size={15} /> Từ chối
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              style={{
                ...btnSuccess,
                flex: 1,
                justifyContent: "center",
                opacity: acting ? 0.7 : 1,
                cursor: acting ? "not-allowed" : "pointer",
              }}
            >
              {acting ? <><Loader2 size={14} className="animate-spin" /> Đang duyệt...</> : <><CheckCircle2 size={15} /> Duyệt kịch bản</>}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminAIDuyetKichBan() {
  const [items, setItems] = useState<PendingScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PendingScenario | null>(null);
  const [toast, setToast] = useState<{ type: "approve" | "reject"; id: number } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    (scenarioReviewService.getPending() as Promise<PendingScenario[]>)
      .then(setItems)
      .catch((e: any) => setError(e?.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (type: "approve" | "reject", id: number) => {
    setToast({ type, id });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApproved = (id: number) => {
    setItems((prev) => prev.filter((s) => s.scenarioId !== id));
    setSelected(null);
    showToast("approve", id);
  };

  const handleRejected = (id: number) => {
    setItems((prev) => prev.filter((s) => s.scenarioId !== id));
    setSelected(null);
    showToast("reject", id);
  };

  const fmtDiff = (id: number) => DIFFICULTIES[id] || DIFFICULTIES[2];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              padding: "12px 20px",
              borderRadius: 12,
              background: toast.type === "approve" ? "#ECFDF5" : "#FEF2F2",
              border: `1px solid ${toast.type === "approve" ? "#A7F3D0" : "#FECACA"}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: toast.type === "approve" ? "#059669" : "#DC2626",
            }}
          >
            {toast.type === "approve"
              ? <CheckCircle2 size={18} />
              : <XCircle size={18} />}
            {toast.type === "approve"
              ? `Kịch bản ID ${toast.id} đã được duyệt → IsActive = true`
              : `Kịch bản ID ${toast.id} đã bị từ chối`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer overlay */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(15,22,50,0.4)", zIndex: 40 }}
              onClick={() => setSelected(null)}
            />
            <DetailDrawer
              key="drawer"
              scenario={selected}
              onClose={() => setSelected(null)}
              onApproved={handleApproved}
              onRejected={handleRejected}
            />
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
            Duyệt kịch bản AI
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginTop: 4 }}>
            Xem xét và duyệt các kịch bản AI sinh ra trước khi đưa vào pool mô phỏng thật
          </p>
        </div>
        <button onClick={load} style={btnSecondary} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Làm mới
        </button>
      </div>

      {/* Flow explanation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "AI sinh kịch bản", sub: "Từ ngữ cảnh hoặc biến thể", color: "#6366F1", bg: "#EEF2FF" },
          { label: "PendingReview", sub: "Chờ Admin/Manager duyệt", color: "#D97706", bg: "#FFF7ED" },
          { label: "Approved", sub: "IsActive = true → vào pool", color: "#059669", bg: "#ECFDF5" },
        ].map((step, i) => (
          <div
            key={step.label}
            style={{
              flex: "1 1 160px",
              padding: "14px 18px",
              background: step.bg,
              borderRight: i < 2 ? "1px solid #E2E8F0" : "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: step.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.75rem",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0F172A" }}>{step.label}</p>
              <p style={{ fontSize: "0.7rem", color: "#64748B" }}>{step.sub}</p>
            </div>
            {i < 2 && <ChevronRight size={14} style={{ color: "#CBD5E1", marginLeft: "auto" }} />}
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "#94A3B8" }}>
          <Loader2 size={22} className="animate-spin" />
          <span>Đang tải hàng chờ...</span>
        </div>
      ) : error ? (
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <AlertCircle size={36} style={{ color: "#DC2626", margin: "0 auto 10px" }} />
          <p style={{ color: "#DC2626", fontSize: "0.9rem" }}>{error}</p>
          <button onClick={load} style={{ ...btnSecondary, marginTop: 12 }}>Thử lại</button>
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: "56px 24px", textAlign: "center" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Inbox size={32} style={{ color: "#059669" }} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A", marginBottom: 6 }}>
            Hàng chờ trống
          </p>
          <p style={{ fontSize: "0.85rem", color: "#94A3B8", maxWidth: 380, margin: "0 auto" }}>
            Không có kịch bản nào đang chờ duyệt. Khi AI sinh xong kịch bản mới, chúng sẽ xuất hiện ở đây.
          </p>
        </motion.div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 120px 100px 100px",
              padding: "12px 20px",
              borderBottom: "1px solid #F1F5F9",
              background: "#FAFAFA",
            }}
          >
            {["ID", "Tiêu đề", "Độ khó", "Trạng thái", ""].map((h) => (
              <p key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {items.map((item, i) => {
            const diff = fmtDiff(item.difficultyId);
            return (
              <motion.div
                key={item.scenarioId}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 120px 100px 100px",
                  padding: "14px 20px",
                  borderBottom: i < items.length - 1 ? "1px solid #F8FAFC" : "none",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => setSelected(item)}
              >
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6366F1" }}>
                  #{item.scenarioId}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 12,
                  }}
                >
                  {item.title}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: diff.bg,
                    color: diff.text,
                    width: "fit-content",
                  }}
                >
                  {diff.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={12} style={{ color: "#D97706" }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#D97706" }}>
                    Chờ duyệt
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#6366F1",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Xem <ChevronRight size={13} />
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Footer count */}
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid #F1F5F9",
              background: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ClipboardCheck size={13} style={{ color: "#94A3B8" }} />
            <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
              {items.length} kịch bản đang chờ duyệt
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: "0.875rem",
  color: "#334155",
  outline: "none",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  background: "#FAFAFA",
  boxSizing: "border-box",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 16px",
  height: 40,
  borderRadius: 10,
  background: "#fff",
  color: "#475569",
  fontWeight: 600,
  fontSize: "0.85rem",
  border: "1.5px solid #E2E8F0",
  cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
  whiteSpace: "nowrap",
};

const btnSuccess: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 18px",
  height: 42,
  borderRadius: 10,
  background: "linear-gradient(135deg,#059669,#10B981)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.875rem",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
};

const btnDanger: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 18px",
  height: 42,
  borderRadius: 10,
  background: "linear-gradient(135deg,#DC2626,#EF4444)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.875rem",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Be Vietnam Pro', sans-serif",
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "0.9rem",
  color: "#0F172A",
};
