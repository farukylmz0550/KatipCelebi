import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDictionary, getLocale, LOCALES } from "@/i18n/get-dictionary";
import { setLocale } from "@/app/actions/locale";
import { getTheme } from "@/lib/theme";
import { setTheme } from "@/app/actions/theme";
import { needsSetup } from "@/lib/setup";
import { NotificationPerm } from "./notification-perm";

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
  ];

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-12 max-w-3xl items-center px-4">
          <Link href="/books" className="mr-6 text-sm font-semibold text-foreground">
            KatipCelebi
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/covers"
                className="rounded-md px-2.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <NotificationPerm />
            <span className="mr-1 text-xs text-muted-foreground">{session?.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              <button
                type="submit"
                aria-label="Toggle theme"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
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
              <button
                type="submit"
                className="rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={locale}
              >
                {locale.toUpperCase()}
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-destructive">
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
