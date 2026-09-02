"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { levelForXp } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{dict.rank}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{dict.name}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{dict.level}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{dict.xp}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((user, i) => (
              <tr
                key={user.id}
                className={`border-t border-border transition-colors ${
                  user.id === currentUserId
                    ? "bg-primary/5 font-medium"
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{start + i + 1}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="secondary">{levelForXp(user.xp)}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{user.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
