import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTheme } from "@/lib/theme";
import { levelProgress } from "@/lib/gamification";
import { monthlyFinishCounts } from "@/lib/stats";
import { finishedInMonth, finishedInYear } from "@/lib/goals";
import { StatTile } from "./stat-tile";
import { MonthlyChart } from "./monthly-chart";
import { GoalProgress } from "./goal-progress";
import { GoalForms } from "./goal-forms";

export default async function StatsPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();
  const theme = await getTheme();

  const [user, totalBooks, reading, finishedBooks, goal] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
    db.book.count({ where: { userId } }),
    db.book.count({ where: { userId, status: "READING" } }),
    db.book.findMany({ where: { userId, status: "FINISHED", finishedAt: { not: null } }, select: { finishedAt: true } }),
    db.goal.findUnique({ where: { userId } }),
  ]);

  const yearly = goal?.yearly ?? 0;
  const monthly = goal?.monthly ?? 0;
  const finishedDates = finishedBooks.map((b) => b.finishedAt as Date);
  const now = new Date();
  const doneYear = finishedInYear(finishedDates, now.getFullYear());
  const doneMonth = finishedInMonth(finishedDates, now.getFullYear(), now.getMonth());

  const { level } = levelProgress(user.xp);
  const chartData = monthlyFinishCounts(finishedDates);

  // Average days to finish (from startedAt/finishedAt where available)
  const booksWithDuration = await db.book.findMany({
    where: { userId, status: "FINISHED", startedAt: { not: null }, finishedAt: { not: null } },
    select: { startedAt: true, finishedAt: true },
  });
  const avgDays =
    booksWithDuration.length > 0
      ? (
          booksWithDuration.reduce((acc, b) => {
            const s = b.startedAt as Date;
            const f = b.finishedAt as Date;
            const d = (f.getTime() - s.getTime()) / 86400000;
            return acc + (d >= 0 ? d : 0);
          }, 0) / booksWithDuration.length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.stats.title}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label={dict.stats.totalBooks} value={totalBooks} />
        <StatTile label={dict.stats.finished} value={finishedBooks.length} />
        <StatTile label={dict.stats.reading} value={reading} />
        <StatTile label={dict.stats.level} value={level} />
        <StatTile label={dict.stats.xp} value={user.xp} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label={dict.stats.averageDays} value={avgDays} />
        <StatTile label={dict.stats.totalFinished} value={finishedBooks.length} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <GoalProgress
          label={dict.stats.yearlyGoal}
          target={yearly}
          done={doneYear}
          noGoalLabel={dict.stats.noGoal}
          reachedLabel={dict.stats.reached}
          progressLabel={dict.stats.progress}
        />
        <GoalProgress
          label={dict.stats.monthlyGoal}
          target={monthly}
          done={doneMonth}
          noGoalLabel={dict.stats.noGoal}
          reachedLabel={dict.stats.reached}
          progressLabel={dict.stats.progress}
        />
      </div>
      <GoalForms dict={{ yearlyGoal: dict.stats.yearlyGoal, monthlyGoal: dict.stats.monthlyGoal, goalTarget: dict.stats.goalTarget, setGoal: dict.stats.setGoal }} yearly={yearly} monthly={monthly} />
      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">{dict.stats.byMonth}</h2>
        <MonthlyChart data={chartData} label={dict.stats.finished} dark={theme === "dark"} />
      </div>
    </div>
  );
}
