import { db } from "@/lib/db";
import { shieldCost as calcShieldCost } from "./gamification-pure";

/** Calculate current and longest streak from daily activities. */
export function calculateStreak(
  activities: { date: Date; count: number }[]
): { current: number; longest: number } {
  if (activities.length === 0) return { current: 0, longest: 0 };

  const sorted = [...activities].sort((a, b) => b.date.getTime() - a.date.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestDate = new Date(sorted[0].date);
  latestDate.setHours(0, 0, 0, 0);

  // Streak is only valid if latest activity is today or yesterday
  if (latestDate.getTime() < yesterday.getTime()) {
    return { current: 0, longest: computeLongest(sorted) };
  }

  let current = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i].date);
    const prev = new Date(sorted[i + 1].date);
    curr.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);

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
    const curr = new Date(sorted[i].date);
    const prev = new Date(sorted[i + 1].date);
    curr.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return activities.some((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}

/** Check if streak is broken (no activity yesterday or today). */
export function isStreakBroken(lastActiveDate: Date | null): boolean {
  if (!lastActiveDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastActiveDate);
  last.setHours(0, 0, 0, 0);
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
