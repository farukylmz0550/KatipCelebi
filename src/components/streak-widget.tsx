"use client";

import { useTransition, useCallback } from "react";
import { Flame, Shield } from "lucide-react";
import { hapticFeedback } from "@/lib/haptic";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  isTodayActive: boolean;
  shieldCost: number;
  canUseShield: boolean;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
  isTodayActive,
  shieldCost,
  canUseShield,
}: StreakWidgetProps) {
  const [isPending, startTransition] = useTransition();

  const handleUseShield = useCallback(() => {
    if (!confirm("Streak koruması kullanılsın mı?")) return;
    hapticFeedback("heavy");
    startTransition(async () => {
      const mod = await import("@/app/actions/streak");
      await mod.useStreakShield();
    });
  }, []);

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame
            size={28}
            className={currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}
            fill={currentStreak > 0 ? "currentColor" : "none"}
          />
          <div>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">gün streak</div>
          </div>
        </div>
        {longestStreak > 0 && (
          <div className="text-right text-xs text-muted-foreground">
            En uzun: <span className="font-medium text-foreground">{longestStreak}</span>
          </div>
        )}
      </div>

      {/* This week mini calendar */}
      <div className="mt-3 flex gap-1">
        {weekDays.map((day, i) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className={`h-6 w-6 rounded-full text-[10px] font-medium flex items-center justify-center ${
                i === todayIndex
                  ? isTodayActive
                    ? "bg-orange-500 text-white"
                    : "border border-orange-500 text-orange-500"
                    : i < todayIndex
                      ? "bg-muted text-muted-foreground"
                      : "bg-transparent text-muted-foreground/50"
              }`}
            >
              {day[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-3 text-center text-xs">
        {isTodayActive ? (
          <span className="text-green-600 dark:text-green-400 font-medium">Bugün okundu!</span>
        ) : (
          <span className="text-orange-500">Bugün henüz okunmadı</span>
        )}
      </div>

      {/* Shield */}
      {canUseShield && (
        <button
          onClick={handleUseShield}
          disabled={isPending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
        >
          <Shield size={14} />
          Streak Koruması Kullan ({shieldCost} XP)
        </button>
      )}
    </div>
  );
}
