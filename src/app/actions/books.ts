"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { lookupIsbn, lookupIsbns } from "@/lib/isbn";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";

const addBookSchema = z.object({
  isbn: z.string().max(20).optional(),
  title: z.string().min(1).max(500),
  author: z.string().max(500).optional(),
  coverUrl: z.string().refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    "Cover URL must be a valid HTTP/HTTPS URL"
  ).optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  subtitle: z.string().max(500).optional(),
  author: z.string().max(500).optional(),
  authors: z.string().max(500).optional(),
  publishers: z.string().max(500).optional(),
  publishDate: z.string().max(100).optional(),
  publishPlaces: z.string().max(500).optional(),
  editionName: z.string().max(200).optional(),
  series: z.string().max(200).optional(),
  numberOfPages: z.string().max(20).optional(),
  languages: z.string().max(200).optional(),
  isbn10: z.string().max(20).optional(),
  isbn13: z.string().max(20).optional(),
  subjects: z.string().max(1000).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  notes: z.string().max(10000).optional(),
  tags: z.string().max(1000).optional(),
  signed: z.boolean().optional(),
  copies: z.number().int().min(1).max(999).optional(),
});

export async function lookupIsbnAction(isbn: string) {
  await requireUserId();
  return lookupIsbn(isbn);
}

export async function addBook(input: { isbn?: string; title: string; author?: string; coverUrl?: string }) {
  const parsed = addBookSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const userId = await requireUserId();
  await db.book.create({
    data: {
      userId,
      isbn: parsed.data.isbn,
      title: parsed.data.title,
      author: parsed.data.author,
      coverUrl: parsed.data.coverUrl,
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
  const parsed = updateBookSchema.partial().safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
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
