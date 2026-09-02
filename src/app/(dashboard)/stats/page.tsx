import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTheme } from "@/lib/theme";
import { levelProgress } from "@/lib/gamification";
import { monthlyFinishCounts } from "@/lib/stats";
import { finishedInMonth, finishedInYear } from "@/lib/goals";
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
    <div>
      <div className="mb-8">
        <p className="editorial-label mb-2">Reading</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {dict.stats.title}
        </h1>
        <div className="editorial-rule-accent mt-4" />
      </div>

      <div className="grid grid-cols-3 gap-8 border-b border-border pb-8 sm:grid-cols-6">
        <div>
          <p className="editorial-label">Total</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{totalBooks}</p>
        </div>
        <div>
          <p className="editorial-label">Finished</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{finishedBooks.length}</p>
        </div>
        <div>
          <p className="editorial-label">Reading</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{reading}</p>
        </div>
        <div>
          <p className="editorial-label">Level</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{level}</p>
        </div>
        <div>
          <p className="editorial-label">XP</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{user.xp}</p>
        </div>
        <div>
          <p className="editorial-label">Avg. Days</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{avgDays}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
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

      <div className="mt-6">
        <GoalForms dict={{ yearlyGoal: dict.stats.yearlyGoal, monthlyGoal: dict.stats.monthlyGoal, goalTarget: dict.stats.goalTarget, setGoal: dict.stats.setGoal }} yearly={yearly} monthly={monthly} />
      </div>

      <div className="mt-8">
        <p className="editorial-label mb-4">{dict.stats.byMonth}</p>
        <div className="border border-border p-4">
          <MonthlyChart data={chartData} label={dict.stats.finished} dark={theme === "dark"} />
        </div>
      </div>
    </div>
  );
}
