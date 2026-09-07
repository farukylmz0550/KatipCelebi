"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveUser, rejectUser, toggleAdmin, deleteUser } from "@/app/actions/admin";

type User = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  approved: boolean;
  xp: number;
  createdAt: Date;
  _count: { books: number };
};

export function UserTable({ users, dict }: { users: User[]; dict: Record<string, string> }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveUser(id);
      router.refresh();
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      await rejectUser(id);
      router.refresh();
    });
  }

  function handleToggleAdmin(id: string) {
    startTransition(async () => {
      await toggleAdmin(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm(dict.confirmDelete)) return;
    startTransition(async () => {
      await deleteUser(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 border-b border-border bg-muted/50 px-4 py-2">
        <span className="text-[11px] text-muted-foreground">{dict.name}</span>
        <span className="text-[11px] text-muted-foreground">{dict.email}</span>
        <span className="text-[11px] text-center text-muted-foreground">{dict.adminLabel}</span>
        <span className="text-[11px] text-center text-muted-foreground">{dict.status}</span>
        <span className="text-[11px] text-center text-muted-foreground">{dict.books}</span>
        <span className="text-[11px] text-muted-foreground">{dict.actions}</span>
      </div>
      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border last:border-b-0 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
          <span className="text-sm text-muted-foreground truncate">{user.email}</span>
          <span className="text-center">
            <button
              onClick={() => handleToggleAdmin(user.id)}
              disabled={pending}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                user.isAdmin
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {user.isAdmin ? dict.yes : dict.no}
            </button>
          </span>
          <span className="text-center">
            {user.approved ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {dict.approved}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {dict.pending}
              </span>
            )}
          </span>
          <span className="text-center text-sm tabular-nums text-muted-foreground">{user._count.books}</span>
          <span className="flex gap-1">
            {!user.approved ? (
              <button
                onClick={() => handleApprove(user.id)}
                disabled={pending}
                className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground disabled:opacity-50"
              >
                {dict.approve}
              </button>
            ) : (
              <button
                onClick={() => handleReject(user.id)}
                disabled={pending}
                className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground disabled:opacity-50"
              >
                {dict.reject}
              </button>
            )}
            <button
              onClick={() => handleDelete(user.id)}
              disabled={pending}
              className="rounded border border-destructive/30 px-2 py-1 text-[10px] text-destructive disabled:opacity-50"
            >
              {dict.delete}
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
