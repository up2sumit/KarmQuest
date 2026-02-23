export type Difficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type QuestStatus = 'active' | 'completed';
export type Page = 'dashboard' | 'quests' | 'notes' | 'achievements' | 'challenges';

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  xpReward: number;
  dueDate: string; // ISO date string: "YYYY-MM-DD", or "" if no due date
  status: QuestStatus;
  category: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  createdAt: string;
  emoji: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xpRequired: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  streak: number;
  questsCompleted: number;
  totalQuests: number;
  avatarEmoji: string;
  username: string;
}

export const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string; darkBg: string; xp: number }> = {
  easy: { label: 'Sahaj', color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', xp: 10 },
  medium: { label: 'Madhyam', color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'bg-amber-500/10', xp: 25 },
  hard: { label: 'Kathin', color: 'text-red-500', bg: 'bg-red-50', darkBg: 'bg-red-500/10', xp: 50 },
  legendary: { label: 'Divya', color: 'text-violet-500', bg: 'bg-violet-50', darkBg: 'bg-violet-500/10', xp: 100 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities — centralised here so every part of the app uses the same logic
// ─────────────────────────────────────────────────────────────────────────────

/** Returns today's date as an ISO string "YYYY-MM-DD" in the user's local timezone. */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns an ISO date string offset by `days` from today (negative = past). */
export function offsetISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Given an ISO date string ("YYYY-MM-DD") or a legacy string ("Today", "Tomorrow", etc.),
 * returns a human-readable label AND whether the quest is overdue / due-today / future.
 *
 * Returns:
 *   label    — "Today", "Tomorrow", "Yesterday", "In 3 days", "3 days overdue", or the date
 *   isOverdue — true if the date is strictly in the past
 *   isDueToday — true if the date is today
 *   isDueSoon  — true if the date is tomorrow or the day after
 */
export function parseDueDate(dueDate: string): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean;
} {
  // Handle empty / no due date
  if (!dueDate) {
    return { label: 'No due date', isOverdue: false, isDueToday: false, isDueSoon: false };
  }

  // Handle legacy human-readable strings from the old demo data
  if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const legacy: Record<string, { label: string; isOverdue: boolean; isDueToday: boolean; isDueSoon: boolean }> = {
      'Today':     { label: 'Today',    isOverdue: false, isDueToday: true,  isDueSoon: false },
      'Tomorrow':  { label: 'Tomorrow', isOverdue: false, isDueToday: false, isDueSoon: true  },
      'Yesterday': { label: 'Yesterday! Overdue', isOverdue: true, isDueToday: false, isDueSoon: false },
      'This Week': { label: 'This Week', isOverdue: false, isDueToday: false, isDueSoon: false },
    };
    return legacy[dueDate] ?? { label: dueDate, isOverdue: false, isDueToday: false, isDueSoon: false };
  }

  // ISO date path — compare against today in local timezone
  const today = todayISO();
  const diff = dateDiffDays(today, dueDate); // positive = future, negative = past

  if (diff === 0) return { label: 'Today',         isOverdue: false, isDueToday: true,  isDueSoon: false };
  if (diff === 1) return { label: 'Tomorrow',      isOverdue: false, isDueToday: false, isDueSoon: true  };
  if (diff === 2) return { label: 'In 2 days',     isOverdue: false, isDueToday: false, isDueSoon: true  };
  if (diff > 2)   return { label: `In ${diff} days`, isOverdue: false, isDueToday: false, isDueSoon: false };
  if (diff === -1) return { label: 'Yesterday',    isOverdue: true,  isDueToday: false, isDueSoon: false };
  return { label: `${Math.abs(diff)} days overdue`, isOverdue: true, isDueToday: false, isDueSoon: false };
}

/** Days from dateA to dateB (positive if B is in the future relative to A). */
function dateDiffDays(isoA: string, isoB: string): number {
  const a = new Date(isoA + 'T00:00:00');
  const b = new Date(isoB + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Sort key for a quest's dueDate:
 *  - Overdue quests sort first (earliest overdue = most urgent)
 *  - Today's quests second
 *  - Future quests in ascending date order
 *  - Quests with no due date or legacy strings sort last
 */
export function dueDateSortKey(dueDate: string): number {
  if (!dueDate) return Number.MAX_SAFE_INTEGER;
  if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Legacy string sort order
    const order: Record<string, number> = {
      'Yesterday': -1, 'Today': 0, 'Tomorrow': 1, 'This Week': 7,
    };
    return order[dueDate] ?? Number.MAX_SAFE_INTEGER - 1;
  }
  return dateDiffDays(todayISO(), dueDate); // negative = past = sorts first
}

// ─────────────────────────────────────────────────────────────────────────────
// Default data — defaultQuests now use real ISO dates so they stay correct
// regardless of when the user first opens the app.
// ─────────────────────────────────────────────────────────────────────────────

export const defaultQuests: Quest[] = [
  { id: '1', title: 'Complete the project proposal',      difficulty: 'hard',      xpReward: 50,  dueDate: todayISO(),      status: 'active',    category: 'Karma' },
  { id: '2', title: 'Read 20 pages of Bhagavad Gita',     difficulty: 'easy',      xpReward: 10,  dueDate: todayISO(),      status: 'active',    category: 'Vidya' },
  { id: '3', title: 'Morning Surya Namaskar – 12 rounds', difficulty: 'medium',    xpReward: 25,  dueDate: todayISO(),      status: 'active',    category: 'Yoga' },
  { id: '4', title: 'Design the landing page mockup',     difficulty: 'hard',      xpReward: 50,  dueDate: offsetISO(1),    status: 'active',    category: 'Karma' },
  { id: '5', title: 'Dhyana meditation – 10 minutes',     difficulty: 'easy',      xpReward: 10,  dueDate: todayISO(),      status: 'active',    category: 'Sadhana' },
  { id: '6', title: 'Defeat the Asura of Procrastination',difficulty: 'legendary', xpReward: 100, dueDate: offsetISO(6),    status: 'active',    category: 'Boss Quest' },
  { id: '7', title: 'Organize workspace – Vastu style',   difficulty: 'easy',      xpReward: 10,  dueDate: todayISO(),      status: 'completed', category: 'Griha' },
  { id: '8', title: 'Write blog post on Yoga benefits',   difficulty: 'medium',    xpReward: 25,  dueDate: offsetISO(-1),   status: 'completed', category: 'Creative' },
];

export const defaultNotes: Note[] = [
  { id: '1', title: 'React Chakra Patterns',    content: 'Compound components, render props, custom hooks – master these like Arjuna mastered the bow.', tags: ['React', 'Code'],       color: '#6366F1', createdAt: '2 hours ago', emoji: '⚛️' },
  { id: '2', title: 'Weekly Sankalp Plan',      content: 'Ship feature X, review PRs, plan sprint. Each task a step on the path of Dharma.',              tags: ['Planning', 'Karma'],   color: '#0EA5E9', createdAt: '5 hours ago', emoji: '🎯' },
  { id: '3', title: 'Creative Ideas Vault',     content: 'AI-powered habit tracker, gamified reading app, micro-journaling with raga-based moods.',        tags: ['Ideas', 'Creative'],   color: '#8B5CF6', createdAt: '1 day ago',   emoji: '💡' },
  { id: '4', title: 'Sprint Review Notes',      content: 'Team velocity up 15%, address tech debt. Demo went as smooth as a Kathak performance!',         tags: ['Meeting', 'Karma'],    color: '#EC4899', createdAt: '2 days ago',  emoji: '📋' },
  { id: '5', title: 'Gita Wisdom Notes',        content: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन – Focus on actions, not on the fruits of actions.',          tags: ['Wisdom', 'Vidya'],     color: '#F59E0B', createdAt: '3 days ago',  emoji: '🕉️' },
  { id: '6', title: 'Yoga & Wellness Log',      content: 'Surya Namaskar, Pranayama, Dhyana. Balance mind-body like the perfect Nataraja pose.',          tags: ['Yoga', 'Wellness'],    color: '#10B981', createdAt: '4 days ago',  emoji: '🧘' },
];

export const defaultAchievements: Achievement[] = [
  { id: '1',  title: "Arjuna's First Arrow",   description: 'Complete your first karma quest',     icon: '🏹', unlocked: true,  xpRequired: 0,    rarity: 'common'    },
  { id: '2',  title: "Hanuman's Devotion",      description: 'Reach a 3-day tapasya streak',        icon: '🪔', unlocked: true,  xpRequired: 50,   rarity: 'common'    },
  { id: '3',  title: "Saraswati's Blessing",   description: 'Create 5 vidya scrolls',              icon: '🪷', unlocked: true,  xpRequired: 100,  rarity: 'rare'      },
  { id: '4',  title: 'Karma Yogi',              description: 'Complete 10 quests',                  icon: '🕉️', unlocked: true,  xpRequired: 200,  rarity: 'rare'      },
  { id: '5',  title: "Durga's Shield",          description: 'Complete a Kathin quest',             icon: '🛡️', unlocked: true,  xpRequired: 300,  rarity: 'epic'      },
  { id: '6',  title: "Vayu's Speed",            description: 'Complete 5 quests in one day',        icon: '💨', unlocked: false, xpRequired: 400,  rarity: 'epic'      },
  { id: '7',  title: 'Chakravarti',             description: 'Reach Level 10',                      icon: '👑', unlocked: false, xpRequired: 500,  rarity: 'legendary' },
  { id: '8',  title: 'Vidya Guru',              description: 'Create 20 knowledge scrolls',         icon: '📿', unlocked: false, xpRequired: 600,  rarity: 'legendary' },
  { id: '9',  title: 'Tapasvi Supreme',         description: '30-day tapasya streak',               icon: '💎', unlocked: false, xpRequired: 800,  rarity: 'legendary' },
  { id: '10', title: 'Moksha',                  description: 'Unlock all achievements',             icon: '✨', unlocked: false, xpRequired: 1000, rarity: 'legendary' },
  { id: '11', title: 'Brahma Muhurta',          description: 'Complete quest before dawn',          icon: '🌅', unlocked: false, xpRequired: 150,  rarity: 'rare'      },
  { id: '12', title: 'Chandra Dev',             description: 'Create a scroll after midnight',      icon: '🌙', unlocked: false, xpRequired: 250,  rarity: 'rare'      },
];

export const motivationalQuotes = [
  "कर्मण्येवाधिकारस्ते – Focus on your Karma! 🙏",
  "Your Tapasya streak is your superpower!",
  "Level up like Arjuna mastered the bow! 🏹",
  "Every quest is a step on the path of Dharma!",
  "Vidya scrolls make you wiser! 📜",
  "Today's Karma is tomorrow's Punya!",
  "You walk the path of greatness, Yoddha!",
  "Consistency is the ultimate Sadhana!",
];

export const noteColors = ['#6366F1', '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#F43F5E', '#06B6D4'];
