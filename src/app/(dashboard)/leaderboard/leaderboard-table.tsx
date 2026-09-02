"use client";

import { useState } from "react";
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
    <div className="space-y-4">
      <table className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-left text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <thead className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          <tr>
            <th className="px-3 py-2">{dict.rank}</th>
            <th className="px-3 py-2">{dict.name}</th>
            <th className="px-3 py-2">{dict.level}</th>
            <th className="px-3 py-2">{dict.xp}</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((user, i) => (
            <tr key={user.id} className={user.id === currentUserId ? "bg-[#cde2fb]/40 dark:bg-[#184f95]/30" : ""}>
              <td className="px-3 py-2 tabular-nums">{start + i + 1}</td>
              <td className="px-3 py-2">{user.name}</td>
              <td className="px-3 py-2 tabular-nums">{levelForXp(user.xp)}</td>
              <td className="px-3 py-2 tabular-nums">{user.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
