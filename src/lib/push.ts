import webpush from "web-push";
import { db } from "@/lib/db";
import { getStreakInfo } from "@/lib/streak";
import { isOverdue, groupOverdueByUser } from "@/lib/lending-due";

let configured = false;

export function isPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function ensureConfigured(): void {
  if (configured) return;
  if (!isPushConfigured()) {
    throw new Error("VAPID keys not configured");
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@bookshelf.local",
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Send a web push to every subscription of a user.
 * Removes subscriptions the server reports as gone (410/404).
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  ensureConfigured();

  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.deleteMany({ where: { userId, endpoint: sub.endpoint } });
        }
      }
    }),
  );

  return sent;
}

/**
 * Streak-at-risk reminders for every subscribed user who has not read today.
 */
export async function sendStreakReminders(): Promise<{ sent: number; skipped: number }> {
  ensureConfigured();

  const subscriptions = await db.pushSubscription.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });

  let sent = 0;
  let skipped = 0;

  for (const { userId } of subscriptions) {
    try {
      const settings = await db.userSettings.findUnique({ where: { userId } });
      if (settings && (!settings.notificationsEnabled || !settings.streakReminders)) {
        skipped += 1;
        continue;
      }

      const info = await getStreakInfo(userId);
      if (!info || info.isTodayActive || info.currentStreak === 0) {
        skipped += 1;
        continue;
      }
      const count = await sendPushToUser(userId, {
        title: "Your streak is about to break! 🔥",
        body: `You haven't read today. Don't lose your ${info.currentStreak}-day streak!`,
        url: "/books",
        tag: "streak-warning",
      });
      sent += count;
    } catch {
      skipped += 1;
    }
  }

  return { sent, skipped };
}

/**
 * Overdue lending reminders: one grouped notification per user per run.
 * Ownership is derived from the book relation stored in the database —
 * no client-supplied identifiers are involved.
 */
export async function sendOverdueReminders(): Promise<{ sent: number; skipped: number }> {
  ensureConfigured();

  const overdueRecords = await db.lendingRecord.findMany({
    where: { dueDate: { lt: new Date() }, returnedAt: null },
    select: { dueDate: true, book: { select: { userId: true, title: true } } },
  });

  if (overdueRecords.length === 0) return { sent: 0, skipped: 0 };

  const active = overdueRecords.filter((r) => isOverdue({ dueDate: r.dueDate ?? null, returnedAt: null }));
  const payloads = groupOverdueByUser(active);
  if (payloads.length === 0) return { sent: 0, skipped: 0 };

  const subscribed = new Set(
    (
      await db.pushSubscription.findMany({
        select: { userId: true },
        distinct: ["userId"],
      })
    ).map((s) => s.userId),
  );

  let sent = 0;
  let skipped = 0;

  for (const { userId, payload } of payloads) {
    if (!subscribed.has(userId)) {
      skipped += 1;
      continue;
    }
    try {
      const settings = await db.userSettings.findUnique({ where: { userId } });
      if (settings && !settings.notificationsEnabled) {
        skipped += 1;
        continue;
      }
      const count = await sendPushToUser(userId, { ...payload, url: "/lending", tag: "overdue-remind" });
      sent += count;
    } catch {
      skipped += 1;
    }
  }

  return { sent, skipped };
}
