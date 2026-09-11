// Goal-progress push notifications (v2.7.0) — pure calendar rules.
//
// Schedule (server-local clock; the cron calls the endpoint daily and the
// server decides the message for that day — no catch-up for missed days):
//   day 1          → "New month started. Your reading goal this month is N books."
//   day 10 / 20    → "You read C books this month. You're at P% of your goal."
//   last 3 days    → "R books left to your goal." (only while R > 0)
//
// Mute rule (user decision, rule A): once the monthly goal is reached
// (books >= target), the interim progress and final notifications are silenced.

export type GoalProgressNotification =
  | { kind: "month-start"; target: number }
  | { kind: "progress"; count: number; percent: number }
  | { kind: "final"; remaining: number };

export function goalProgressNotification(
  now: Date,
  monthlyTarget: number,
  booksThisMonth: number,
): GoalProgressNotification | null {
  if (monthlyTarget <= 0) return null;
  const day = now.getDate();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (day === 1) return { kind: "month-start", target: monthlyTarget };

  // Rule A — goal reached: all interim notifications are silenced.
  if (booksThisMonth >= monthlyTarget) return null;

  if (day >= lastDay - 2) {
    const remaining = monthlyTarget - booksThisMonth;
    if (remaining > 0) return { kind: "final", remaining };
    return null;
  }

  if (day === 10 || day === 20) {
    const percent = Math.round((booksThisMonth / monthlyTarget) * 100);
    return { kind: "progress", count: booksThisMonth, percent };
  }

  return null;
}
