import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  // Only allow in dev/test
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await db.userAchievement.deleteMany({});
  await db.lendingRecord.deleteMany({});
  await db.book.deleteMany({});
  await db.person.deleteMany({});
  await db.goal.deleteMany({});
  await db.user.deleteMany({});
  // keep achievements
  return NextResponse.json({ ok: true });
}
