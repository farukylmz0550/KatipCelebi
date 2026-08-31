"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { lookupIsbn, lookupIsbns } from "@/lib/isbn";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";

export async function lookupIsbnAction(isbn: string) {
  return lookupIsbn(isbn);
}

export async function addBook(input: { isbn?: string; title: string; author?: string; coverUrl?: string }) {
  const userId = await requireUserId();
  await db.book.create({
    data: {
      userId,
      isbn: input.isbn,
      title: input.title,
      author: input.author,
      coverUrl: input.coverUrl,
    },
  });
  await awardXp(userId, XP_REWARDS.BOOK_ADDED);
  await syncAchievements(userId);
  revalidatePath("/books");
}

export async function importBooksByIsbn(rawIsbns: string) {
  const userId = await requireUserId();
  const isbns = rawIsbns
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const found = await lookupIsbns(isbns);
  if (found.length === 0) return { imported: 0 };

  await db.book.createMany({
    data: found.map((b) => ({
      userId,
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      coverUrl: b.coverUrl,
    })),
  });
  await awardXp(userId, found.length * XP_REWARDS.BOOK_ADDED);
  await syncAchievements(userId);
  revalidatePath("/books");
  return { imported: found.length };
}

export async function setBookStatus(bookId: string, status: "TO_READ" | "READING" | "FINISHED") {
  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");

  await db.book.update({
    where: { id: bookId },
    data: { status, finishedAt: status === "FINISHED" ? new Date() : null },
  });

  if (status === "FINISHED" && book.status !== "FINISHED") {
    await awardXp(userId, XP_REWARDS.BOOK_FINISHED);
    await syncAchievements(userId);
  }
  revalidatePath("/books");
  revalidatePath("/stats");
}

export async function deleteBook(bookId: string) {
  const userId = await requireUserId();
  await db.book.deleteMany({ where: { id: bookId, userId } });
  revalidatePath("/books");
}
