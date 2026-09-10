"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { sendPushToUser } from "@/lib/push";

export type UserSettingsData = {
  notificationsEnabled: boolean;
  streakReminders: boolean;
  weeklyDigest: boolean;
};

export async function getSettings(): Promise<UserSettingsData> {
  const userId = await requireUserId();
  const settings = await db.userSettings.findUnique({
    where: { userId },
  });
  if (!settings) {
    return {
      notificationsEnabled: true,
      streakReminders: true,
      weeklyDigest: false,
    };
  }
  return {
    notificationsEnabled: settings.notificationsEnabled,
    streakReminders: settings.streakReminders,
    weeklyDigest: settings.weeklyDigest,
  };
}

export async function updateSettings(data: Partial<UserSettingsData>) {
  const userId = await requireUserId();
  await db.userSettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      notificationsEnabled: data.notificationsEnabled ?? true,
      streakReminders: data.streakReminders ?? true,
      weeklyDigest: data.weeklyDigest ?? false,
    },
  });
  revalidatePath("/settings");
}

export async function sendTestPush(): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  try {
    const count = await sendPushToUser(userId, {
      title: "Bookshelf",
      body: "Test push — it works! 🎉",
      url: "/books",
      tag: "test-push",
    });
    if (count === 0) {
      return { ok: false, error: "No push subscription found" };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
