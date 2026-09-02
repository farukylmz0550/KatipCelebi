# KatipCelebi

Track your books, lending history, reading goals, and stats — self-hosted, multi-user,
with a Duolingo-style gamification layer (XP, levels, achievements, leaderboard).

Web rewrite of the original PyQt6 desktop app (preserved on the [`legacy`](../../tree/legacy) branch).

---

## Features

- **Book Management** — Add books manually or look up by ISBN (Open Library API). Bulk import via ISBN list or Excel file. Full-text search, filtering (status, rating, tags, signed, lent), sorting.
- **Lending Tracker** — Lend books to people, track who has what, mark returns. Copy-aware (respects multiple copies). Auto-creates person profiles.
- **People Directory** — Manage contacts, see trust scores (returned - outstanding), full lending history per person.
- **Reading Stats** — Total books, finished, reading, average days to finish, monthly chart (Recharts).
- **Gamification** — Earn XP for adding books (+5), finishing (+50), lending (+5). Level up (sqrt-based). Unlock 5 achievements.
- **Leaderboard** — See who reads the most. Top 50 ranking with pagination.
- **Goals** — Set yearly and monthly reading targets, track progress.
- **Profiles** — Edit name, change password.
- **i18n** — 6 languages: English, Turkish, Spanish, French, Russian, Chinese.
- **Theme** — Light/dark mode toggle (cookie-based).
- **Excel Export/Import** — Full library export to Excel, template download, import from Excel.
- **Admin** — Cover cache management.
- **Docker** — Self-host with a single command.

## Screenshots

| Books | Stats | Leaderboard |
|-------|-------|-------------|
| ![Books](e2e/screenshots/01-setup-login.png) | ![Stats](e2e/screenshots/08-stats.png) | ![Leaderboard](e2e/screenshots/10-leaderboard.png) |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Recharts |
| Database | SQLite via Prisma 7 (`better-sqlite3` driver adapter) |
| Auth | NextAuth v5 (Credentials provider, JWT, bcrypt) |
| Validation | Zod |
| Testing | Vitest (unit), Playwright (e2e) |
| i18n | Cookie-based locale switching, 6 dictionaries |
| Deployment | Docker, Docker Compose |

---

## Baby Mode — Step by Step

> This section explains **exactly** how everything works, step by step, with zero assumed knowledge.

### What is this app?

KatipCelebi is a **personal library manager**. You can:
- Add books you own or want to read
- Track which books you've lent to friends
- See reading statistics and goals
- Earn XP and level up like a video game

### How to run it

#### Option A: Docker (easiest)

```bash
# 1. Clone the repo
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi

# 2. Create your .env file
cp .env.example .env

# 3. Generate a secret key (copy the output)
openssl rand -base64 32

# 4. Paste the secret into .env as NEXTAUTH_SECRET
#    Also set POSTGRES_PASSWORD to anything you want

# 5. Start the app
docker compose up -d --build

# 6. Open http://localhost:3000
```

#### Option B: Local development

```bash
# 1. Clone the repo
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi

# 2. Install Node.js 22+ (if you don't have it)
#    Visit https://nodejs.org or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22

# 3. Install dependencies
npm install

# 4. Set up the database
#    Option A: Use local SQLite (default, no setup needed)
#    Option B: Use PostgreSQL:
#    npx prisma dev -d
#    Then edit .env: DATABASE_URL="postgresql://user:pass@localhost:5432/katipcelebi"

# 5. Run migrations
npx prisma migrate dev

# 6. Seed the achievement catalog
npm run db:seed

# 7. Start the dev server
npm run dev

# 8. Open http://localhost:3000
```

### First time setup

1. Open `http://localhost:3000`
2. You'll be redirected to `/setup` (because no users exist yet)
3. Create the **admin account** (name, email, password — min 8 chars)
4. You're redirected to `/login` — log in with your new account
5. You're on the **Books** page — add your first book!

### How to add a book

1. Go to **Books** page
2. **Option A — ISBN lookup:**
   - Type an ISBN (e.g., `9780134685991`) in the ISBN field
   - Click **Look up** — the app fetches title, author, cover from Open Library
   - Click **Add**
3. **Option B — Manual:**
   - Type the title and author directly
   - Click **Add**
4. **Option C — Bulk import:**
   - Type multiple ISBNs (one per line) in the bulk import textarea
   - Click **Import** — all books are fetched and added at once

### How to lend a book

1. Go to **Lending** page
2. Select a book from the dropdown
3. Type the borrower's name
4. Click **Lend**
5. The book appears in the lending list as "out"
6. When they return it, click **Mark returned**

### How to see your stats

1. Go to **Stats** page
2. See: total books, finished, reading, level, XP
3. See: average days to finish a book
4. See: monthly chart of books finished
5. Set yearly/monthly goals and track progress

### How gamification works

- **Add a book** → +5 XP
- **Finish a book** → +50 XP
- **Lend a book** → +5 XP
- **Level up** → Every sqrt(XP/50) + 1 levels
- **Achievements:**
  - First Book — Add your first book
  - Bookworm Beginnings — Finish your first book
  - Avid Reader — Finish 10 books
  - Generous Reader — Lend your first book
  - Well Read — Read books from 5 different authors

### How to change language

Click the language button in the top-right corner of the navbar. Cycles through: EN → TR → ES → FR → RU → ZH.

### How to change theme

Click the sun/moon icon in the top-right corner of the navbar.

### How to run tests

```bash
# Unit tests (vitest)
npm test

# E2E tests (playwright)
npx playwright install chromium    # first time only
npx playwright test

# Lint
npm run lint
```

---

## Project Layout

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated pages
│   │   │   ├── books/            # Book list, add, import, grid, filters
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
│   ├── components/ui/            # shadcn/ui components (Button, Input, Card, etc.)
│   ├── lib/
│   │   ├── books/                # Book domain logic (model, filters, tags, reading, excel, openlibrary)
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── gamification.ts       # XP, levels, achievements
│   │   ├── goals.ts              # Goal math
│   │   ├── isbn.ts               # ISBN lookup
│   │   ├── person.ts             # Person normalization, trust
│   │   ├── stats.ts              # Monthly finish counts
│   │   └── theme.ts              # Cookie-based theme
│   ├── i18n/                     # Dictionaries (en, tr, es, fr, ru, zh)
│   ├── auth.ts                   # NextAuth config
│   ├── middleware.ts              # Rate limiting
│   └── types/                    # TypeScript declarations
├── prisma/
│   ├── schema.prisma             # Data model
│   ├── seed.ts                   # Achievement catalog seed
│   └── migrations/               # Database migrations
├── e2e/                          # Playwright E2E tests
├── public/                       # Static assets (favicon, logo)
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Self-hosting setup
└── vitest.config.ts              # Unit test config
```

## Data Model

```
User ──────┬── Book ──────── LendingRecord
           ├── Person ────── LendingRecord
           ├── Goal
           └── UserAchievement ── Achievement
```

- **User** — email, password, name, isAdmin, xp
- **Book** — isbn, title, author, cover, status (TO_READ/READING/FINISHED), 17 legacy fields, rating, tags, notes, copies
- **Person** — name (unique per user), auto-created on lending
- **LendingRecord** — book, borrower, dates, denormalized bookTitle
- **Goal** — yearly/monthly targets per user
- **Achievement** — static catalog (5 achievements, i18n keys)
- **UserAchievement** — user + achievement link with unlock date

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/test/reset` | POST | Reset DB (dev only, 403 in prod) |

## Server Actions

All data mutations go through server actions in `src/app/actions/`:
- `auth.ts` — register
- `books.ts` — add, import, update, delete, set status
- `lending.ts` — create, return
- `people.ts` — create, remove
- `goals.ts` — set yearly/monthly goals
- `excel.ts` — export, template, import
- `profile.ts` — update name, change password
- `covers.ts` — clear cache (admin)
- `locale.ts` — switch language
- `theme.ts` — toggle theme

Every action that modifies data also runs `awardXp()` + `syncAchievements()`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | Database connection string |
| `NEXTAUTH_SECRET` | Yes | — | Secret for JWT signing |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | App URL |
| `APP_PORT` | No | `3000` | Port (Docker) |

## Running Tests

```bash
npm test              # 92 unit tests (vitest)
npx playwright test   # 26 e2e tests (playwright)
npm run lint          # eslint
```

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE). Same license as the original desktop app; this rewrite continues under the same terms.
