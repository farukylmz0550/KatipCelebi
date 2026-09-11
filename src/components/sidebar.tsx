"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import {
  BookOpen,
  Handshake,
  BarChart3,
  Trophy,
  Medal,
  Users,
  User,
  Settings,
  Shield,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { clientHasConsent } from "@/lib/cookies-client";
import { logoutAction } from "@/app/actions/logout";

type SidebarProps = {
  dict: Record<string, string>;
  isAdmin: boolean;
  userName?: string | null;
  initialCollapsed: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { href: "/books", label: "books", icon: BookOpen },
  { href: "/lending", label: "lending", icon: Handshake },
  { href: "/stats", label: "stats", icon: BarChart3 },
];

const MORE_NAV: NavItem[] = [
  { href: "/achievements", label: "achievements", icon: Trophy },
  { href: "/leaderboard", label: "leaderboard", icon: Medal },
  { href: "/people", label: "people", icon: Users },
  { href: "/profile", label: "profile", icon: User },
  { href: "/settings", label: "settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/users", label: "adminUsers", icon: Shield, adminOnly: true },
  { href: "/admin/covers", label: "adminCovers", icon: ImageIcon, adminOnly: true },
];

function setSidebarCookie(collapsed: boolean) {
  const value = collapsed ? "1" : "0";
  const hasPref = clientHasConsent("preferences");
  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  if (hasPref || !document.cookie.includes("cookie-consent=")) {
    // if no consent yet, allow (implicit essential UX); if rejected, use localStorage
    try {
      const raw = document.cookie.includes("cookie-consent=") ? document.cookie : "";
      const hasReject = raw.includes("preferences%22%3Afalse") || raw.includes('"preferences":false');
      if (hasReject) {
        localStorage.setItem("sidebar-collapsed", value);
        return;
      }
    } catch {}
    document.cookie = `sidebar-collapsed=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    try {
      localStorage.setItem("sidebar-collapsed", value);
    } catch {}
  }
}

export function Sidebar({ dict, isAdmin, userName, initialCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const ls = localStorage.getItem("sidebar-collapsed");
      if (ls !== null && !document.cookie.includes("sidebar-collapsed=")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(ls === "1");
      }
    } catch {}
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    setSidebarCookie(next);
  }

  return (
    <aside
      className={`hidden md:flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex h-12 items-center gap-2 border-b border-[var(--border)] px-3">
        <Link href="/books" className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0" />
          {!collapsed && (
            <span className="font-[var(--font-serif)] text-sm font-semibold tracking-tight text-foreground truncate">
              Book Shelf
            </span>
          )}
        </Link>
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="space-y-4">
          <div className="space-y-0.5 px-2">
            {!collapsed && (
              <p className="px-2 py-1 font-[var(--font-sans)] text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Library
              </p>
            )}
            {MAIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} dict={dict} pathname={pathname} collapsed={collapsed} />
            ))}
          </div>

          <div className="space-y-0.5 px-2">
            {!collapsed && (
              <p className="px-2 py-1 font-[var(--font-sans)] text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Discover
              </p>
            )}
            {MORE_NAV.map((item) => (
              <NavLink key={item.href} item={item} dict={dict} pathname={pathname} collapsed={collapsed} />
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-0.5 px-2">
              {!collapsed ? (
                <p className="px-2 py-1 font-[var(--font-sans)] text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Admin
                </p>
              ) : (
                <div className="mx-2 my-2 h-px bg-[var(--border)]" />
              )}
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} item={item} dict={dict} pathname={pathname} collapsed={collapsed} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer — only logout, theme/locale via Settings */}
      <div className="border-t border-[var(--border)] p-2 space-y-1">
        {!collapsed && userName && (
          <p className="px-2 py-1 font-[var(--font-sans)] text-xs text-muted-foreground truncate" title={userName}>
            {userName}
          </p>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => logoutAction())}
          title={dict.logout ?? "Logout"}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-[8px] text-muted-foreground hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
        >
          <LogOut size={14} />
          {!collapsed && <span className="font-[var(--font-sans)] text-xs">{dict.logout ?? "Logout"}</span>}
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  dict,
  pathname,
  collapsed,
}: {
  item: NavItem;
  dict: Record<string, string>;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  const label = dict[item.label] ?? item.label;

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
        isActive ? "bg-[var(--accent)] text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.6} className="shrink-0" />
      {!collapsed && <span className="font-[var(--font-sans)] text-sm truncate">{label}</span>}
    </Link>
  );
}
