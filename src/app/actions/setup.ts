"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function createAdminUser(input: { name: string; email: string; password: string }) {
  const userCount = await db.user.count();
  if (userCount > 0) throw new Error("Admin user already exists");

  const passwordHash = await bcrypt.hash(input.password, 12);
  await db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      isAdmin: true,
    },
  });
}
