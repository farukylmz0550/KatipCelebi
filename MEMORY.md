# Bookshelf — Memory Bank

> Last updated: 2026-09-09
> Version: 2.3.2
> Branch: main

---

## 1. Project Definition

Personal library management application. Book adding, lending tracking, reading statistics and Duolingo-style gamification (XP, levels, achievements, leaderboard).

Web rewrite of the original PyQt6 desktop app (`legacy` branch).

**Repo:** https://github.com/farukylmz0550/bookshelf-web

---

## 2. Tech Stack

| Layer | Technology |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts, Noto Serif/Sans/Mono |
| Theme | Terracotta × Dusty Rose (light) / Ink & Copper (dark) — CSS vars `UI_Design_Language.md` |
| Database | SQLite via Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials, JWT, bcrypt) |
| Validation | Zod |
| Formatting | Prettier + ESLint |
| Test | Vitest (unit), Playwright (e2e) |
| i18n | Cookie-based locale, 6 dictionaries |
| PWA | `public/sw.js` + `manifest.json` + `src/app/sw-register.tsx` |
| Consent | GDPR cookie banner `src/components/cookie-consent.tsx` (Essential/Preferences/Analytics) |
| Deploy | Docker (multi-stage), Docker Compose, GHCR |

---

## 3. File Structure

```
bookshelf/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── books/            # Book list (Card/List), add (ISBN one-click + detailed), filters, Excel
│   │   │   │   ├── books-add-section.tsx  # Arrow → detailed form (60/40 card)
│   │   │   │   ├── book-card.tsx          # Equal cards h-[380px] 60/40 object-contain
│   │   │   │   ├── books-grid.tsx         # 2→3→4 cols + view-mode cookie
│   │   │   │   └── [id]/                  # Book detail, edit, lending, personal
│   │   │   ├── lending/          # Lending list and form
│   │   │   ├── people/           # People directory and history
│   │   │   ├── stats/            # Statistics, goals, charts, streak, heatmap
│   │   │   ├── achievements/     # Achievement badges (grid)
│   │   │   ├── leaderboard/      # XP ranking
│   │   │   ├── profile/          # Edit name, change password
│   │   │   ├── settings/         # Notifications + theme (Sun/Moon SVG) + language + licenses link
│   │   │   ├── more/             # Bottom-nav overflow
│   │   │   └── admin/            # Admin (users, covers) — bottom of sidebar
│   │   ├── actions/              # Server actions (books, lending, people, goals, excel, profile, covers, admin, locale, theme, logout, settings)
│   │   ├── api/                  # API routes (auth, test reset, streak, well-known)
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── setup/                # First-time admin setup
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (token-aware)
│   │   ├── sidebar.tsx           # Collapsible sidebar (desktop, cookie sidebar-collapsed)
│   │   ├── bottom-nav.tsx        # Bottom nav (mobile, safe-area)
│   │   ├── cookie-consent.tsx    # GDPR banner (desktop modal / mobile bar)
│   │   ├── theme-dropdown.tsx    # Sun/Moon SVG (Lucide ISC)
│   │   └── install-prompt.tsx    # PWA install
│   ├── lib/
│   │   ├── books/                # Book domain logic + filters + openlibrary
│   │   ├── cookies.ts / cookies-client.ts / cookies-shared.ts # Consent helpers
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── gamification.ts       # XP, levels, achievements (DB)
│   │   ├── gamification-pure.ts  # Pure functions (Fibonacci, streak)
│   │   ├── goals.ts              # Goal math
│   │   ├── isbn.ts               # ISBN lookup (full metadata)
│   │   ├── person.ts             # Person normalization, trust
│   │   ├── stats.ts              # Monthly finish counts
│   │   ├── streak.ts             # Streak calculation
│   │   └── theme.ts              # Cookie theme (light/dark, Sun/Moon)
│   ├── i18n/                     # Dictionaries (en, tr, es, fr, ru, zh)
│   ├── auth.ts                   # NextAuth config + approval check
│   ├── proxy.ts                  # Proxy (auth + rate limiting)
│   └── types/                    # TypeScript declarations
├── prisma/
│   ├── schema.prisma             # Data model
│   ├── seed.ts                   # Achievement catalog seed (dev)
│   ├── seed.cjs                  # Achievement catalog seed (Docker)
│   └── migrations/               # Database migrations
├── e2e/                          # Playwright E2E tests
├── public/                       # Static files, sw.js, manifest.json
├── UI_Design_Language.md         # Visual language source of truth
├── Architecture_Principles.md    # Architectural boundaries
├── Project_Rules.md              # Project-level rules
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Self-hosting setup
└── vitest.config.ts              # Unit test config
```

---

## 4. Data Model

```
User ──────┬── Book ──────── LendingRecord
           ├── Person ────── LendingRecord
           ├── Goal
           └── UserAchievement ── Achievement
```

| Model | Key Fields |
|-------|------------|
| **User** | email, passwordHash, name, isAdmin, approved, xp, currentStreak, longestStreak, lastActiveDate, streakShieldCount |
| **Book** | isbn, title, author, coverUrl, status, rating, tags, copies, subtitle, publishers, publishDate, publishPlaces, numberOfPages, languages, isbn10/13, subjects, 17 legacy fields |
| **Person** | name (unique per user), auto-created on lending |
| **LendingRecord** | book, borrower, lentAt, returnedAt, denormalized bookTitle, personId |
| **Goal** | yearly, monthly targets per user |
| **Achievement** | key, titleKey, descriptionKey, iconKey (i18n) — 8 achievements (week/month/century streak incl.) |
| **UserAchievement** | user + achievement link with unlock date |
| **DailyActivity / StreakShield / UserSettings / PushSubscription** | streak & notification tracking |

---

## 5. Server Actions

| File | Mutations |
|-------|------------|
| `auth.ts` | register (approved=false) |
| `books.ts` | add (full metadata, one-click ISBN), update, delete, set status, lookupIsbn |
| `lending.ts` | create, return |
| `people.ts` | create, remove |
| `goals.ts` | set yearly/monthly |
| `excel.ts` | export, template, import |
| `profile.ts` | update name, change password |
| `covers.ts` | clear cache (admin) |
| `admin.ts` | approve/reject users, toggle admin, delete users |
| `locale.ts` | switch language (consent-gated) |
| `theme.ts` | toggle theme Sun/Moon SVG (light/dark, consent-gated) |
| `logout.ts` | signOut |
| `settings.ts` | update notifications/streak/weeklyDigest |
| `cookies.ts` | setConsentCookie, hasConsent |

Every data-modifying action runs `awardXp()` + `syncAchievements()`. ISBN one-click flow chains `lookupIsbnAction` → `addBook` with all Open Library fields.

---

## 6. Environment Variables

| Variable | Required | Default | Description |
|----------|---------|------------|----------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite database path |
| `NEXTAUTH_SECRET` | Yes | — | Secret for JWT signing |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | Application URL |
| `APP_PORT` | No | `3000` | Port (used by Docker) |
| `RESET_SECRET` | No | — | Secret for `/api/test/reset` endpoint |
| `ALLOW_REGISTRATION` | No | `true` | Set to `false` to disable public registration |

---

## 7. Docker Setup

```bash
# Pre-built image
docker compose up -d

# Build from source
docker compose up -d --build
```

- Build tools (python3, make, g++) are installed in production stage
- `seed.cjs` runs without tsx in Docker
- Prisma migrations are automatically run by entrypoint

---

## 8. Testing

```bash
npm test              # 97 unit tests (vitest)
npx playwright test   # 25 e2e tests (playwright)
npm run lint          # eslint
npm run format:check  # prettier
```

---

## 9. Important Commit History (Web Rewrite)

| Date | Commit | Description |
|-------|--------|----------|
| 2026-09-09 | `2.3.2` | English-only (hardcoded Turkish → English, i18n synced, locale native names kept), releases titled as "{version}" without v |
| 2026-09-09 | `2.3.1` | Settings-only theme/locale (sidebar/mobile header removed), licenses link in Settings, docs Turkish → English, book card 60/40 readable (h-[380px] object-contain) |
| 2026-09-09 | `2.3.0` | UI Design Language 60/40 card, Noto, Terracotta/Ink-Copper, collapsible sidebar, cookie consent (C), ISBN one-click + detailed form, bulk import removed, high-contrast removed, Sun/Moon SVG |
| 2026-09-08 | `768d827` | GitHub Actions removed, README updated |
| 2026-09-08 | `62ca415` | Docker build + Turbopack compatibility + TS errors fixed |
| 2026-09-07 | `d08b72e` | i18n fixes, CI/CD, admin approval system |
| 2026-09-07 | `d294650` | showOnLeaderboard opt-out added |
| 2026-09-07 | `92b4070` | Security: dangerous NEXTAUTH_SECRET removed from .env.example |
| 2026-09-07 | `df14474` | Security: Security headers added |
| 2026-09-07 | `fba642f` | Security: Conditional seeding (entrypoint) |
| 2026-09-07 | `8f6a3e6` | Security: Cookie httpOnly/secure/sameSite |
| 2026-09-07 | `a95cb3e` | Security: Zod string length limits + coverUrl validation |
| 2026-09-07 | `c76e074` | Security: auth required for lookupIsbnAction |
| 2026-09-07 | `0b16703` | Security: Zod + transaction guard for admin setup |
| 2026-09-07 | `2684f4b` | Security: ALLOW_REGISTRATION env var |
| 2026-09-07 | `a9dd777` | Security: Test reset protected with admin + token |
| 2026-09-04 | `3b530eb` | Docker build workflow (GHCR) added |
| 2026-09-04 | `c44a25d` | README and CONTRIBUTING.md rewritten |
| 2026-09-04 | `282eef1` | Prettier added |
| 2026-09-04 | `3ce6d8a` | Cover cache stats accuracy improved |
| 2026-09-04 | `59d2d6f` | Dockerignore PNG issue fixed |
| 2026-09-04 | `4d675a5` | Orphan Rust crate removed |
| 2026-09-04 | `f314a85` | Unused components and dead code removed |
| 2026-09-04 | `c2303bf` | Hardcoded database paths fixed for portability |
| 2026-09-02 | `9d85a8a` | PWA/TWA support + notifications |
| 2026-09-02 | `a5f0c2c` | GNOME Adwaita design language |
| 2026-09-02 | `a35f651` | Editorial redesign — AI template feel removed |
| 2026-09-01 | `f127944` | Warm & Literary UI redesign + shadcn/ui |
| 2026-09-01 | `e247fe7` | Favicon, error/loading states, profile page, pagination, SEO, rate limiting, unit tests |
| 2026-08-31 | `cce9700` | Playwright e2e test suite + vitest exclude |
| 2026-08-31 | `6e88849` | SQLite + rust core + legacy equiv (books, people, goals, excel, openlibrary, i18n) |

---

## 10. Known Issues and Notes

- **Turbopack + better-sqlite3:** Turbopack bundles better-sqlite3 in client components → `fs` error. Fix: `gamification-pure.ts` with pure functions separated.
- **Docker production stage:** better-sqlite3 compiles with node-gyp, requires python3/make/g++ in production stage.
- **prisma7.config.ts:** `dotenv/config` is devDependency, not available in production → removed, env var used directly.
- **seed.cjs:** TypeScript seed file (`tsx` devDependency) doesn't run in production → plain JS alternative added (`CONTRIBUTING.md` exception: `public/sw.js` + `prisma/seed.cjs`).
- **Proxy (middleware.ts):** In Next.js 16 `middleware.ts` is deprecated → `proxy.ts` is correct convention.
- **Sidebar server actions:** `setLocale.bind`/`setTheme.bind` in Client Component → React #441. Fix: `useTransition` + direct `setLocale()`/`setTheme()` calls, `logoutAction` as separate server action.
- **High Contrast:** Removed as incompatible with `UI_Design_Language.md` (GNOME residue). Theme is now only `light`/`dark` (Sun/Moon SVG, Lucide ISC).
- **Book Card 60/40:** `h-[380px]` `h-[60%]` cover `object-contain p-2` + `h-[40%]` metadata `gap-1 px-3 py-3`, `text-[15px] serif` readable. Bulk import (`importBooksByIsbn`) removed.
- **Cookie Consent:** Server/client split via `src/lib/cookies-shared.ts`; `next/headers` only on server.

---

## 11. Original Project (Legacy)

Desktop app written with PyQt6. Located in `legacy` branch.
Both projects continue under GPLv3.

---

## 12. PWA Improvements TODO

### High Priority
- [ ] **Camera ISBN barcode scan** — `html5-qrcode` with phone camera
- [x] **Safe area insets** — `env(safe-area-inset-*)` + `safe-bottom`/`safe-top` (layout, bottom-nav)
- [x] **viewport-fit=cover** — `layout.tsx:27` `viewportFit: "cover"`
- [x] **Bottom navigation bar** — `src/components/bottom-nav.tsx` + `src/components/sidebar.tsx` (Responsive Hybrid Shell)

### Medium Priority
- [ ] **Offline precaching** — Pre-cache app shell (HTML/CSS/JS) on SW install
- [ ] **Offline fallback page** — Show info page when offline instead of blank
- [ ] **Web Share API** — Share book detail via WhatsApp/email
- [ ] **True push notification** — Real push from server (currently timer-based)
- [ ] **SW update notification** — Show toast when new version arrives
- [ ] **Custom install button** — `BeforeInstallPrompt` API with custom "Install" button

### Low Priority
- [ ] **Background sync** — Offline form submission, sync when online
- [ ] **Manifest shortcuts** — Quick access from home screen (add book, lending)
- [ ] **Manifest screenshots** — Screenshots for rich install banner
- [ ] **Touch gestures** — Swipe, long-press (book status change, etc.)
- [ ] **Haptic feedback** — Vibration (Vibration API)

---

*This file provides project context for AI assistants. Should be updated regularly.*
