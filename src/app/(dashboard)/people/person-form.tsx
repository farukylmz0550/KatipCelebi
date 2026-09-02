"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus } from "lucide-react";
import { createPerson, removePerson } from "@/app/actions/people";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          <UserPlus size={14} />
          {addLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onRemove} disabled={pending || !selectedId}>
          <UserMinus size={14} />
          {removeLabel}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
