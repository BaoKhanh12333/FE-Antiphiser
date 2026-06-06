import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  ShieldAlert, BookOpen, Users, Search, PlusCircle,
} from "lucide-react";
import { campaignService } from "../../services/campaignService";
import { scenarioService } from "../../services/scenarioService";
import { lessonService } from "../../services/lessonService";
import { userService } from "../../services/userService";

type Scenario = {
  scenarioId: number;
  title: string;
  difficultyId: number;
  difficultyName: string | null;
  isPhishing: boolean;
  isActive: boolean;
};

type Employee = {
  userId: number;
  fullName: string;
  email: string;
  isActive: boolean;
};

type Lesson = {
  lessonId: number;
  title: string;
  phaseNumber: number;
};

const DIFF_META: Record<number, { label: string; color: string }> = {
  1: { label: "Dễ",        color: "#10B981" },
  2: { label: "Trung bình", color: "#F59E0B" },
  3: { label: "Khó",        color: "#EF4444" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function SectionCard({
  title, icon: Icon, count, total, children,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={17} style={{ color: "#6366F1" }} />
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {title}
        </h2>
        {count !== undefined && (
          <span className="ml-auto" style={{ fontSize: "0.78rem", fontWeight: 600, color: count > 0 ? "#6366F1" : "#94A3B8" }}>
            {count > 0 ? `${count}${total !== undefined ? `/${total}` : ""} đã chọn` : "Chưa chọn"}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function ManagerTaoCampaign() {
  const navigate = useNavigate();

  /* ── Form fields ──────────────────────────────────────────────── */
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<number[]>([]);
  const [selectedUserIds,     setSelectedUserIds]     = useState<number[]>([]);
  const [selectedLessonIds,   setSelectedLessonIds]   = useState<number[]>([]);

  /* ── Data ─────────────────────────────────────────────────────── */
  const [scenarios,  setScenarios]  = useState<Scenario[]>([]);
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [lessons,    setLessons]    = useState<Lesson[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);

  /* ── Scenario filters ─────────────────────────────────────────── */
  const [scenarioSearch, setScenarioSearch] = useState("");
  const [diffFilter,  setDiffFilter]  = useState<number | "all">("all");
  const [typeFilter,  setTypeFilter]  = useState<"all" | "phishing" | "legit">("all");

  /* ── Submit ───────────────────────────────────────────────────── */
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [partialId,   setPartialId]   = useState<number | null>(null);
  const [done,        setDone]        = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ id: number; name: string } | null>(null);

  /* ── Load data ────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    Promise.all([
      scenarioService.getAllScenarios(),
      userService.getCompanyEmployees(),
      lessonService.getAllLessons(),
    ])
      .then(([sc, em, ls]) => {
        if (!alive) return;
        setScenarios((sc ?? []).filter((s: Scenario) => s.isActive));
        setEmployees(em?.items ?? []);
        setLessons(ls ?? []);
      })
      .catch((err: Error) => { if (alive) setLoadError(err.message || "Lỗi tải dữ liệu"); })
      .finally(() => { if (alive) setLoadingData(false); });
    return () => { alive = false; };
  }, []);

  /* ── Derived ──────────────────────────────────────────────────── */
  const filteredScenarios = scenarios.filter(s => {
    if (diffFilter !== "all" && s.difficultyId !== diffFilter) return false;
    if (typeFilter === "phishing" && !s.isPhishing) return false;
    if (typeFilter === "legit" && s.isPhishing) return false;
    if (scenarioSearch && !s.title.toLowerCase().includes(scenarioSearch.toLowerCase())) return false;
    return true;
  });

  function toggleId(id: number, list: number[], setList: (l: number[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  /* ── Submit handler ───────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setPartialId(null);

    try {
      const payload: Record<string, unknown> = {
        campaignName: name.trim(),
        scenarioIds: selectedScenarioIds,
        requiredLessonIds: selectedLessonIds,
      };
      if (desc.trim())          payload.description = desc.trim();
      if (startDate)            payload.startDate   = startDate;
      if (endDate)              payload.endDate     = endDate;
      if (selectedUserIds.length) payload.userIds   = selectedUserIds;

      // Request 1: POST tạo campaign (draft)
      const created = await campaignService.createCampaign(payload) as { campaignId: number };
      const cid: number = created.campaignId;

      // Request 2: PUT activate
      try {
        await campaignService.activateCampaign(cid);
        setCreatedInfo({ id: cid, name: name.trim() });
        setDone(true);
      } catch (putErr: unknown) {
        const msg = putErr instanceof Error ? putErr.message : "Lỗi không xác định";
        setPartialId(cid);
        setSubmitError(
          `Campaign đã tạo (ID ${cid}) nhưng chưa activate được: ${msg}. Thử bật lại từ danh sách.`
        );
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Lỗi tạo chiến dịch");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Done screen ──────────────────────────────────────────────── */
  if (done && createdInfo) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#ECFDF5" }}
        >
          <CheckCircle2 size={32} style={{ color: "#059669" }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
          Chiến dịch đã kích hoạt!
        </h2>
        <p className="text-slate-500 mt-2" style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>
          <strong style={{ color: "#0F172A" }}>{createdInfo.name}</strong> (ID: {createdInfo.id}) đã tạo và
          kích hoạt thành công.<br />
          <span style={{ color: "#6366F1" }}>{selectedScenarioIds.length}</span> kịch bản ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedUserIds.length}</span> nhân viên ·{" "}
          <span style={{ color: "#6366F1" }}>{selectedLessonIds.length}</span> bài điều kiện.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setDone(false);
              setCreatedInfo(null);
              setName(""); setDesc(""); setStartDate(""); setEndDate("");
              setSelectedScenarioIds([]); setSelectedUserIds([]); setSelectedLessonIds([]);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ border: "1px solid #E2E8F0", color: "#64748B" }}
          >
            Tạo thêm
          </button>
          <button
            onClick={() => navigate("/quan-ly")}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            Về tổng quan
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading / Error ──────────────────────────────────────────── */
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-400 text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={24} style={{ color: "#EF4444" }} />
        <p className="text-slate-500 text-sm">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 text-sm font-semibold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────────────────────── */
  const inputStyle = {
    border: "1px solid #E2E8F0",
    fontSize: "0.88rem" as const,
    color: "#0F172A",
    outline: "none",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/quan-ly")}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all shrink-0"
          style={{ border: "1px solid #E2E8F0" }}
        >
          <ChevronLeft size={18} style={{ color: "#475569" }} />
        </button>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
            Tạo chiến dịch mới
          </h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.82rem" }}>
            Điền thông tin, chọn kịch bản và giao cho nhân viên
          </p>
        </div>
      </div>

      {/* ── 1. Thông tin chiến dịch ─────────────────────────────── */}
      <SectionCard title="Thông tin chiến dịch" icon={PlusCircle}>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Tên chiến dịch <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Vd: Phishing Awareness Q3 2026"
              required
              className="w-full rounded-xl px-4 py-2.5"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô tả</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Mô tả ngắn về mục tiêu chiến dịch (tùy chọn)"
              rows={2}
              className="w-full rounded-xl px-4 py-2.5 resize-none"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { label: "Ngày bắt đầu", val: startDate, set: setStartDate },
                { label: "Ngày kết thúc", val: endDate,   set: setEndDate },
              ] as { label: string; val: string; set: (v: string) => void }[]
            ).map(({ label, val, set }) => (
              <div key={label}>
                <label className="block mb-1.5 text-slate-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {label}
                </label>
                <input
                  type="date"
                  value={val}
                  onChange={e => set(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5"
                  style={{ ...inputStyle, color: val ? "#0F172A" : "#94A3B8" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6366F1")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Kịch bản ─────────────────────────────────────────── */}
      <SectionCard title="Kịch bản mô phỏng" icon={ShieldAlert} count={selectedScenarioIds.length} total={scenarios.length}>
        {/* Search + chips */}
        <div className="space-y-2 mb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <Search size={14} style={{ color: "#94A3B8" }} className="shrink-0" />
            <input
              value={scenarioSearch}
              onChange={e => setScenarioSearch(e.target.value)}
              placeholder="Tìm kịch bản..."
              className="bg-transparent flex-1 text-slate-700"
              style={{ outline: "none", fontSize: "0.85rem" }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [["all", "Tất cả"], [1, "Dễ"], [2, "Trung bình"], [3, "Khó"]] as [number | "all", string][]
            ).map(([val, lbl]) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setDiffFilter(val)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: diffFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC",
                  border: diffFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0",
                  color: diffFilter === val ? "#6366F1" : "#64748B",
                }}
              >
                {lbl}
              </button>
            ))}
            <span style={{ width: 1, background: "#E2E8F0", display: "inline-block", margin: "0 4px" }} />
            {(
              [["all", "Tất cả loại"], ["phishing", "Phishing"], ["legit", "Hợp lệ"]] as [
                "all" | "phishing" | "legit",
                string
              ][]
            ).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTypeFilter(val)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: typeFilter === val ? "rgba(99,102,241,0.1)" : "#F8FAFC",
                  border: typeFilter === val ? "1px solid rgba(99,102,241,0.3)" : "1px solid #E2E8F0",
                  color: typeFilter === val ? "#6366F1" : "#64748B",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div
          className="overflow-y-auto rounded-xl"
          style={{ maxHeight: 300, border: "1px solid #F1F5F9" }}
        >
          {filteredScenarios.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Không tìm thấy kịch bản phù hợp</p>
          ) : (
            filteredScenarios.map(s => {
              const selected = selectedScenarioIds.includes(s.scenarioId);
              const diff = DIFF_META[s.difficultyId] ?? { label: "?", color: "#94A3B8" };
              return (
                <button
                  key={s.scenarioId}
                  type="button"
                  onClick={() => toggleId(s.scenarioId, selectedScenarioIds, setSelectedScenarioIds)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b last:border-b-0 hover:bg-slate-50"
                  style={{
                    background: selected ? "#ECFDF5" : "transparent",
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: selected ? "#059669" : "transparent",
                      border: selected ? "none" : "1.5px solid #CBD5E1",
                    }}
                  >
                    {selected && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <span className="flex-1 text-slate-700" style={{ fontSize: "0.85rem" }}>
                    {s.title}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                    style={{ background: `${diff.color}15`, color: diff.color }}
                  >
                    {s.difficultyName ?? diff.label}
                  </span>
                  {s.isPhishing ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      Phishing
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: "#ECFDF5", color: "#059669" }}>
                      Hợp lệ
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
        <p className="text-slate-400 mt-2" style={{ fontSize: "0.72rem" }}>
          Hiển thị {filteredScenarios.length}/{scenarios.length} kịch bản
        </p>
      </SectionCard>

      {/* ── 3. Nhân viên ────────────────────────────────────────── */}
      <SectionCard title="Giao cho nhân viên" icon={Users} count={selectedUserIds.length} total={employees.length}>
        {employees.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Chưa có nhân viên nào trong công ty.</p>
        ) : (
          <div className="space-y-2">
            {employees.map(emp => {
              const selected = selectedUserIds.includes(emp.userId);
              return (
                <button
                  key={emp.userId}
                  type="button"
                  onClick={() => toggleId(emp.userId, selectedUserIds, setSelectedUserIds)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: selected ? "#ECFDF5" : "#F8FAFC",
                    border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: selected ? "#059669" : "transparent",
                      border: selected ? "none" : "1.5px solid #CBD5E1",
                    }}
                  >
                    {selected && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "#6366F1" }}
                  >
                    {initials(emp.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A" }}>{emp.fullName}</p>
                    <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{emp.email}</p>
                  </div>
                  {!emp.isActive && (
                    <span style={{ fontSize: "0.65rem", color: "#F59E0B", fontWeight: 700 }}>Không hoạt động</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── 4. Bài học điều kiện ────────────────────────────────── */}
      <SectionCard
        title="Bài học điều kiện (prerequisites)"
        icon={BookOpen}
        count={selectedLessonIds.length}
        total={lessons.length}
      >
        <p className="text-slate-400 mb-3" style={{ fontSize: "0.78rem" }}>
          Nhân viên phải hoàn thành các bài này trước khi tham gia chiến dịch.
        </p>
        <div className="space-y-1.5">
          {lessons.map(lesson => {
            const selected = selectedLessonIds.includes(lesson.lessonId);
            return (
              <button
                key={lesson.lessonId}
                type="button"
                onClick={() => toggleId(lesson.lessonId, selectedLessonIds, setSelectedLessonIds)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: selected ? "#ECFDF5" : "#F8FAFC",
                  border: selected ? "1px solid rgba(5,150,105,0.25)" : "1px solid #E2E8F0",
                }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: selected ? "#059669" : "transparent",
                    border: selected ? "none" : "1.5px solid #CBD5E1",
                  }}
                >
                  {selected && <CheckCircle2 size={11} className="text-white" />}
                </div>
                <span className="flex-1 text-slate-700" style={{ fontSize: "0.85rem" }}>
                  {lesson.title}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8", shrink: 0 } as React.CSSProperties}>
                  Giai đoạn {lesson.phaseNumber}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Error / partial */}
      {submitError && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: partialId ? "#FFFBEB" : "#FEF2F2",
            border: `1px solid ${partialId ? "#FCD34D" : "#FECACA"}`,
          }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: partialId ? "#D97706" : "#EF4444" }} />
          <p style={{ fontSize: "0.82rem", color: partialId ? "#92400E" : "#991B1B" }}>{submitError}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={() => navigate("/quan-ly")}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-slate-100"
          style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
          style={{
            background:
              name.trim() && !submitting
                ? "linear-gradient(135deg, #6366F1, #4F46E5)"
                : "rgba(99,102,241,0.4)",
            boxShadow: name.trim() && !submitting ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
            cursor: name.trim() && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Đang tạo...
            </>
          ) : (
            <>
              <PlusCircle size={15} /> Tạo &amp; kích hoạt
            </>
          )}
        </button>
      </div>
    </form>
  );
}
