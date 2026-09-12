// SPDX-License-Identifier: GPL-3.0-only
import { sendGoalProgressReminders } from "@/lib/push";

/**
 * Goal-progress push notifications (v2.7.0) — called daily by the Docker cron
 * service; the server decides whether today is a notification day (1 / 10 / 20
 * / last 3 days of the month) using the server-local clock.
 * Protected with the same CRON_SECRET bearer pattern as the other cron endpoints.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Push not configured", { status: 503 });
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await sendGoalProgressReminders();
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
