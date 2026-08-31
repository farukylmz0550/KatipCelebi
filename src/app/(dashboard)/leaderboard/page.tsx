import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { levelForXp } from "@/lib/gamification";

export default async function LeaderboardPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();

  const users = await db.user.findMany({
    select: { id: true, name: true, xp: true },
    orderBy: { xp: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.leaderboard.title}</h1>
      <table className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-left text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <thead className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          <tr>
            <th className="px-3 py-2">{dict.leaderboard.rank}</th>
            <th className="px-3 py-2">{dict.leaderboard.name}</th>
            <th className="px-3 py-2">{dict.leaderboard.level}</th>
            <th className="px-3 py-2">{dict.leaderboard.xp}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user.id} className={user.id === userId ? "bg-[#cde2fb]/40 dark:bg-[#184f95]/30" : ""}>
              <td className="px-3 py-2 tabular-nums">{i + 1}</td>
              <td className="px-3 py-2">{user.name}</td>
              <td className="px-3 py-2 tabular-nums">{levelForXp(user.xp)}</td>
              <td className="px-3 py-2 tabular-nums">{user.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
