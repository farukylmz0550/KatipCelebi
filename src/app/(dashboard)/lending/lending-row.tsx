"use client";

import { useTransition } from "react";
import { returnLending } from "@/app/actions/lending";

type Lending = {
  id: string;
  borrowerName: string;
  lentAt: Date;
  returnedAt: Date | null;
  book: { title: string };
};

export function LendingRow({ record, dict }: { record: Lending; dict: { returned: string; markReturned: string } }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between border-b border-border last:border-b-0 px-4 py-3 transition-colors hover:bg-accent/50">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{record.book.title}</p>
        <p className="text-xs text-muted-foreground">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
          {dict.returned}
        </span>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
          className="rounded-lg bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {dict.markReturned}
        </button>
      )}
    </div>
  );
}
