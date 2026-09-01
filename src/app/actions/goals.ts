"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";

export async function getGoal() {
  const userId = await requireUserId();
  let goal = await db.goal.findUnique({ where: { userId } });
  if (!goal) {
    goal = await db.goal.create({ data: { userId, yearly: 0, monthly: 0 } });
  }
  return goal;
}

export async function setYearlyGoal(yearly: number) {
  const userId = await requireUserId();
  const y = Math.max(0, Math.min(999, Math.floor(yearly)));
  await db.goal.upsert({
    where: { userId },
    update: { yearly: y },
    create: { userId, yearly: y, monthly: 0 },
  });
  revalidatePath("/stats");
}

export async function setMonthlyGoal(monthly: number) {
  const userId = await requireUserId();
  const m = Math.max(0, Math.min(999, Math.floor(monthly)));
  await db.goal.upsert({
    where: { userId },
    update: { monthly: m },
    create: { userId, yearly: 0, monthly: m },
  });
  revalidatePath("/stats");
}
