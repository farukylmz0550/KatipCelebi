"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";

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
