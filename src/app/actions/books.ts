"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { lookupIsbn } from "@/lib/isbn";
import { awardXp, XP_REWARDS, syncAchievements } from "@/lib/gamification";

const addBookSchema = z.object({
  isbn: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v ? v.replace(/[^0-9Xx]/g, "") || undefined : undefined)),
  title: z.string().trim().min(1, "Title is required").max(500),
  author: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  coverUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "Cover URL must be a valid HTTP/HTTPS URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  numberOfPages: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  publishers: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  publishDate: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  publishPlaces: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  languages: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  subjects: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isbn10: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isbn13: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  subtitle: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  editionName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  series: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
  currentPage: z.number().int().min(0).optional(),
});

export async function lookupIsbnAction(
  isbn: string,
): Promise<{ ok: true; data: Awaited<ReturnType<typeof lookupIsbn>> } | { ok: false; error: string }> {
  await requireUserId();
  const cleaned = isbn.replace(/[^0-9Xx]/g, "");
  if (!cleaned) return { ok: false, error: "ISBN is required" };
  try {
    const result = await lookupIsbn(cleaned);
    if (!result) return { ok: false, error: "NOT_FOUND" };
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lookup failed" };
  }
}

export async function addBook(input: {
  isbn?: string;
  title: string;
  author?: string;
  coverUrl?: string;
  numberOfPages?: string;
  publishers?: string;
  publishDate?: string;
  publishPlaces?: string;
  languages?: string;
  subjects?: string;
  isbn10?: string;
  isbn13?: string;
  subtitle?: string;
  editionName?: string;
  series?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = addBookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const userId = await requireUserId();
  try {
    await db.book.create({
      data: {
        userId,
        isbn: parsed.data.isbn,
        title: parsed.data.title,
        author: parsed.data.author,
        coverUrl: parsed.data.coverUrl,
        numberOfPages: parsed.data.numberOfPages,
        publishers: parsed.data.publishers,
        publishDate: parsed.data.publishDate,
        publishPlaces: parsed.data.publishPlaces,
        languages: parsed.data.languages,
        subjects: parsed.data.subjects,
        isbn10: parsed.data.isbn10,
        isbn13: parsed.data.isbn13,
        subtitle: parsed.data.subtitle,
        editionName: parsed.data.editionName,
        series: parsed.data.series,
      },
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create book" };
  }
  // XP/achievements are non-blocking — book creation already succeeded
  try {
    await awardXp(userId, XP_REWARDS.BOOK_ADDED);
  } catch {}
  try {
    await syncAchievements(userId);
  } catch {}
  revalidatePath("/books");
  return { ok: true };
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
    const { finishBookWithXp } = await import("./streak");
    const pages = book.numberOfPages ? parseInt(book.numberOfPages, 10) : null;
    await finishBookWithXp(bookId, isNaN(pages!) ? null : pages);
  }
  revalidatePath("/books");
  revalidatePath("/stats");
  revalidatePath(`/books/${bookId}`);
}

export async function updateBook(
  bookId: string,
  data: Partial<{
    title: string;
    subtitle: string;
    author: string;
    authors: string;
    publishers: string;
    publishDate: string;
    publishPlaces: string;
    editionName: string;
    series: string;
    numberOfPages: string;
    languages: string;
    isbn10: string;
    isbn13: string;
    subjects: string;
    rating: number;
    notes: string;
    tags: string;
    signed: boolean;
    copies: number;
    currentPage: number;
  }>,
) {
  const parsed = updateBookSchema.partial().safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const userId = await requireUserId();
  const book = await db.book.findFirst({ where: { id: bookId, userId } });
  if (!book) throw new Error("Not found");
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === "rating") update.rating = Math.max(0, Math.min(5, Math.floor(Number(v))));
    else if (k === "copies") update.copies = Math.max(1, Math.min(999, Math.floor(Number(v))));
    else if (k === "signed") update.signed = !!v;
    else if (k === "authors") update.author = typeof v === "string" ? v.trim() : v;
    else if (k === "currentPage") update.currentPage = Math.max(0, Math.floor(Number(v)));
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
