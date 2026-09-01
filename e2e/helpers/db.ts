export async function resetDb(page?: any) {
  // Robust reset: wait for server, retry 5x
  for (let i = 0; i < 5; i++) {
    try {
      if (page && page.request) {
        const res = await page.request.post("/api/test/reset");
        if (res.ok()) return;
      }
    } catch {}
    try {
      const res = await fetch("http://localhost:3000/api/test/reset", { method: "POST" });
      if (res.ok) return;
    } catch {}
    // wait for webServer to be ready
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    // also try to hit a page to warm up server
    try {
      if (page) await page.goto("/login", { waitUntil: "commit", timeout: 2000 }).catch(() => {});
    } catch {}
  }
}

export function dbExists(): boolean {
  // not used in new flow
  return true;
}
