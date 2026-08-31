"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Theme } from "@/lib/theme";

export async function setTheme(theme: Theme) {
  (await cookies()).set("theme", theme, { maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/");
}
