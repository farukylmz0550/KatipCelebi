import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";

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
      <h1 className="text-xl font-medium text-foreground">{dict.achievements.title}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {all.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const labels = dict.achievements as Record<string, string>;
          return (
            <div
              key={achievement.id}
              className={`rounded-xl border p-4 transition-colors ${
                isUnlocked
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-foreground">{labels[`${achievement.key}_title`]}</p>
                {isUnlocked && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{labels[`${achievement.key}_desc`]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
