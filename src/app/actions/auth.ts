"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { needsSetup } from "@/lib/setup";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function registerUser(input: { email: string; password: string; name: string }) {
  if (await needsSetup()) return { error: "Setup admin account first at /setup" };
  if (process.env.ALLOW_REGISTRATION === "false") return { error: "Registration is disabled" };
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
