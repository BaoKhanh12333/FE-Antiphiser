import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, CheckCircle2, AlertTriangle, PlayCircle, BookOpen, Shield, Building2, ShieldAlert, ArrowRight, TrendingUp } from "lucide-react";
import { userService } from "../services/userService";
import { campaignService } from "../services/campaignService";
import { scenarioService } from "../services/scenarioService";
import { lessonService } from "../services/lessonService";
import { motion } from "motion/react";

// ─── SVG Accuracy Ring ────────────────────────────────────────────────────────
function AccuracyRing({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          stroke="#F1F5F9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="url(#accuracyGradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
        <defs>
          <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="font-black text-slate-800" style={{ fontSize: size * 0.22 }}>
          {value}%
        </span>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Độ chính xác</p>
      </div>
    </div>
  );
}

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASE_CONFIG: Record<number, {
  name: string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  1: { name: "Nền tảng cơ bản",            Icon: Shield,      color: "#7C3AED", bgColor: "#F5F3FF" },
  2: { name: "Nhận diện email đáng ngờ",    Icon: Mail,        color: "#2563EB", bgColor: "#EFF6FF" },
  3: { name: "Phishing môi trường doanh nghiệp", Icon: Building2, color: "#B45309", bgColor: "#FEF3C7" },
  4: { name: "Ứng phó & Báo cáo",           Icon: ShieldAlert, color: "#059669", bgColor: "#ECFDF5" },
};

function getPhaseNum(lesson: any) {
  return lesson.phaseNumber ?? 1;
}

export function TongQuan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [activeCampaignAttempts, setActiveCampaignAttempts] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);

  // Aggregate Stats
  const [stats, setStats] = useState({
    processedEmails: 0,
    correctDetections: 0,
    accuracyRate: 0,
    trickedTimes: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch user profile
        const userProfile = await userService.getUserProfile();
        setProfile(userProfile);

        // 2. Fetch my campaigns
        const myCampaigns = await campaignService.getMyCampaigns();
        
        // Filter out Test and Verify campaigns
        const filteredCampaigns = myCampaigns?.filter((c: any) => 
          !c.campaignName.toLowerCase().includes("test") && 
          !c.campaignName.toLowerCase().includes("verify")
        ) || [];

        setAllCampaigns(filteredCampaigns);

        // Find active campaign
        const active = filteredCampaigns.find((c: any) => c.isActive) || null;
        setActiveCampaign(active);

        let activeDetails = null;
        let activeAttempts: any[] = [];
        
        if (active) {
          [activeDetails, activeAttempts] = await Promise.all([
            campaignService.getCampaignById(active.campaignId).catch(() => null),
            scenarioService.getMyAttempts(active.campaignId).catch(() => [])
          ]);
          setCampaignDetails(activeDetails);
          setActiveCampaignAttempts(activeAttempts);
        }

        // 3. Compute aggregate stats over all campaigns
        let combinedAttempts: any[] = [];
        if (filteredCampaigns && filteredCampaigns.length > 0) {
          const allAttemptsLists = await Promise.all(
            filteredCampaigns.map((c: any) =>
              scenarioService.getMyAttempts(c.campaignId).catch(() => [])
            )
          );
          combinedAttempts = allAttemptsLists.flat();
        }

        const processed = combinedAttempts.length;
        const correct = combinedAttempts.filter((a: any) => a.isCorrect).length;
        const accuracy = processed > 0 ? Math.round((correct / processed) * 100) : 0;
        const tricked = combinedAttempts.filter((a: any) => a.isClickedLink || a.isCredentialLeaked).length;

        setStats({
          processedEmails: processed,
          correctDetections: correct,
          accuracyRate: accuracy,
          trickedTimes: tricked,
        });

        // 4. Fetch lessons progress
        if (userProfile?.id) {
          const [lessonsData, progressData] = await Promise.all([
            lessonService.getAllLessons().catch(() => []),
            lessonService.getUserProgress(userProfile.id).catch(() => [])
          ]);
          setAllLessons(lessonsData || []);
          setProgressList(progressData || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-screen-xl mx-auto animate-pulse">
        <div className="h-8 w-72 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-48 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-2 h-48 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-52 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-2 h-52 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate clamped active campaign progress
  const uniqueScenarioIds = new Set(activeCampaignAttempts.map((a: any) => a.scenarioId));
  const campaignScenarioIds = new Set((campaignDetails?.scenarios || []).map((s: any) => s.scenarioId));
  const completedScenarioIds = Array.from(uniqueScenarioIds).filter((id) => campaignScenarioIds.has(id));

  const doneEmails = completedScenarioIds.length;
  const totalEmails = campaignDetails?.scenarios?.length || 0;
  const activePercent = Math.min(100, totalEmails > 0 ? Math.round((doneEmails / totalEmails) * 100) : 0);

  // Lesson total completed
  const completedLessonsCount = progressList.filter((p: any) => p.isCompleted).length;
  const totalLessonsCount = allLessons.length || 0;

  // Phase grouping calculations
  const phaseStats = [1, 2, 3, 4].map(ph => {
    const phaseLessons = allLessons.filter((l: any) => getPhaseNum(l) === ph);
    const total = phaseLessons.length;
    const completed = phaseLessons.filter((l: any) => 
      progressList.some((p: any) => p.lessonId === l.lessonId && p.isCompleted)
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      phase: ph,
      name: PHASE_CONFIG[ph as keyof typeof PHASE_CONFIG].name,
      completed,
      total,
      pct,
    };
  });

  const isUserNew = stats.processedEmails === 0 && completedLessonsCount === 0;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800 leading-tight">
            Chào mừng quay trở lại, {profile?.fullName || "người dùng"}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Hôm nay: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Row 2: Top Grid (Active Campaign + Accuracy Visualizer) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Active Campaign Card */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, #F5F7FF 0%, #EEF2FF 100%)",
            border: "1px solid #E0E7FF",
            boxShadow: "0 10px 30px rgba(79, 70, 229, 0.04)",
          }}
        >
          {/* Background decorative path */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-50/50 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700">
                {allCampaigns.length > 0 ? `● ${allCampaigns.length} chiến dịch đang chạy` : "Sẵn sàng học tập"}
              </span>
            </div>

            {allCampaigns.length > 0 ? (
              <>
                <h2 className="font-black text-slate-800 text-lg leading-snug">
                  Bạn đang tham gia {allCampaigns.length} chiến dịch
                </h2>
                <div className="mt-2 space-y-1">
                  {allCampaigns.slice(0, 3).map((c: any) => (
                    <p key={c.campaignId} className="text-xs text-slate-500 leading-relaxed truncate">
                      • {c.campaignName}
                    </p>
                  ))}
                  {allCampaigns.length > 3 && (
                    <p className="text-xs text-indigo-400 font-semibold">+{allCampaigns.length - 3} chiến dịch khác</p>
                  )}
                </div>

                {/* Aggregate progress */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-bold">Tổng email đã xử lý</span>
                    <span className="text-xs font-black text-indigo-600">
                      {stats.processedEmails} email — {stats.accuracyRate}% chính xác
                    </span>
                  </div>
                  <div className="h-3 rounded-full w-full bg-indigo-100/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, stats.processedEmails > 0 ? Math.min(stats.processedEmails * 5, 100) : 0)}%`,
                        background: "linear-gradient(90deg, #4F46E5, #6366F1)",
                        boxShadow: "0 0 10px rgba(79, 70, 229, 0.25)"
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-black text-slate-800 text-lg leading-snug">
                  Chưa có chiến dịch hoạt động
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-lg">
                  Hiện tại không có chiến dịch giả lập nào đang được kích hoạt cho bạn. Vui lòng hoàn thành lộ trình học lý thuyết.
                </p>
              </>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-indigo-500 font-bold">
              {allCampaigns.length > 0 ? `${allCampaigns.length} chiến dịch — ${stats.processedEmails} email đã làm` : "Hoàn thành 4 Phase bài học lý thuyết"}
            </span>
            {allCampaigns.length > 0 ? (
              <button
                onClick={() => navigate("/nguoi-dung/mo-phong")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)" }}
              >
                <PlayCircle size={15} />
                Xem tất cả chiến dịch
              </button>
            ) : (
              <button
                onClick={() => navigate("/nguoi-dung/lo-trinh")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-indigo-600 bg-white border border-indigo-200 hover:border-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Học lý thuyết <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Accuracy Visualizer Card */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-100 flex flex-col justify-between"
          style={{
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Hiệu suất mô phỏng</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tỉ lệ nhận diện email lừa đảo</p>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>

          <div className="my-4 flex items-center justify-center gap-6">
            <AccuracyRing value={stats.accuracyRate} />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Phát hiện đúng</span>
                  <span className="font-bold text-slate-800 text-xs">{stats.correctDetections} email</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Dính bẫy click</span>
                  <span className="font-bold text-slate-800 text-xs">{stats.trickedTimes} lần</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            {stats.processedEmails > 0 
              ? `Hệ thống ghi nhận bạn đã hoàn thành phản xạ với ${stats.processedEmails} email.`
              : "Bắt đầu làm các bài kiểm tra mô phỏng để đo lường độ chính xác."}
          </div>
        </div>

      </div>

      {/* ── Row 3: 4 Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail,          bg: "bg-indigo-50",  iconCls: "text-indigo-600",  label: "Email đã xử lý",       value: stats.processedEmails,  valCls: "text-slate-800" },
          { icon: CheckCircle2,  bg: "bg-emerald-50", iconCls: "text-emerald-600", label: "Phát hiện chính xác",  value: stats.correctDetections, valCls: "text-slate-800" },
          { icon: AlertTriangle, bg: "bg-amber-50",   iconCls: "text-amber-600",   label: "Lần dính bẫy",         value: stats.trickedTimes,     valCls: "text-amber-600" },
          { icon: BookOpen,      bg: "bg-violet-50",  iconCls: "text-violet-600",  label: "Bài học hoàn thành",   value: `${completedLessonsCount} / ${totalLessonsCount}`, valCls: "text-slate-800" },
        ].map(({ icon: Icon, bg, iconCls, label, value, valCls }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(99,102,241,0.1)" }}
            className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4 cursor-default"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={18} className={iconCls} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
              <span className={`text-lg font-black block mt-0.5 ${valCls}`}>{value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Row 4: Bottom Grid (Phase progress & Call To Action) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Tiến độ theo Phase (Spans 3 columns) */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 bg-white border border-slate-100"
          style={{ boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)" }}
        >
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Tiến độ bài học theo Phase</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tiến trình đào tạo lý thuyết</p>
          </div>

          <div className="space-y-4">
            {phaseStats.map(ph => {
              const cfg = PHASE_CONFIG[ph.phase as keyof typeof PHASE_CONFIG];
              const Icon = cfg.Icon;

              return (
                <div key={ph.phase} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bgColor }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-700 truncate">Phase {ph.phase}: {ph.name}</span>
                      <span className="font-bold text-slate-500 shrink-0 ml-2">
                        {ph.completed} / {ph.total} bài
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 w-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${ph.pct}%`,
                          background: cfg.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: CTA / Quick Launch (Spans 2 columns) */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-100 flex flex-col justify-between"
          style={{ boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)" }}
        >
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Hành động nhanh</h3>
            
            {isUserNew ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chào mừng bạn đến với AntiPhisher! Hãy bắt đầu lộ trình để bảo vệ bản thân và tổ chức.
                </p>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
                  <span className="block text-[10px] text-indigo-500 font-bold uppercase mb-1">Khuyên dùng</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Học Phase 1: Nền tảng cơ bản
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Lý thuyết hoàn thành</span>
                  <span className="font-bold text-slate-700">
                    {Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Số lần phát hiện chính xác</span>
                  <span className="font-bold text-emerald-600">{stats.accuracyRate}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-6">
            <button
              onClick={() => navigate("/nguoi-dung/lo-trinh")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700"
              style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.2)" }}
            >
              <BookOpen size={14} />
              {isUserNew ? "Bắt đầu học ngay" : "Tiếp tục học lý thuyết"}
            </button>
            
            {activeCampaign && (
              <button
                onClick={() => navigate("/nguoi-dung/mo-phong")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <PlayCircle size={14} />
                Thực hành mô phỏng
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
