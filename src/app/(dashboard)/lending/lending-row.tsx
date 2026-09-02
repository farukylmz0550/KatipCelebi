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
    <div className="flex items-center justify-between border-b border-border py-3 transition-colors hover:bg-foreground/[0.02]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{record.book.title}</p>
        <p className="text-xs text-muted-foreground">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {dict.returned}
        </span>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
          className="border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          {dict.markReturned}
        </button>
      )}
    </div>
  );
}
