"use client";

import { useState, useTransition } from "react";
import { setYearlyGoal, setMonthlyGoal } from "@/app/actions/goals";

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
    <form onSubmit={onSubmit} className="flex items-end gap-2 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
        <input
          type="number"
          min={0}
          max={999}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={dict.goalTarget}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {dict.setGoal}
      </button>
    </form>
  );
}
