// @ts-check
// Documented exception to CONTRIBUTING.md "TypeScript everywhere" — see CONTRIBUTING.md
// This file MUST be served as /sw.js (ServiceWorkerGlobalScope). It is intentionally plain JS.
// Keep logic in sync with src/app/sw-register.tsx which posts "schedule-notifications"/"check-streak".

/** @type {string} */
const CACHE_NAME = "bookshelf-v3";

/** @type {string[]} */
const PRECACHE_URLS = ["/offline.html", "/manifest.json", "/icon-192.png", "/icon-512.png", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
  scheduleNotifications();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isNextInternal = url.pathname.startsWith("/_next/");
  const isApi = url.pathname.startsWith("/api/");

  if (isNextInternal || isApi) return;

  // Navigations — network-first, offline fallback to precached offline.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/offline.html")))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Background Sync ──

self.addEventListener("sync", (event) => {
  if (event.tag === "bookshelf-sync-books") {
    event.waitUntil(broadcastToClients("sync-books"));
  }
});

function broadcastToClients(message) {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage(message));
  });
}

// ── Push Notifications ──

// VAPID public key is passed via the registration URL query (?vapid=...)
const VAPID_PUBLIC_KEY = new URLSearchParams(self.location.search).get("vapid");

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      if (!VAPID_PUBLIC_KEY) return;
      try {
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
      } catch {
        // Resubscription is best-effort
      }
    })(),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Bookshelf", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Bookshelf", {
      body: data.body || "New notification",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "bookshelf-push",
      renotify: true,
      data: data.url || "/books",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/books";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.visibilityState === "visible");
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ── Streak Reminder Notifications (timer-based fallback) ──

const MESSAGES = [
  { title: "Time to read!", body: "Open a book and continue your reading journey." },
  { title: "Don't forget your goals!", body: "Check your reading progress for today." },
  { title: "A book is waiting!", body: "You have unfinished books. Pick one up!" },
  { title: "Reading reminder", body: "Even 15 minutes of reading counts. Start now." },
  { title: "Your library misses you!", body: "Browse your collection and find your next read." },
  { title: "Lending reminder", body: "Check if any lent books need to be returned." },
  { title: "Daily reading goal", body: "Have you read today? Keep your streak going!" },
];

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

function scheduleNotifications() {
  self.registration.getNotifications().then((n) => n.forEach((n) => n.close()));

  const now = Date.now();

  const times = [
    now + 2 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000,
    now + 8 * 60 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000,
    now + 16 * 60 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000,
  ].filter((t) => t > now);

  times.forEach((time) => {
    setTimeout(() => {
      const msg = randomMessage();
      self.registration.showNotification(msg.title, {
        body: msg.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `bookshelf-${time}`,
        renotify: true,
      });
    }, time - Date.now());
  });
}

self.addEventListener("message", (event) => {
  if (event.data === "schedule-notifications") {
    scheduleNotifications();
  }
  if (event.data === "test-notification") {
    const msg = randomMessage();
    self.registration.showNotification(msg.title, {
      body: msg.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "test",
    });
  }
  if (event.data === "check-streak") {
    checkStreak();
  }
});
// ── Streak Check ──

async function checkStreak() {
  try {
    const clients = await self.clients.matchAll();
    if (clients.length === 0) return;

    const client = clients[0];
    const response = await client.fetch("/api/streak/status");
    if (!response.ok) return;

    const data = await response.json();
    if (!data.isTodayActive && data.currentStreak > 0) {
      self.registration.showNotification("Streak'in kırılmak üzere! 🔥", {
        body: `Bugün henüz okumadın. ${data.currentStreak} günlük streak'ini kaybetme!`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "streak-warning",
        renotify: true,
        data: "/books",
      });
    }
  } catch {
    // Offline or error — skip silently
  }
}

// Check streak every hour if notifications are enabled
setInterval(() => {
  checkStreak();
}, 60 * 60 * 1000);
