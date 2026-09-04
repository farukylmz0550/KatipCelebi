const CACHE_NAME = "katipcelebi-v1";

self.addEventListener("install", (event) => {
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

// ── Notifications ──

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
        tag: `katipcelebi-${time}`,
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
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.visibilityState === "visible");
      if (existing) return existing.focus();
      return self.clients.openWindow("/books");
    })
  );
});
