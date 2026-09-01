// Pure Goal logic — legacy stats/goals.py + stats/summary.py Goal port.
// Single responsibility: goal math.

export type Goal = {
  target: number;
  done: number;
};

export function goal(target: number, done: number): Goal {
  return { target: Math.max(0, Math.floor(target)), done: Math.max(0, done) };
}

export function reached(g: Goal): boolean {
  return g.target > 0 && g.done >= g.target;
}

export function fraction(g: Goal): number {
  if (g.target <= 0) return 0;
  return Math.min(1, g.done / g.target);
}

export function yearlyGoal(target: number, finishedThisYear: number): Goal {
  return goal(target, finishedThisYear);
}

export function monthlyGoal(target: number, finishedThisMonth: number): Goal {
  return goal(target, finishedThisMonth);
}

// Stats helpers for goal done counts
export function finishedInYear(finishedAt: Date[], year: number): number {
  return finishedAt.filter((d) => d.getFullYear() === year).length;
}

export function finishedInMonth(finishedAt: Date[], year: number, month: number): number {
  return finishedAt.filter((d) => d.getFullYear() === year && d.getMonth() === month).length;
}
