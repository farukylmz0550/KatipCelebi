"use client";

import { useState, useTransition } from "react";
import { Target } from "lucide-react";
import { setYearlyGoal, setMonthlyGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Dict = {
  yearlyGoal: string;
  monthlyGoal: string;
  goalTarget: string;
  setGoal: string;
};

export function GoalForms({ dict, yearly, monthly }: { dict: Dict; yearly: number; monthly: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <GoalForm label={dict.yearlyGoal} initial={yearly} action={setYearlyGoal} dict={dict} />
      <GoalForm label={dict.monthlyGoal} initial={monthly} action={setMonthlyGoal} dict={dict} />
    </div>
  );
}

function GoalForm({
  label,
  initial,
  action,
  dict,
}: {
  label: string;
  initial: number;
  action: (n: number) => Promise<void>;
  dict: Dict;
}) {
  const [value, setValue] = useState(String(initial));
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Math.max(0, Math.min(999, parseInt(value || "0", 10)));
    startTransition(async () => {
      await action(n);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex-1 space-y-1">
        <Label className="flex items-center gap-1.5">
          <Target size={14} className="text-muted-foreground" />
          {label}
        </Label>
        <Input
          type="number"
          min={0}
          max={999}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={dict.goalTarget}
        />
      </div>
      <Button type="submit" disabled={pending} size="sm">
        {dict.setGoal}
      </Button>
    </form>
  );
}
