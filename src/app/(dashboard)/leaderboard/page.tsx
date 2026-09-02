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
    <div>
      <div className="mb-8">
        <p className="editorial-label mb-2">Rankings</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {dict.leaderboard.title}
        </h1>
        <div className="editorial-rule-accent mt-4" />
      </div>
      <LeaderboardTable users={users} currentUserId={userId} dict={dict.leaderboard} />
    </div>
  );
}
