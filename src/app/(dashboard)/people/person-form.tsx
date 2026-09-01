"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPerson, removePerson } from "@/app/actions/people";

export function PersonForm({ placeholder, addLabel, removeLabel, selectedId }: { placeholder: string; addLabel: string; removeLabel: string; selectedId?: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPerson(name);
      if (res.error) setError(res.error);
      else {
        setName("");
        router.refresh();
      }
    });
  }

  function onRemove() {
    if (!selectedId) return;
    setError(null);
    startTransition(async () => {
      const res = await removePerson(selectedId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button type="submit" disabled={pending} className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">
          {addLabel}
        </button>
        <button type="button" onClick={onRemove} disabled={pending || !selectedId} className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-neutral-700">
          {removeLabel}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
