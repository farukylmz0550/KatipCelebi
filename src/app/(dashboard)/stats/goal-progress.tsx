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
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-card-foreground">{label}</p>
        <span className="text-xs text-muted-foreground">
          {target === 0 ? noGoalLabel : `${done} / ${target} ${isReached ? `· ${reachedLabel}` : ""}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
          aria-label={progressLabel}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {target === 0 ? noGoalLabel : `${pct.toFixed(0)}% ${progressLabel}`}
      </p>
    </div>
  );
}
