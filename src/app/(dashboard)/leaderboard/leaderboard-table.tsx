"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { levelForXp } from "@/lib/gamification";

type User = { id: string; name: string; xp: number };

const PAGE_SIZE = 20;

export function LeaderboardTable({
  users,
  currentUserId,
  dict,
}: {
  users: User[];
  currentUserId: string;
  dict: { rank: string; name: string; level: string; xp: string };
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const slice = users.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="border-t border-border">
        <div className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-4 border-b border-border px-4 py-2">
          <span className="editorial-label">#</span>
          <span className="editorial-label">{dict.name}</span>
          <span className="editorial-label text-center">{dict.level}</span>
          <span className="editorial-label text-right">{dict.xp}</span>
        </div>
        {slice.map((user, i) => (
          <div
            key={user.id}
            className={`grid grid-cols-[3rem_1fr_5rem_6rem] items-center gap-4 border-b border-border px-4 py-3 transition-colors ${
              user.id === currentUserId ? "bg-foreground/[0.04] font-medium" : ""
            }`}
          >
            <span className="tabular-nums text-sm text-muted-foreground">{start + i + 1}</span>
            <span className="text-sm">{user.name}</span>
            <span className="text-center text-sm tabular-nums">{levelForXp(user.xp)}</span>
            <span className="text-right text-sm tabular-nums text-muted-foreground">{user.xp}</span>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft size={12} />
            Prev
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Next
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
