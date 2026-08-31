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
    <li className="flex items-center justify-between gap-2 rounded border border-neutral-200 bg-white px-3 py-2">
      <div>
        <p className="font-medium">{record.book.title}</p>
        <p className="text-sm text-neutral-500">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <span className="text-sm text-neutral-500">{dict.returned}</span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        >
          {dict.markReturned}
        </button>
      )}
    </li>
  );
}
