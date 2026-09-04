"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { lookupIsbn, lookupIsbns } from "@/lib/isbn";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";

export async function lookupIsbnAction(isbn: string) {
  await requireUserId();
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

  const data: Record<string, unknown> = { status };
  if (status === "FINISHED") {
    data.finishedAt = new Date();
    if (!book.startedAt) data.startedAt = new Date();
  } else if (status === "READING") {
    if (!book.startedAt) data.startedAt = new Date();
    data.finishedAt = null;
  } else {
    data.finishedAt = null;
  }

  await db.book.update({ where: { id: bookId }, data });

  if (status === "FINISHED" && book.status !== "FINISHED") {
    await awardXp(userId, XP_REWARDS.BOOK_FINISHED);
    await syncAchievements(userId);
  }
  revalidatePath("/books");
  revalidatePath("/stats");
  revalidatePath(`/books/${bookId}`);
}

export async function updateBook(bookId: string, data: Partial<{
  title: string; subtitle: string; author: string; authors: string; publishers: string; publishDate: string; publishPlaces: string;
  editionName: string; series: string; numberOfPages: string; languages: string; isbn10: string; isbn13: string;
  subjects: string; rating: number; notes: string; tags: string; signed: boolean; copies: number;
}>) {
  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");
  if (data.title !== undefined && !data.title.trim()) throw new Error("Title required");
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (k === "rating") update.rating = Math.max(0, Math.min(5, Math.floor(Number(v)))) ;
    else if (k === "copies") update.copies = Math.max(1, Math.min(999, Math.floor(Number(v))));
    else if (k === "signed") update.signed = !!v;
    else if (k === "authors") update.author = typeof v === "string" ? v.trim() : v;
    else update[k] = typeof v === "string" ? v.trim() : v;
  }
  await db.book.update({ where: { id: bookId }, data: update });
  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
}

export async function deleteBook(bookId: string) {
  const userId = await requireUserId();
  await db.book.deleteMany({ where: { id: bookId, userId } });
  revalidatePath("/books");
}
