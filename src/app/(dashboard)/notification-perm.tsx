// SPDX-License-Identifier: GPL-3.0-only
"use client";

import { useSyncExternalStore } from "react";

function getPermission(): "default" | "granted" | "denied" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function subscribePermission(callback: () => void) {
  // No real subscription, just re-check on visibility change
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

export function NotificationPerm({ dict }: { dict: Record<string, string> }) {
  const permission = useSyncExternalStore(subscribePermission, getPermission, () => "default" as const);

  async function request() {
    if (!("Notification" in window)) return;
    // Granting permission enables server-side push (subscription is set up by
    // SWRegister); scheduled reminders are delivered via /api/push/streak-remind.
    await Notification.requestPermission();
  }

  if (permission === "unsupported" || permission === "denied" || permission === "granted") return null;

  return (
    <button
      onClick={request}
      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-[13px] text-secondary-foreground transition-colors hover:bg-accent"
    >
      {dict.enableNotifications}
    </button>
  );
}
