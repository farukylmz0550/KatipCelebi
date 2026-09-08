import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDictionary, getLocale, LOCALES } from "@/i18n/get-dictionary";
import { setLocale } from "@/app/actions/locale";
import { getTheme } from "@/lib/theme";
import { needsSetup } from "@/lib/setup";
import { NotificationPerm } from "./notification-perm";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeDropdown } from "@/components/theme-dropdown";
import { InstallPrompt } from "@/components/install-prompt";

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

  return (
    <div className="min-h-full">
      {/* GNOME Header Bar */}
      <header className="sticky top-0 z-50 gnome-header safe-top">
        <div className="mx-auto flex h-12 max-w-3xl items-center px-3">
          {/* Left: Logo + Title */}
          <Link href="/books" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-6 w-6 rounded-md" />
            <span className="text-[13px] font-semibold text-foreground">KatipCelebi</span>
          </Link>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-0.5">
            <NotificationPerm dict={dict.common} />
            <ThemeDropdown currentTheme={theme} />
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                title={dict.nav.logout}
              >
                ⏻
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden border-b border-border bg-card md:block">
        <div className="mx-auto flex max-w-3xl items-center gap-0.5 px-3 py-1">
          <NavLink href="/books">{dict.nav.books}</NavLink>
          <NavLink href="/lending">{dict.nav.lending}</NavLink>
          <NavLink href="/stats">{dict.nav.stats}</NavLink>
          <NavLink href="/achievements">{dict.nav.achievements}</NavLink>
          <NavLink href="/leaderboard">{dict.nav.leaderboard}</NavLink>
          {isAdmin && (
            <>
              <NavLink href="/admin/users">{dict.common.admin}</NavLink>
              <NavLink href="/admin/covers">Covers</NavLink>
            </>
          )}
          <div className="ml-auto text-xs text-muted-foreground">{session?.user?.name}</div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 md:pb-6">{children}</main>

      <footer className="border-t border-border py-3 text-center safe-bottom">
        <Link
          href="/licenses"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {dict.licenses.nav}
        </Link>
      </footer>

      <BottomNav dict={{ books: dict.nav.books, lending: dict.nav.lending, stats: dict.nav.stats, more: dict.nav.more }} />
      <InstallPrompt />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}
