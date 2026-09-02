import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { Medal } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Medal size={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.leaderboard.title}</h1>
      </div>
      <LeaderboardTable users={users} currentUserId={userId} dict={dict.leaderboard} />
    </div>
  );
}
