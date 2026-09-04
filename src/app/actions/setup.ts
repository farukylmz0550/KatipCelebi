"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createAdminUser(input: { name: string; email: string; password: string }) {
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
      },
    });
  });
}
