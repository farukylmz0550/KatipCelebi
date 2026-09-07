export const XP_REWARDS = {
  BOOK_ADDED: 5,
  BOOK_FINISHED: 50,
  LENDING_CREATED: 5,
} as const;

/** Level from total XP. Pure function — level is derived, never stored. */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

/** XP required to reach the given level, and how far into it the user is. */
export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const xpForLevel = (lvl: number) => 50 * (lvl - 1) ** 2;
  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  return {
    level,
    currentFloor,
    nextFloor,
    progress: (xp - currentFloor) / (nextFloor - currentFloor),
  };
}

type AchievementStats = {
  booksAdded: number;
  booksFinished: number;
  lendingsCreated: number;
  distinctAuthors: number;
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
];

/** Pure: which achievement keys should be unlocked for a given stats snapshot. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return ACHIEVEMENT_RULES.filter((rule) => rule.isUnlocked(stats)).map((rule) => rule.key);
}
