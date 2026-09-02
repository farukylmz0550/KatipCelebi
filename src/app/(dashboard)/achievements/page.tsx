import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";

export default async function AchievementsPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();

  const [all, unlocked] = await Promise.all([
    db.achievement.findMany({ orderBy: { key: "asc" } }),
    db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy size={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.achievements.title}</h1>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {all.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const labels = dict.achievements as Record<string, string>;
          return (
            <li
              key={achievement.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                isUnlocked
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/50 opacity-60"
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={18} />}
              </div>
              <div>
                <p className="font-medium">{labels[`${achievement.key}_title`]}</p>
                <p className="text-sm text-muted-foreground">{labels[`${achievement.key}_desc`]}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
