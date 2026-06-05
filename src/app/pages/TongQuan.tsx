import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, CheckCircle2, AlertTriangle, PlayCircle, BookOpen, Shield, Building2, ShieldAlert, ArrowRight, TrendingUp } from "lucide-react";
import { userService } from "../services/userService";
import { campaignService } from "../services/campaignService";
import { scenarioService } from "../services/scenarioService";
import { lessonService } from "../services/lessonService";

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

function getPhaseNum(id: number) {
  if (id <= 6)  return 1;
  if (id <= 11) return 2;
  if (id <= 16) return 3;
  return 4;
}

export function TongQuan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative mx-auto mb-4" style={{ width: 50, height: 50 }}>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Đang tải dữ liệu tổng quan...</p>
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
    const phaseLessons = allLessons.filter((l: any) => getPhaseNum(l.lessonId) === ph);
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
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700">
                {activeCampaign ? "● Chiến dịch đang chạy" : "Sẵn sàng học tập"}
              </span>
            </div>

            {activeCampaign ? (
              <>
                <h2 className="font-black text-slate-800 text-lg leading-snug">
                  {campaignDetails?.campaignName || activeCampaign.campaignName}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-lg">
                  {campaignDetails?.description || "Tham gia thực hành và nâng cao khả năng phản xạ trước các email lừa đảo nguy hại."}
                </p>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-bold">Tiến độ thực tế</span>
                    <span className="text-xs font-black text-indigo-600">
                      {doneEmails} / {totalEmails} Email ({activePercent}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full w-full bg-indigo-100/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${activePercent}%`,
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
              {activeCampaign ? `Yêu cầu làm tối thiểu ${totalEmails} kịch bản` : "Hoàn thành 4 Phase bài học lý thuyết"}
            </span>
            {activeCampaign ? (
              <button
                onClick={() => navigate("/nguoi-dung/mo-phong")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)" }}
              >
                <PlayCircle size={15} />
                Thực hành ngay
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
        {/* Card 1: Tổng email đã xử lý */}
        <div className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
            <Mail size={18} className="text-indigo-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email đã xử lý</span>
            <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.processedEmails}</span>
          </div>
        </div>

        {/* Card 2: Phát hiện chính xác */}
        <div className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phát hiện chính xác</span>
            <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.correctDetections}</span>
          </div>
        </div>

        {/* Card 3: Lần dính bẫy */}
        <div className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lần dính bẫy</span>
            <span className="text-lg font-black text-amber-600 block mt-0.5">{stats.trickedTimes}</span>
          </div>
        </div>

        {/* Card 4: Bài học lý thuyết */}
        <div className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50">
            <BookOpen size={18} className="text-violet-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bài học hoàn thành</span>
            <span className="text-lg font-black text-slate-800 block mt-0.5">
              {completedLessonsCount} / {totalLessonsCount}
            </span>
          </div>
        </div>
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
