# KatipCelebi

Track your books, lending history, reading goals, and stats — self-hosted, multi-user,
with a Duolingo-style gamification layer (XP, levels, achievements, leaderboard).

Web rewrite of the original PyQt6 desktop app (preserved on the [`legacy`](../../tree/legacy) branch).

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL via Prisma (driver adapter, `@prisma/adapter-pg`)
- NextAuth (credentials-based auth)
- Open Library API for ISBN lookup

## Self-hosting (Docker Compose)

1. `cp .env.example .env` and fill in `POSTGRES_PASSWORD` and `NEXTAUTH_SECRET`
   (`openssl rand -base64 32` for the latter).
2. `docker compose up -d --build`

The app runs migrations and seeds the achievement catalog on startup, then
serves on `http://localhost:3000` (or `APP_PORT` if set).

## Local development

Requires Node.js 22+ and a Postgres instance.

```bash
npm install
npx prisma dev -d          # local Postgres, or point DATABASE_URL at your own
npx prisma migrate dev
npm run db:seed
npm run dev
```

```bash
npm test                   # vitest
npm run lint
```

## Project layout

- `src/lib/` — pure/composable domain logic (db client, auth, gamification rules, ISBN lookup, stats)
- `src/app/actions/` — server actions (the only place that mutates data)
- `src/app/(dashboard)/` — authenticated pages: books, lending, stats, achievements, leaderboard
- `src/i18n/` — dictionaries (`en`, `tr` for now); switch locale from the nav bar
- `prisma/schema.prisma` — data model; `prisma/seed.ts` seeds the achievement catalog

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE). Same license as the
original desktop app; this rewrite continues under the same terms.
