"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // Notify when a new service worker version is installed & waiting
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              toast.info("New version available — refresh the page to update", {
                duration: Infinity,
                action: { label: "Refresh", onClick: () => window.location.reload() },
              });
            }
          });
        });

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
        setInterval(
          () => {
            if (Notification.permission === "granted") {
              reg.active?.postMessage("schedule-notifications");
            }
          },
          12 * 60 * 60 * 1000,
        );

        // Check streak every hour
        setInterval(
          () => {
            if (Notification.permission === "granted") {
              reg.active?.postMessage("check-streak");
            }
          },
          60 * 60 * 1000,
        );
      });
    }
  }, []);

  return null;
}
