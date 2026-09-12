// SPDX-License-Identifier: GPL-3.0-only
"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit, throttlingEnabled, DEFAULT_LIMITS } from "@/lib/rate-limit";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createAdminUser(input: { name: string; email: string; password: string }) {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "anonymous";
  if (throttlingEnabled() && !checkRateLimit(`setup:${ip}`, DEFAULT_LIMITS.register)) {
    throw new Error("Too many requests. Try again later.");
  }

  const parsed = setupSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { name, email, password } = parsed.data;

  await db.$transaction(async (tx) => {
    const userCount = await tx.user.count();
    if (userCount > 0) throw new Error("Admin user already exists");

    const passwordHash = await bcrypt.hash(password, 12);
    await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        isAdmin: true,
        approved: true,
      },
    });
  });
}
