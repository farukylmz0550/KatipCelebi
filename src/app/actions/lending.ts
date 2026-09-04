"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";
import { normalizeName } from "@/lib/person";

const borrowerNameSchema = z.string().min(1).max(200);

export async function createLending(bookId: string, borrowerName: string) {
  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");

  const parsed = borrowerNameSchema.safeParse(borrowerName.trim());
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid borrower name");

  const nameTrimmed = parsed.data;

  // Find or create Person
  const normalized = normalizeName(nameTrimmed);
  const persons = await db.person.findMany({ where: { userId }, select: { id: true, name: true } });
  let person = persons.find((p) => normalizeName(p.name) === normalized);
  if (!person) {
    person = await db.person.create({ data: { userId, name: nameTrimmed } });
  }

  // Copy-aware guard: out < copies
  const outCount = await db.lendingRecord.count({ where: { bookId, returnedAt: null } });
  const copies = (book as unknown as { copies?: number }).copies ?? 1;
  if (outCount >= copies) throw new Error("All copies are out");

  await db.lendingRecord.create({
    data: {
      bookId,
      borrowerName: nameTrimmed,
      personId: person.id,
      personName: nameTrimmed,
      bookTitle: book.title,
    },
  });
  await awardXp(userId, XP_REWARDS.LENDING_CREATED);
  await syncAchievements(userId);
  revalidatePath("/lending");
  revalidatePath("/people");
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
