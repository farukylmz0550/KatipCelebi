import { fraction, reached, yearlyGoal, monthlyGoal } from "@/lib/goals";

type Props = {
  label: string;
  target: number;
  done: number;
  noGoalLabel: string;
  reachedLabel: string;
  progressLabel: string;
};

export function GoalProgress({ label, target, done, noGoalLabel, reachedLabel, progressLabel }: Props) {
  const g = target === 0 ? null : label.includes("Year") || label.includes("Yıllık") ? yearlyGoal(target, done) : monthlyGoal(target, done);
  const pct = g ? fraction(g) * 100 : 0;
  const isReached = g ? reached(g) : false;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</p>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {target === 0 ? noGoalLabel : `${done} / ${target} ${isReached ? `· ${reachedLabel}` : ""}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded bg-neutral-900 transition-all dark:bg-white"
          style={{ width: `${pct}%` }}
          aria-label={progressLabel}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        {target === 0 ? noGoalLabel : `${pct.toFixed(0)}% ${progressLabel}`}
      </p>
    </div>
  );
}
