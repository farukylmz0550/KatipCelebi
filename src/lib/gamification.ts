import { db } from "@/lib/db";

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

export async function awardXp(userId: string, amount: number) {
  return db.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
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

async function collectAchievementStats(userId: string): Promise<AchievementStats> {
  const [booksAdded, booksFinished, lendingsCreated, authors] = await Promise.all([
    db.book.count({ where: { userId } }),
    db.book.count({ where: { userId, status: "FINISHED" } }),
    db.lendingRecord.count({ where: { book: { userId } } }),
    db.book.findMany({ where: { userId, author: { not: null } }, select: { author: true }, distinct: ["author"] }),
  ]);
  return { booksAdded, booksFinished, lendingsCreated, distinctAuthors: authors.length };
}

/** Recomputes achievement stats for a user and persists any newly unlocked ones. */
export async function syncAchievements(userId: string): Promise<string[]> {
  const stats = await collectAchievementStats(userId);
  const unlockedKeys = evaluateAchievements(stats);
  if (unlockedKeys.length === 0) return [];

  const achievements = await db.achievement.findMany({ where: { key: { in: unlockedKeys } } });
  const alreadyUnlocked = await db.userAchievement.findMany({
    where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
    select: { achievementId: true },
  });
  const alreadyUnlockedIds = new Set(alreadyUnlocked.map((a) => a.achievementId));
  const toUnlock = achievements.filter((a) => !alreadyUnlockedIds.has(a.id));
  if (toUnlock.length === 0) return [];

  await db.userAchievement.createMany({
    data: toUnlock.map((a) => ({ userId, achievementId: a.id })),
  });
  return toUnlock.map((a) => a.key);
}
