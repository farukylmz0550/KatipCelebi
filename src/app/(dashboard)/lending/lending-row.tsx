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
    <li className="flex items-center justify-between gap-2 rounded border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="font-medium">{record.book.title}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{dict.returned}</span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
          className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          {dict.markReturned}
        </button>
      )}
    </li>
  );
}
