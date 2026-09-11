import { db } from "@/lib/db";
import { shieldCost as calcShieldCost } from "./gamification-pure";

/** Start of the current UTC day — day boundaries are timezone-independent (UTC). */
export function startOfUtcDay(date: Date = new Date()): Date {
  const d = new Date(date.getTime() - date.getUTCMilliseconds());
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Calculate current and longest streak from daily activities. */
export function calculateStreak(activities: { date: Date; count: number }[]): { current: number; longest: number } {
  if (activities.length === 0) return { current: 0, longest: 0 };

  const sorted = [...activities].sort((a, b) => b.date.getTime() - a.date.getTime());

  const today = startOfUtcDay();

  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const latestDate = startOfUtcDay(sorted[0].date);

  // Streak is only valid if latest activity is today or yesterday
  if (latestDate.getTime() < yesterday.getTime()) {
    return { current: 0, longest: computeLongest(sorted) };
  }

  let current = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = startOfUtcDay(sorted[i].date);
    const prev = startOfUtcDay(sorted[i + 1].date);

    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(current, computeLongest(sorted)) };
}

function computeLongest(sorted: { date: Date; count: number }[]): number {
  if (sorted.length === 0) return 0;
  let longest = 1;
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = startOfUtcDay(sorted[i].date);
    const prev = startOfUtcDay(sorted[i + 1].date);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else if (diffDays > 1) {
      streak = 1;
    }
  }
  return longest;
}

/** Check if the user has activity today. */
export function isTodayActive(activities: { date: Date }[]): boolean {
  const today = startOfUtcDay();
  return activities.some((a) => startOfUtcDay(a.date).getTime() === today.getTime());
}

/** Check if streak is broken (no activity yesterday or today). */
export function isStreakBroken(lastActiveDate: Date | null): boolean {
  if (!lastActiveDate) return true;
  const today = startOfUtcDay();
  const last = startOfUtcDay(lastActiveDate);
  const diffDays = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 1;
}

/** Get streak info for a user. */
export async function getStreakInfo(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true, streakShieldCount: true, xp: true },
  });
  if (!user) return null;

  const today = startOfUtcDay();

  const todayActivity = await db.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const cost = calcShieldCost(user.streakShieldCount);
  const canAfford = user.xp >= cost;
  const canUseShield = !todayActivity && user.currentStreak > 0 && canAfford;

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    isTodayActive: !!todayActivity,
    shieldCount: user.streakShieldCount,
    shieldCost: cost,
    canUseShield,
    xp: user.xp,
  };
}
