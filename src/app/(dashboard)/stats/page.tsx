import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { levelProgress } from "@/lib/gamification";
import { monthlyFinishCounts } from "@/lib/stats";
import { StatTile } from "./stat-tile";
import { MonthlyChart } from "./monthly-chart";

export default async function StatsPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();

  const [user, totalBooks, reading, finishedBooks] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
    db.book.count({ where: { userId } }),
    db.book.count({ where: { userId, status: "READING" } }),
    db.book.findMany({ where: { userId, status: "FINISHED", finishedAt: { not: null } }, select: { finishedAt: true } }),
  ]);

  const { level } = levelProgress(user.xp);
  const chartData = monthlyFinishCounts(finishedBooks.map((b) => b.finishedAt as Date));

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
      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-600">{dict.stats.byMonth}</h2>
        <MonthlyChart data={chartData} label={dict.stats.finished} />
      </div>
    </div>
  );
}
