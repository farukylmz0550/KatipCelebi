"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";

export async function createLending(bookId: string, borrowerName: string) {
  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");

  await db.lendingRecord.create({ data: { bookId, borrowerName } });
  await awardXp(userId, XP_REWARDS.LENDING_CREATED);
  await syncAchievements(userId);
  revalidatePath("/lending");
}

export async function returnLending(lendingId: string) {
  const userId = await requireUserId();
  const record = await db.lendingRecord.findFirst({
    where: { id: lendingId, book: { userId } },
  });
  if (!record) throw new Error("Not found");

  await db.lendingRecord.update({ where: { id: lendingId }, data: { returnedAt: new Date() } });
  revalidatePath("/lending");
}
