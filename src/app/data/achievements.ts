export type AchievementRarity = "bronze" | "silver" | "gold" | "platinum";

export interface UserStats {
  processedEmails: number;
  correctDetections: number;
  trickedTimes: number;
  completedLessons: number;
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  rarity: AchievementRarity;
  unlockMsg: string;
  condition: (s: UserStats) => boolean;
  progress: (s: UserStats) => { current: number; max: number };
}

export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  borderColor: string;
  bgGrad: string;
  iconFilter: string;
  textColor: string;
  glowShadow: string;
  badgeBg: string;
  badgeText: string;
}> = {
  bronze: {
    label: "Đồng",
    borderColor: "#CD7F32",
    bgGrad: "linear-gradient(135deg,#FEF3E2,#FDE8C8)",
    iconFilter: "none",
    textColor: "#92400E",
    glowShadow: "0 4px 20px rgba(205,127,50,0.28)",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
  },
  silver: {
    label: "Bạc",
    borderColor: "#94A3B8",
    bgGrad: "linear-gradient(135deg,#F8FAFC,#F1F5F9)",
    iconFilter: "none",
    textColor: "#475569",
    glowShadow: "0 4px 20px rgba(148,163,184,0.3)",
    badgeBg: "#F1F5F9",
    badgeText: "#475569",
  },
  gold: {
    label: "Vàng",
    borderColor: "#F59E0B",
    bgGrad: "linear-gradient(135deg,#FEFCE8,#FEF3C7)",
    iconFilter: "none",
    textColor: "#92400E",
    glowShadow: "0 4px 20px rgba(245,158,11,0.32)",
    badgeBg: "#FEF9C3",
    badgeText: "#A16207",
  },
  platinum: {
    label: "Bạch kim",
    borderColor: "#6366F1",
    bgGrad: "linear-gradient(135deg,#EEF2FF,#E0E7FF)",
    iconFilter: "none",
    textColor: "#4338CA",
    glowShadow: "0 4px 20px rgba(99,102,241,0.3)",
    badgeBg: "#EEF2FF",
    badgeText: "#4338CA",
  },
};

// ─── Custom achievement condition system (serializable) ──────────────────────

export type ConditionType =
  | "processedEmails_gte"
  | "correctDetections_gte"
  | "completedLessons_gte"
  | "no_tricked_with_emails";

export const CONDITION_TYPE_LABELS: Record<ConditionType, string> = {
  processedEmails_gte:    "Email đã xử lý ≥ N",
  correctDetections_gte:  "Phát hiện đúng ≥ N",
  completedLessons_gte:   "Bài học hoàn thành ≥ N",
  no_tricked_with_emails: "Không dính bẫy & email ≥ N",
};

export interface CustomAchievementParams {
  id: string;
  icon: string;
  title: string;
  desc: string;
  rarity: AchievementRarity;
  unlockMsg: string;
  conditionType: ConditionType;
  conditionValue: number;
}

const CUSTOM_KEY = "customAchievements";

export function loadCustomAchievements(): CustomAchievementParams[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomAchievements(list: CustomAchievementParams[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

export function paramsToAchievementDef(p: CustomAchievementParams): AchievementDef {
  const N = p.conditionValue;
  let condition: (s: UserStats) => boolean;
  let progress: (s: UserStats) => { current: number; max: number };

  switch (p.conditionType) {
    case "processedEmails_gte":
      condition = (s) => s.processedEmails >= N;
      progress  = (s) => ({ current: Math.min(s.processedEmails, N), max: N });
      break;
    case "correctDetections_gte":
      condition = (s) => s.correctDetections >= N;
      progress  = (s) => ({ current: Math.min(s.correctDetections, N), max: N });
      break;
    case "completedLessons_gte":
      condition = (s) => s.completedLessons >= N;
      progress  = (s) => ({ current: Math.min(s.completedLessons, N), max: N });
      break;
    case "no_tricked_with_emails":
    default:
      condition = (s) => s.trickedTimes === 0 && s.processedEmails >= N;
      progress  = (s) => ({
        current: s.trickedTimes === 0 ? Math.min(s.processedEmails, N) : 0,
        max: N,
      });
      break;
  }

  return { id: p.id, icon: p.icon, title: p.title, desc: p.desc, rarity: p.rarity, unlockMsg: p.unlockMsg, condition, progress };
}

export function getAllAchievements(): AchievementDef[] {
  const custom = loadCustomAchievements().map(paramsToAchievementDef);
  return [...ACHIEVEMENT_DEFS, ...custom];
}

// ─── Built-in definitions ─────────────────────────────────────────────────────

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_email",
    icon: "🎯",
    title: "Người mới",
    desc: "Hoàn thành email đầu tiên",
    rarity: "bronze",
    unlockMsg: "Bạn vừa xử lý email đầu tiên!",
    condition: (s) => s.processedEmails >= 1,
    progress: (s) => ({ current: Math.min(s.processedEmails, 1), max: 1 }),
  },
  {
    id: "diligent",
    icon: "⚡",
    title: "Siêng năng",
    desc: "Xử lý 10 email mô phỏng",
    rarity: "bronze",
    unlockMsg: "10 email đã xử lý — bạn đang tiến bộ!",
    condition: (s) => s.processedEmails >= 10,
    progress: (s) => ({ current: Math.min(s.processedEmails, 10), max: 10 }),
  },
  {
    id: "sharp_eye",
    icon: "🛡️",
    title: "Mắt tinh",
    desc: "Phát hiện đúng 5 email phishing",
    rarity: "silver",
    unlockMsg: "5 phishing phát hiện chính xác!",
    condition: (s) => s.correctDetections >= 5,
    progress: (s) => ({ current: Math.min(s.correctDetections, 5), max: 5 }),
  },
  {
    id: "warrior",
    icon: "🔥",
    title: "Chiến binh",
    desc: "Xử lý 50 email mô phỏng",
    rarity: "silver",
    unlockMsg: "50 email — Chiến binh thực thụ!",
    condition: (s) => s.processedEmails >= 50,
    progress: (s) => ({ current: Math.min(s.processedEmails, 50), max: 50 }),
  },
  {
    id: "lesson_master",
    icon: "📚",
    title: "Học giả",
    desc: "Hoàn thành 10 bài học lý thuyết",
    rarity: "silver",
    unlockMsg: "10 bài học hoàn thành — Học giả!",
    condition: (s) => s.completedLessons >= 10,
    progress: (s) => ({ current: Math.min(s.completedLessons, 10), max: 10 }),
  },
  {
    id: "expert",
    icon: "🏆",
    title: "Chuyên gia",
    desc: "Phát hiện đúng 20 email phishing",
    rarity: "gold",
    unlockMsg: "20 phát hiện chính xác — Chuyên gia an ninh mạng!",
    condition: (s) => s.correctDetections >= 20,
    progress: (s) => ({ current: Math.min(s.correctDetections, 20), max: 20 }),
  },
  {
    id: "century",
    icon: "💯",
    title: "Bách chiến",
    desc: "Xử lý 100 email mô phỏng",
    rarity: "gold",
    unlockMsg: "100 email! Bách chiến bất bại!",
    condition: (s) => s.processedEmails >= 100,
    progress: (s) => ({ current: Math.min(s.processedEmails, 100), max: 100 }),
  },
  {
    id: "invincible",
    icon: "💎",
    title: "Bất bại",
    desc: "Hoàn thành 5+ email mà không dính bẫy lần nào",
    rarity: "platinum",
    unlockMsg: "Không một bẫy nào lọt qua! Phi thường!",
    condition: (s) => s.trickedTimes === 0 && s.processedEmails >= 5,
    progress: (s) => ({
      current: s.trickedTimes === 0 ? Math.min(s.processedEmails, 5) : 0,
      max: 5,
    }),
  },
];
