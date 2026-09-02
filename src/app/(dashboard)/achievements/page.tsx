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
    <div>
      <div className="mb-8">
        <p className="editorial-label mb-2">Milestones</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {dict.achievements.title}
        </h1>
        <div className="editorial-rule-accent mt-4" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {all.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const labels = dict.achievements as Record<string, string>;
          return (
            <div
              key={achievement.id}
              className={`relative border p-5 transition-colors ${
                isUnlocked
                  ? "border-foreground/20 bg-foreground/[0.03]"
                  : "border-border opacity-50"
              }`}
            >
              {isUnlocked && (
                <div className="absolute right-3 top-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Unlocked
                </div>
              )}
              <p className="text-lg font-bold">{labels[`${achievement.key}_title`]}</p>
              <p className="mt-1 text-sm text-muted-foreground">{labels[`${achievement.key}_desc`]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
