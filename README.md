# KatipCelebi

> Self-hosted personal library manager with gamification.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.3.1-green.svg)](https://github.com/farukylmz0550/KatipCelebi/releases)
[![Docker](https://img.shields.io/badge/docker-ghcr.io%2Ffarukylmz0550%2Fkatipcelebi-blue?logo=docker)](https://ghcr.io/farukylmz0550/katipcelebi)

Kişisel dijital kütüphane deneyimi — kitaplarınızı, ödünç geçmişini, okuma hedeflerinizi ve istatistiklerinizi, sıcak, sakin, zamanın ötesinde bir arayüzde takip edin. Noto Serif/Sans tipografisi, Terracotta/Dusty Rose & Ink & Copper paleti ve eşit boyutlu fiziksel kitap kartları ile.

Web rewrite of the original PyQt6 desktop app ([`legacy` branch](../../tree/legacy)).

---

## Features

- **Book Management** — Add manually (detailed form) or by ISBN lookup (Open Library) — one-click add with full metadata (publishers, dates, languages, subjects, ISBN10/13). Excel import/export. Full-text search, filtering, Card/List views, sorting.
- **Book Cards** — Equal-sized physical cards (60% cover, 40% metadata), 12px radius, Noto Serif/Sans, `object-contain` covers. Responsive grid (2→3→4 cols).
- **Lending Tracker** — Lend books, track borrowers, mark returns. Copy-aware. Auto-creates person profiles.
- **People Directory** — Contacts with trust scores and lending history.
- **Reading Stats** — Total, finished, reading, average days to finish, monthly charts, streak widget, activity heatmap.
- **Gamification** — XP (+5 add, +50 finish, +5 lend, page-bonus & streak multiplier). Level up (Fibonacci). 8 achievements (incl. week/month/century streak).
- **Leaderboard** — Top ranking with pagination, opt-out via profile.
- **Goals** — Yearly and monthly reading targets with progress tracking.
- **Profiles** — Edit name, change password, XP & join date.
- **i18n** — 6 languages: English, Turkish, Spanish, French, Russian, Chinese (cookie-based).
- **Theme** — Light (Terracotta × Dusty Rose `#E5D9D4/#A25F4C`) / Dark (Ink & Copper `#1D2020/#C17A5E`) — Noto fonts, cookie-based, Sun/Moon SVG toggle.
- **Cookie Consent** — GDPR-compliant banner (desktop modal + mobile bottom bar), categories: Essential/Preferences/Analytics, respects `cookie-consent` cookie.
- **Layout** — Responsive Hybrid Shell: collapsible sidebar (desktop, cookie `sidebar-collapsed`) + bottom nav (mobile), safe-area insets, `viewport-fit=cover`.
- **Excel** — Full library export, template download, import from Excel.
- **Admin** — User management (approve/reject registrations, promote/demote admins, delete users) at bottom of sidebar; cover cache management.
- **PWA** — `manifest.json` shortcuts, `sw.js` offline cache, install prompt, push-ready.
- **Docker** — Self-host with a single command (`ghcr.io/farukylmz0550/katipcelebi`).

## Screenshots

| Books | Stats | Leaderboard |
|-------|-------|-------------|
| ![Books](e2e/screenshots/01-setup-login.png) | ![Stats](e2e/screenshots/08-stats.png) | ![Leaderboard](e2e/screenshots/10-leaderboard.png) |

---

## Quick Start

### Docker (recommended)

**Option A — Pre-built image (easiest):**

```bash
# 1. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  app:
    image: ghcr.io/farukylmz0550/katipcelebi:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: file:/data/katipcelebi.db
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
    ports:
      - "${APP_PORT:-1024}:3000"
    volumes:
      - app-data:/data
volumes:
  app-data:
EOF

# 2. Create .env
echo 'NEXTAUTH_SECRET=$(openssl rand -base64 32)' > .env

# 3. Run
docker compose up -d

# 4. Open http://localhost:1024
```

**Option B — Build from source:**

```bash
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi
cp .env.example .env
# Edit .env: set NEXTAUTH_SECRET=$(openssl rand -base64 32)
docker compose up -d --build
```

### Local Development

```bash
# 1. Clone
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi

# 2. Install
npm install

# 3. Setup database
npx prisma migrate dev
npm run db:seed

# 4. Run
npm run dev

# 5. Open http://localhost:3000
```

### First Time Setup

1. Open `/setup` — create the admin account (name, email, password)
2. Redirected to `/login` — log in
3. New registrations require admin approval at `/admin/users`
4. Start adding books on the Books page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts, Noto Serif/Sans/Mono |
| Database | SQLite via Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials, JWT, bcrypt) |
| Validation | Zod |
| Formatting | Prettier + ESLint |
| Testing | Vitest (unit), Playwright (e2e) |
| i18n | Cookie-based locale, 6 dictionaries (`src/i18n/dictionaries`) |
| Theme | Cookie-based (light/dark), consent-gated, CSS variables per `UI_Design_Language.md` |
| PWA | `public/sw.js` + `manifest.json` + `src/app/sw-register.tsx` |
| Deployment | Docker (multi-stage), Docker Compose, GHCR |

---

## Project Structure

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── books/            # Book list (Card/List toggle), add (ISBN one-click + detailed), filters, Excel
│   │   │   │   ├── books-add-section.tsx  # Arrow → detailed form (60% cover / 40% meta)
│   │   │   │   ├── book-card.tsx          # Equal cards h-[380px] 60/40, object-contain
│   │   │   │   ├── books-grid.tsx         # Responsive 2→3→4 + view-mode cookie
│   │   │   │   └── [id]/                  # Book detail, edit, lending, personal
│   │   │   ├── lending/          # Lending list and form
│   │   │   ├── people/           # People directory and history
│   │   │   ├── stats/            # Statistics, goals, charts, streak, heatmap
│   │   │   ├── achievements/     # Achievement badges (grid)
│   │   │   ├── leaderboard/      # XP ranking
│   │   │   ├── profile/          # Edit name, change password
│   │   │   ├── settings/         # Notifications + theme (Sun/Moon SVG)
│   │   │   ├── more/             # Bottom-nav overflow (Achievements, Leaderboard, etc.)
│   │   │   └── admin/            # Admin pages (users, covers) — bottom of sidebar
│   │   ├── actions/              # Server actions (books, lending, people, goals, excel, profile, covers, admin, locale, theme, logout)
│   │   ├── api/                  # API routes (auth, test reset, streak, well-known)
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── setup/                # First-time admin setup
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (button, input, card, etc. — token-aware)
│   │   ├── sidebar.tsx           # Collapsible sidebar (desktop, cookie sidebar-collapsed)
│   │   ├── bottom-nav.tsx        # Bottom nav (mobile, safe-area)
│   │   ├── cookie-consent.tsx    # GDPR banner (desktop modal / mobile bar)
│   │   ├── install-prompt.tsx    # PWA install prompt
│   │   └── theme-dropdown.tsx    # Sun/Moon SVG (Lucide ISC)
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
│   │   ├── streak.ts             # Streak calc
│   │   └── theme.ts              # Cookie theme (light/dark)
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
├── public/                       # Static assets, sw.js, manifest.json
├── UI_Design_Language.md         # Visual language source of truth
├── Architecture_Principles.md    # Architectural boundaries
├── Project_Rules.md              # Project-level rules
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Self-hosting setup
└── vitest.config.ts              # Unit test config
```

---

## Data Model

```
User ──────┬── Book ──────── LendingRecord
           ├── Person ────── LendingRecord
           ├── Goal
           └── UserAchievement ── Achievement
```

| Model | Key Fields |
|-------|-----------|
| **User** | email, passwordHash, name, isAdmin, approved, xp |
| **Book** | isbn, title, author, coverUrl, status, rating, tags, copies, 17 legacy fields |
| **Person** | name (unique per user), auto-created on lending |
| **LendingRecord** | book, borrower, lentAt, returnedAt, denormalized bookTitle |
| **Goal** | yearly, monthly targets per user |
| **Achievement** | key, titleKey, descriptionKey, iconKey (i18n) |
| **UserAchievement** | user + achievement link with unlock date |

---

## Server Actions

All data mutations go through server actions in `src/app/actions/`:

| File | Mutations |
|------|-----------|
| `auth.ts` | register (sets approved=false) |
| `books.ts` | add (full metadata), update, delete, set status, lookupIsbn (one-click) |
| `lending.ts` | create, return |
| `people.ts` | create, remove |
| `goals.ts` | set yearly/monthly |
| `excel.ts` | export, template, import |
| `profile.ts` | update name, change password |
| `covers.ts` | clear cache (admin) |
| `admin.ts` | approve/reject users, toggle admin, delete users |
| `locale.ts` | switch language (consent-gated) |
| `theme.ts` | toggle theme (Sun/Moon SVG, consent-gated, light/dark only) |
| `logout.ts` | signOut (redirectTo /login) |
| `settings.ts` | update notifications/streak/weeklyDigest |
| `cookies.ts` | setConsentCookie, hasConsent |

Every action that modifies data also runs `awardXp()` + `syncAchievements()`.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite database path |
| `NEXTAUTH_SECRET` | Yes | — | Secret for JWT signing |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | Application URL |
| `APP_PORT` | No | `3000` | Port (used by Docker) |
| `RESET_SECRET` | No | — | Secret for `/api/test/reset` endpoint |
| `ALLOW_REGISTRATION` | No | `true` | Set to `false` to disable public registration |

---

## Testing

```bash
npm test              # 92 unit tests (vitest)
npx playwright test   # 26 e2e tests (playwright)
npm run lint          # eslint
npm run format:check  # prettier
```

---

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, git workflow, and PR guidelines.

---

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE). Same license as the original desktop app; this rewrite continues under the same terms.
