"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function registerUser(input: { email: string; password: string; name: string }) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, name } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { email, name, passwordHash } });
  return { ok: true };
}
