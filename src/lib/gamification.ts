import { db } from "@/lib/db";

export {
  XP_REWARDS,
  levelForXp,
  levelProgress,
  evaluateAchievements,
  ACHIEVEMENT_RULES,
  streakMultiplier,
  calculateFinishXp,
  shieldCost,
  xpForNextLevel,
} from "./gamification-pure";

export async function awardXp(userId: string, amount: number) {
  return db.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
}

async function collectAchievementStats(userId: string) {
  const [booksAdded, booksFinished, lendingsCreated, authors, user] = await Promise.all([
    db.book.count({ where: { userId } }),
    db.book.count({ where: { userId, status: "FINISHED" } }),
    db.lendingRecord.count({ where: { book: { userId } } }),
    db.book.findMany({ where: { userId, author: { not: null } }, select: { author: true }, distinct: ["author"] }),
    db.user.findUnique({ where: { id: userId }, select: { currentStreak: true, longestStreak: true } }),
  ]);
  return {
    booksAdded,
    booksFinished,
    lendingsCreated,
    distinctAuthors: authors.length,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
  };
}

/** Recomputes achievement stats for a user and persists any newly unlocked ones. */
export async function syncAchievements(userId: string): Promise<string[]> {
  const stats = await collectAchievementStats(userId);
  const { evaluateAchievements } = await import("./gamification-pure");
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
