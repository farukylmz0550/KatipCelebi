"use client";

import { signOut } from "@/auth";

export function LogoutButton({ label }: { label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Çıkmak istediğinizden emin misiniz?")) {
            e.preventDefault();
          }
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
        title={label}
      >
        ⏻
      </button>
    </form>
  );
}
