# KatipCelebi

> Self-hosted personal library manager with gamification.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.2.0-green.svg)](https://github.com/farukylmz0550/KatipCelebi/releases)
[![Tests](https://img.shields.io/badge/tests-92%20unit%20%7C%2026%20e2e-brightgreen.svg)]()

Track your books, lending history, reading goals, and stats — with a Duolingo-style gamification layer (XP, levels, achievements, leaderboard).

Web rewrite of the original PyQt6 desktop app ([`legacy` branch](../../tree/legacy)).

---

## Features

- **Book Management** — Add manually or by ISBN lookup (Open Library). Bulk import via ISBN list or Excel. Full-text search, filtering, sorting.
- **Lending Tracker** — Lend books, track borrowers, mark returns. Copy-aware. Auto-creates person profiles.
- **People Directory** — Contacts with trust scores and lending history.
- **Reading Stats** — Total, finished, reading, average days to finish, monthly charts.
- **Gamification** — XP (+5 add, +50 finish, +5 lend). Level up (sqrt-based). 5 achievements.
- **Leaderboard** — Top 50 ranking with pagination.
- **Goals** — Yearly and monthly reading targets with progress tracking.
- **Profiles** — Edit name, change password.
- **i18n** — 6 languages: English, Turkish, Spanish, French, Russian, Chinese.
- **Theme** — Light/dark mode toggle (cookie-based).
- **Excel** — Full library export, template download, import from Excel.
- **Admin** — Cover cache management.
- **Docker** — Self-host with a single command.

## Screenshots

| Books | Stats | Leaderboard |
|-------|-------|-------------|
| ![Books](e2e/screenshots/01-setup-login.png) | ![Stats](e2e/screenshots/08-stats.png) | ![Leaderboard](e2e/screenshots/10-leaderboard.png) |

---

## Quick Start

### Docker (recommended)

```bash
# 1. Clone
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi

# 2. Configure
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 3. Run
docker compose up -d --build

# 4. Open http://localhost:3000
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
3. Start adding books on the Books page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts |
| Database | SQLite via Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials, JWT, bcrypt) |
| Validation | Zod |
| Formatting | Prettier + ESLint |
| Testing | Vitest (unit), Playwright (e2e) |
| i18n | Cookie-based locale, 6 dictionaries |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated pages
│   │   │   ├── books/            # Book list, add, import, filters
│   │   │   │   └── [id]/         # Book detail, edit, lending, personal
│   │   │   ├── lending/          # Lending list and form
│   │   │   ├── people/           # People directory and history
│   │   │   ├── stats/            # Statistics, goals, charts
│   │   │   ├── achievements/     # Achievement badges
│   │   │   ├── leaderboard/      # XP ranking
│   │   │   ├── profile/          # Edit name, change password
│   │   │   └── admin/            # Cover cache management
│   │   ├── actions/              # Server actions (data mutations)
│   │   ├── api/                  # API routes (auth, test reset)
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── setup/                # First-time admin setup
│   ├── components/ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── books/                # Book domain logic
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── gamification.ts       # XP, levels, achievements
│   │   ├── goals.ts              # Goal math
│   │   ├── isbn.ts               # ISBN lookup
│   │   ├── person.ts             # Person normalization, trust
│   │   ├── stats.ts              # Monthly finish counts
│   │   └── theme.ts              # Cookie-based theme
│   ├── i18n/                     # Dictionaries (en, tr, es, fr, ru, zh)
│   ├── auth.ts                   # NextAuth config
│   ├── proxy.ts                  # Middleware (auth + rate limiting)
│   └── types/                    # TypeScript declarations
├── prisma/
│   ├── schema.prisma             # Data model
│   ├── seed.ts                   # Achievement catalog seed
│   └── migrations/               # Database migrations
├── e2e/                          # Playwright E2E tests
├── public/                       # Static assets (favicon, icons)
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
| **User** | email, passwordHash, name, isAdmin, xp |
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
| `auth.ts` | register |
| `books.ts` | add, import, update, delete, set status |
| `lending.ts` | create, return |
| `people.ts` | create, remove |
| `goals.ts` | set yearly/monthly |
| `excel.ts` | export, template, import |
| `profile.ts` | update name, change password |
| `covers.ts` | clear cache (admin) |
| `locale.ts` | switch language |
| `theme.ts` | toggle theme |

Every action that modifies data also runs `awardXp()` + `syncAchievements()`.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite database path |
| `NEXTAUTH_SECRET` | Yes | — | Secret for JWT signing |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | Application URL |
| `APP_PORT` | No | `3000` | Port (used by Docker) |

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
