// SPDX-License-Identifier: GPL-3.0-only
import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";
import { getDictionary } from "@/i18n/get-dictionary";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  if (await needsSetup()) redirect("/setup");
  if (process.env.ALLOW_REGISTRATION === "false") redirect("/login");
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <RegisterForm dict={dict.auth} />
    </main>
  );
}
