# Development Log — KatipCelebi

> Created: 2026-09-01 21:30 (Europe/Istanbul)  
> Rule: `git commit` + `git push` after every logical step (RULES.md)

## 1. Phased Reading (7 Phases, Sequential)

### Phase 1 — Root Meta
- **Files:** `package.json`, `README.md`, `next.config.ts`, `tsconfig.json`, `AGENTS.md`, `.env.example`
- **Stack:** Node v22, Fedora 44, `node_modules` present

### Phase 2 — Data Model
- **Files:** `prisma/schema.prisma`, `prisma/seed.ts`, migrations
- **Stack:** `better-sqlite3` + `@prisma/adapter-better-sqlite3`

### Phase 3 — Pure Lib
- **Files:** `src/lib/gamification.ts`, `stats.ts`, `goals.ts`, `person.ts`, `isbn.ts`, `src/lib/books/*`
- **Tests:** `npx vitest run --exclude e2e` → 6/6 passed

### Phase 4 — Auth / Session / Middleware
- **Files:** `src/lib/db.ts`, `src/auth.ts`, `src/lib/session.ts`, `src/lib/setup.ts`, `src/proxy.ts`, `src/lib/theme.ts`

### Phase 5 — Server Actions
- **Files:** `src/app/actions/books.ts`, `lending.ts`, `excel.ts`, `goals.ts`, `people.ts`, `covers.ts`, `auth.ts`, `setup.ts`, `locale.ts`, `theme.ts`

### Phase 6 — App Router
- **Files:** `src/app/layout.tsx`, `page.tsx`, login/register/setup, `(dashboard)/*`, `src/app/api/*`

### Phase 7 — i18n / Docker
- **Files:** `src/i18n/*`, `Dockerfile`, `docker-compose.yml`, `vitest.config.ts`, `eslint.config.mjs`

## 2. Git Operations (After Every Logical Step)

| Commit | Message |
|---|---|
| `cce9700` | test: add playwright e2e suite + vitest exclude |
| `5a619c8` | docs: save workflow rule |
| `e4e275e` | fix: e2e reset race |
| `43622ff` | fix: allow /api/test/reset without auth |
| `59a1315` | fix: robust test reset |
| `0ba33dd` | fix: make manual e2e self-contained |
| `40aeb39` | fix: e2e reset add 800ms wait |
| `e95b9d9` | fix: e2e flakiness |

## 3. Test Infrastructure

- **Vitest:** `npx vitest run --exclude e2e` → 6/6 passed
- **Playwright:** 26 e2e tests, base URL localhost:3000

## 4. Server and Manual Verification

- **Server:** `npx next dev -p 3000`, curl checks, POST /api/test/reset
- **Manual:** /setup → admin creation, /login → /books, header, lending, stats, achievements, leaderboard, admin

---
*Log end. All steps committed+pushed per RULES.md.*
