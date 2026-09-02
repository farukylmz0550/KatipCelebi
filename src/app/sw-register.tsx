"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              reg.active?.postMessage("schedule-notifications");
            }
          });
        } else if (Notification.permission === "granted") {
          reg.active?.postMessage("schedule-notifications");
        }

        // Re-schedule every 12 hours
        setInterval(() => {
          if (Notification.permission === "granted") {
            reg.active?.postMessage("schedule-notifications");
          }
        }, 12 * 60 * 60 * 1000);
      });
    }
  }, []);

  return null;
}
