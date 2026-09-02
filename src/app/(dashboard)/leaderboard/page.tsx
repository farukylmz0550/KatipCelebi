import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { LeaderboardTable } from "./leaderboard-table";

export default async function LeaderboardPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();

  const users = await db.user.findMany({
    select: { id: true, name: true, xp: true },
    orderBy: { xp: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.leaderboard.title}</h1>
      <LeaderboardTable users={users} currentUserId={userId} dict={dict.leaderboard} />
    </div>
  );
}
