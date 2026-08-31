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
      <h1 className="text-2xl font-semibold">{dict.achievements.title}</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {all.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const labels = dict.achievements as Record<string, string>;
          return (
            <li
              key={achievement.id}
              className={`rounded-lg border p-4 ${isUnlocked ? "border-[#2a78d6] bg-white" : "border-neutral-200 bg-neutral-100 opacity-60"}`}
            >
              <p className="font-medium">{labels[`${achievement.key}_title`]}</p>
              <p className="text-sm text-neutral-500">{labels[`${achievement.key}_desc`]}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
