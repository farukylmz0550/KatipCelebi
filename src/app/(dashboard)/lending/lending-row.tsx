"use client";

import { useTransition } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { returnLending } from "@/app/actions/lending";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-accent/50">
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{record.book.title}</p>
        <p className="text-sm text-muted-foreground">
          {record.borrowerName} · {new Date(record.lentAt).toLocaleDateString()}
        </p>
      </div>
      {record.returnedAt ? (
        <Badge variant="secondary">
          <CheckCircle2 size={12} className="mr-1" />
          {dict.returned}
        </Badge>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => returnLending(record.id))}
        >
          <RotateCcw size={14} />
          {dict.markReturned}
        </Button>
      )}
    </li>
  );
}
