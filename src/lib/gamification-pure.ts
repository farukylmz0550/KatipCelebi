export const XP_REWARDS = {
  BOOK_ADDED: 5,
  BOOK_FINISHED_BASE: 50,
  PAGES_PER_10: 3,
  LENDING_CREATED: 5,
} as const;

/**
 * Configurable XP parameters (v2.7.0) — resolved from AppSettings/env at
 * runtime; every parameter defaults to the legacy XP_REWARDS value so the
 * default behavior is byte-for-byte unchanged.
 */
export type XpConfig = {
  bookFinishedBase: number;
  pagesPer10: number;
  /** Base XP of the Fibonacci level curve (legacy: 100). */
  perLevelBase: number;
};

export const DEFAULT_XP_CONFIG: XpConfig = {
  bookFinishedBase: XP_REWARDS.BOOK_FINISHED_BASE,
  pagesPer10: XP_REWARDS.PAGES_PER_10,
  perLevelBase: 100,
};

function fibonacci(n: number): number {
  if (n <= 1) return 1;
  let a = 1,
    b = 1;
  for (let i = 2; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/** XP required to advance FROM the given level to the next. */
export function xpForNextLevel(currentLevel: number, base: number = DEFAULT_XP_CONFIG.perLevelBase): number {
  return base * fibonacci(currentLevel);
}

/** Total XP accumulated to reach the given level from level 1. */
function totalXpForLevel(level: number, base: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForNextLevel(i, base);
  }
  return total;
}

/** Level derived from total XP. Pure function — level is derived, never stored. */
export function levelForXp(xp: number, base: number = DEFAULT_XP_CONFIG.perLevelBase): number {
  let level = 1;
  let total = 0;
  while (total + xpForNextLevel(level, base) <= xp) {
    total += xpForNextLevel(level, base);
    level++;
  }
  return level;
}

/** XP progress within the current level. */
export function levelProgress(xp: number, base: number = DEFAULT_XP_CONFIG.perLevelBase) {
  const level = levelForXp(xp, base);
  const currentFloor = totalXpForLevel(level, base);
  const nextFloor = currentFloor + xpForNextLevel(level, base);
  return {
    level,
    currentFloor,
    nextFloor,
    xpForNext: xpForNextLevel(level, base),
    progress: nextFloor === currentFloor ? 0 : (xp - currentFloor) / (nextFloor - currentFloor),
  };
}

/** Streak multiplier for XP bonus. */
export function streakMultiplier(streak: number): number {
  if (streak >= 100) return 2.0;
  if (streak >= 60) return 1.5;
  if (streak >= 30) return 1.3;
  if (streak >= 14) return 1.2;
  if (streak >= 7) return 1.1;
  return 1.0;
}

/** Calculate XP for finishing a book (config from AppSettings; defaults legacy). */
export function calculateFinishXp(
  pages: number | null | undefined,
  streak: number,
  config: XpConfig = DEFAULT_XP_CONFIG,
): number {
  let xp = config.bookFinishedBase;
  if (pages && pages > 0) {
    xp += Math.floor(pages / 10) * config.pagesPer10;
  }
  return Math.floor(xp * streakMultiplier(streak));
}

/** Streak protection shield cost — exponential. */
export function shieldCost(shieldCount: number): number {
  return 100 * Math.pow(2, shieldCount);
}

type AchievementStats = {
  booksAdded: number;
  booksFinished: number;
  lendingsCreated: number;
  distinctAuthors: number;
  currentStreak: number;
  longestStreak: number;
};

type AchievementRule = {
  key: string;
  isUnlocked: (stats: AchievementStats) => boolean;
};

/** Achievement catalog: each rule is a single, testable predicate over stats. */
export const ACHIEVEMENT_RULES: AchievementRule[] = [
  { key: "first_book", isUnlocked: (s) => s.booksAdded >= 1 },
  { key: "first_finish", isUnlocked: (s) => s.booksFinished >= 1 },
  { key: "ten_finished", isUnlocked: (s) => s.booksFinished >= 10 },
  { key: "first_lending", isUnlocked: (s) => s.lendingsCreated >= 1 },
  { key: "five_authors", isUnlocked: (s) => s.distinctAuthors >= 5 },
  { key: "week_streak", isUnlocked: (s) => s.currentStreak >= 7 || s.longestStreak >= 7 },
  { key: "month_streak", isUnlocked: (s) => s.currentStreak >= 30 || s.longestStreak >= 30 },
  { key: "century_streak", isUnlocked: (s) => s.longestStreak >= 100 },
];

/** Pure: which achievement keys should be unlocked for a given stats snapshot. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENT_RULES.filter((rule) => rule.isUnlocked(stats)).map((rule) => rule.key);
}
