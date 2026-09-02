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
  ];

  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between py-4">
            <Link href="/books" className="group">
              <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                KatipCelebi
              </span>
              <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                library
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {session?.user?.name}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await setTheme(theme === "dark" ? "light" : "dark");
                }}
              >
                <button
                  type="submit"
                  aria-label="Toggle theme"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
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
                  className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  title={locale}
                >
                  {locale}
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button type="submit" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive">
                  {dict.nav.logout}
                </button>
              </form>
            </div>
          </div>
          <nav className="flex items-center gap-0 -mb-px overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:border-foreground/20 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/covers"
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:border-foreground/20 hover:text-foreground"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
