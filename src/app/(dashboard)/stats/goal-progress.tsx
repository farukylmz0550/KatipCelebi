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
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="text-xs text-muted-foreground">
          {target === 0 ? noGoalLabel : `${done} / ${target}`}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden bg-muted">
        <div
          className="h-full bg-foreground transition-all"
          style={{ width: `${pct}%` }}
          aria-label={progressLabel}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {target === 0 ? noGoalLabel : `${pct.toFixed(0)}% ${isReached ? `· ${reachedLabel}` : progressLabel}`}
      </p>
    </div>
  );
}
