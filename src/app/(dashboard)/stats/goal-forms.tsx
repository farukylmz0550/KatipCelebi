"use client";

import { useState, useTransition } from "react";
import { Lock, Target } from "lucide-react";
import { confirmGoals } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Dict = {
  yearlyGoal: string;
  monthlyGoal: string;
  goalTarget: string;
  setGoal: string;
  goalLocked: string;
  goalLockedDesc: string;
  goalSaveError: string;
  goalConfirm: string;
};

/**
 * v2.7.0 — yearly + monthly targets are entered once per year and confirmed;
 * they stay locked until Jan 1 of the next year (server-local clock).
 * Unlocked forms prefill the previous year's targets (user decision).
 */
export function GoalForms({
  dict,
  yearly,
  monthly,
  locked,
}: {
  dict: Dict;
  yearly: number;
  monthly: number;
  locked: boolean;
}) {
  if (locked) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: dict.yearlyGoal, value: yearly },
          { label: dict.monthlyGoal, value: monthly },
        ].map((cell) => (
          <div
            key={cell.label}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock size={14} />
              <span>{cell.label}</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">{cell.value}</p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground sm:col-span-2">{dict.goalLockedDesc}</p>
      </div>
    );
  }
  return <GoalInputs dict={dict} yearly={yearly} monthly={monthly} />;
}

function GoalInputs({ dict, yearly, monthly }: { dict: Dict; yearly: number; monthly: number }) {
  const [yearlyValue, setYearlyValue] = useState(String(yearly));
  const [monthlyValue, setMonthlyValue] = useState(String(monthly));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = Math.max(0, Math.min(999, parseInt(yearlyValue || "0", 10)));
    const m = Math.max(0, Math.min(999, parseInt(monthlyValue || "0", 10)));
    startTransition(async () => {
      const res = await confirmGoals(y, m);
      if (!res.ok) setError(dict.goalSaveError);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex-1 space-y-1">
          <Label className="flex items-center gap-1.5">
            <Target size={14} className="text-muted-foreground" />
            {dict.yearlyGoal}
          </Label>
          <Input
            type="number"
            min={0}
            max={999}
            value={yearlyValue}
            onChange={(e) => setYearlyValue(e.target.value)}
            placeholder={dict.goalTarget}
          />
        </div>
      </div>
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex-1 space-y-1">
          <Label className="flex items-center gap-1.5">
            <Target size={14} className="text-muted-foreground" />
            {dict.monthlyGoal}
          </Label>
          <Input
            type="number"
            min={0}
            max={999}
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(e.target.value)}
            placeholder={dict.goalTarget}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} size="sm">
          {dict.goalConfirm}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{dict.goalLocked}</p>
      </div>
    </form>
  );
}
