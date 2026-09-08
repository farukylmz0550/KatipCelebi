import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStreakInfo } from "@/lib/streak";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = await getStreakInfo(session.user.id);
  if (!info) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    currentStreak: info.currentStreak,
    isTodayActive: info.isTodayActive,
    lastActiveDate: info.lastActiveDate,
  });
}
