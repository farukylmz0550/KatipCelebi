import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resetSecret = process.env.RESET_SECRET;
  if (!resetSecret) {
    return NextResponse.json({ error: "RESET_SECRET not configured" }, { status: 500 });
  }

  let body: { secret?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.secret !== resetSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }
  // Robust: use Prisma with retry and fallback to raw sqlite
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await db.userAchievement.deleteMany({});
      await db.lendingRecord.deleteMany({});
      await db.book.deleteMany({});
      await db.person.deleteMany({});
      await db.goal.deleteMany({});
      await db.user.deleteMany({});
      return NextResponse.json({ ok: true });
    } catch {
      if (attempt === 2) {
        // Fallback: raw better-sqlite3 with busy timeout
        try {
          const { default: Database } = await import("better-sqlite3");
          const path = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace(/^file:/, "").replace(/^"|"$/g, "");
          const raw = new Database(path);
          raw.pragma("busy_timeout = 5000");
          raw.exec("DELETE FROM UserAchievement; DELETE FROM LendingRecord; DELETE FROM Book; DELETE FROM Person; DELETE FROM Goal; DELETE FROM User;");
          raw.close();
          return NextResponse.json({ ok: true, fallback: true });
        } catch (e2) {
          return NextResponse.json({ error: String(e2) }, { status: 500 });
        }
      }
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return NextResponse.json({ ok: true });
}
