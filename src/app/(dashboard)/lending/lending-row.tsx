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
    <div className="flex items-center justify-between border-b border-[var(--border)] last:border-b-0 px-4 py-3 transition-colors hover:bg-[var(--surface-elevated)]">
      <div className="min-w-0 flex-1">
        <p className="font-[var(--font-serif)] text-sm font-medium leading-tight text-foreground truncate">
          {record.book.title}
        </p>
        <p className="font-[var(--font-sans)] text-xs text-muted-foreground">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <span className="rounded-full bg-[var(--success-soft)] border border-[var(--border)] px-2.5 py-0.5 font-[var(--font-sans)] text-[10px] font-medium text-[var(--success-text)]">
          {dict.returned}
        </span>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
          className="rounded-[8px] bg-[var(--accent)] px-3.5 py-1.5 font-[var(--font-sans)] text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {dict.markReturned}
        </button>
      )}
    </div>
  );
}
