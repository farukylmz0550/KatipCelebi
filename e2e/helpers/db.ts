export async function resetDb(page?: any) {
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
    // Fallback: direct python sqlite delete (when server not ready or API fails)
    try {
      const { execSync } = await import("node:child_process");
      execSync("python3 -c \"import sqlite3; conn=sqlite3.connect('prisma/dev.db'); conn.executescript('DELETE FROM UserAchievement; DELETE FROM LendingRecord; DELETE FROM Book; DELETE FROM Person; DELETE FROM Goal; DELETE FROM User;'); conn.commit(); conn.close()\"", { stdio: "ignore" });
      return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    try {
      if (page) await page.goto("/login", { waitUntil: "commit", timeout: 2000 }).catch(() => {});
    } catch {}
  }
}

export function dbExists(): boolean {
  // not used in new flow
  return true;
}
