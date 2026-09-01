import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDictionary, getLocale, LOCALES } from "@/i18n/get-dictionary";
import { setLocale } from "@/app/actions/locale";
import { getTheme } from "@/lib/theme";
import { setTheme } from "@/app/actions/theme";
import { needsSetup } from "@/lib/setup";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (await needsSetup()) redirect("/setup");
  const session = await auth();
  const dict = await getDictionary();
  const locale = await getLocale();
  const theme = await getTheme();

  let isAdmin = false;
  if (session?.user?.id) {
    const { db } = await import("@/lib/db");
    const u = await db.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
    isAdmin = !!u?.isAdmin;
  }

  const links = [
    { href: "/books", label: dict.nav.books },
    { href: "/people", label: dict.nav.people },
    { href: "/lending", label: dict.nav.lending },
    { href: "/stats", label: dict.nav.stats },
    { href: "/achievements", label: dict.nav.achievements },
    { href: "/leaderboard", label: dict.nav.leaderboard },
    ...(isAdmin ? [{ href: "/admin/covers", label: "Admin" }] : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <nav className="flex gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <form
              action={async () => {
                "use server";
                await setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              <button
                type="submit"
                aria-label="Toggle theme"
                className="rounded border border-neutral-300 p-1.5 dark:border-neutral-700"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                const idx = LOCALES.indexOf(locale);
                const next = LOCALES[(idx + 1) % LOCALES.length];
                await setLocale(next);
              }}
            >
              <button type="submit" className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700" title={locale}>
                {locale.toUpperCase()}
              </button>
            </form>
            <span className="text-neutral-500 dark:text-neutral-400">{session?.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="underline text-neutral-600 dark:text-neutral-400">
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
