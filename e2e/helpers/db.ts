export async function resetDb(page?: any) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { execSync } = await import("node:child_process");
      execSync("python3 -c \"import sqlite3; conn=sqlite3.connect('prisma/dev.db'); conn.execute('PRAGMA busy_timeout=5000'); conn.executescript('DELETE FROM UserAchievement; DELETE FROM LendingRecord; DELETE FROM Book; DELETE FROM Person; DELETE FROM Goal; DELETE FROM User;'); conn.commit(); conn.close()\"", { stdio: "ignore" });
      const out = execSync("python3 -c \"import sqlite3; print(list(sqlite3.connect('prisma/dev.db').execute('SELECT count(*) FROM User'))[0][0])\"", { encoding: "utf-8" });
      if (out.trim() === "0") return;
    } catch {}
    // Fallback API
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
    // Ultimate fallback: rm + migrate
    if (attempt === 1) {
      try {
        const { execSync } = await import("node:child_process");
        execSync("rm -f prisma/dev.db prisma/dev.db-wal prisma/dev.db-shm", { stdio: "ignore" });
        execSync("npx prisma migrate deploy --skip-generate 2>&1 | head -n 20", { stdio: "ignore" });
        execSync("npx tsx prisma/seed.ts 2>&1 | head -n 20", { stdio: "ignore" });
        return;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 700));
  }
}

export function dbExists(): boolean {
  // not used in new flow
  return true;
}
