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

export function NotificationPerm() {
  const permission = useSyncExternalStore(subscribePermission, getPermission, () => "default" as const);

  async function request() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      navigator.serviceWorker.controller?.postMessage("schedule-notifications");
    }
  }

  if (permission === "unsupported" || permission === "denied" || permission === "granted") return null;

  return (
    <button
      onClick={request}
      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-[13px] text-secondary-foreground transition-colors hover:bg-accent"
    >
      Enable notifications
    </button>
  );
}
