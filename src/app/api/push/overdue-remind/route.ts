// SPDX-License-Identifier: GPL-3.0-only
import { NextResponse } from "next/server";
import { sendOverdueReminders } from "@/lib/push";

/**
 * Triggered by the Docker cron service (or an external scheduler):
 * sends one grouped push reminder per user with overdue borrowed books.
 * Protected with CRON_SECRET (Bearer token) — same pattern as streak-remind.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendOverdueReminders();
  return NextResponse.json({ ok: true, ...result });
}
