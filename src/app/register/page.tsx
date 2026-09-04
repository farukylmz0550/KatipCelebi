import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  if (await needsSetup()) redirect("/setup");
  if (process.env.ALLOW_REGISTRATION === "false") redirect("/login");
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <RegisterForm />
    </main>
  );
}
