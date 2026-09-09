<div align="center">

<img src="public/icon.svg" width="80" height="80" alt="KatipCelebi" />

# KatipCelebi™

**Your warm, calm, timeless personal library.**

*Terracotta × Dusty Rose · Ink & Copper · Noto Serif/Sans · 60/40 physical cards*

[![Version](https://img.shields.io/badge/version-2.3.2-EAD6D0?style=flat-square&labelColor=2B2727&color=A25F4C)](https://github.com/farukylmz0550/KatipCelebi/releases)
[![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fkatipcelebi-272A29?style=flat-square&logo=docker&labelColor=1D2020&color=C17A5E)](https://ghcr.io/farukylmz0550/katipcelebi)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

*Self-hosted · Private · No tracking · Your books, your data.*

[Features](#features) · [Screenshots](#screenshots) · [Quick Start](#quick-start) · [Tech Stack](#tech-stack) · [Design](#design)

</div>

---

> **KatipCelebi™** — Kişisel dijital kütüphane deneyimi. Kitaplarınızı, ödünç geçmişini, hedeflerinizi ve istatistiklerinizi **sıcak, sakin, zamanın ötesinde** bir arayüzde takip edin. Duolingo tarzı oyunlaştırma ile.

Web rewrite of the original PyQt6 desktop app — [`legacy` branch](../../tree/legacy).

---

## ✨ Features

| | Capability |
|---|---|
| 📚 **Library** | One-click ISBN (Open Library, full metadata: publishers, dates, languages, subjects, ISBN10/13) + detailed manual form (arrow → 14 fields) · Card/List toggle · Excel import/export |
| 🎴 **Cards** | Equal `h-[380px]` **60% cover / 40% meta** · `object-contain` · 12px radius · `2→3→4` responsive grid |
| 🤝 **Lending** | Lend / return, copy-aware, auto Person creation |
| 👥 **People** | Trust scores + lending history |
| 📊 **Stats** | Total/finished/reading, avg days, monthly chart, streak widget, heatmap |
| 🎮 **Gamification** | XP +5 add / +50 finish / +5 lend (+page & streak bonus) · Fibonacci level · 8 achievements |
| 🏆 **Leaderboard** | Top ranking, opt-out |
| 🎯 **Goals** | Yearly / monthly targets |
| 👤 **Profile** | Name, password, XP, join date |
| 🌍 **i18n** | 6 languages (EN/TR/ES/FR/RU/ZH) — cookie, `src/i18n/dictionaries` |
| 🌓 **Theme** | Light ` #E5D9D4 / #A25F4C` · Dark ` #1D2020 / #C17A5E` · Noto · Sun/Moon SVG · Settings-only |
| 🍪 **Consent** | GDPR banner — desktop modal + mobile bar (Essential/Preferences/Analytics) |
| 🖥️ **Shell** | Collapsible sidebar (desktop, `sidebar-collapsed` cookie) + bottom nav (mobile) · `viewport-fit=cover` · safe-area |
| 📦 **PWA** | `manifest.json` shortcuts · `sw.js` · install prompt |
| 🔐 **Admin** | Approve/reject, promote/demote, delete users + cover cache (bottom of sidebar) |
| 🐳 **Docker** | `ghcr.io/farukylmz0550/katipcelebi` — one command |

---

## 📸 Screenshots

<div align="center">

| Books — Card & List | Stats — Level & Goals | Leaderboard |
|---|---|---|
| <img src="e2e/screenshots/01-setup-login.png" width="320" style="border-radius:12px; border:1px solid #CCBDB8" /> | <img src="e2e/screenshots/08-stats.png" width="320" style="border-radius:12px; border:1px solid #CCBDB8" /> | <img src="e2e/screenshots/10-leaderboard.png" width="320" style="border-radius:12px; border:1px solid #CCBDB8" /> |
| *60/40 cards · 2→4 cols* | *Monthly chart · Streak* | *Top ranking* |

*Full flow: `npx playwright test e2e/manual-gui.spec.ts` → `e2e/screenshots/` (12 images)*

</div>

---

## 🎨 Design

**Character:** Classic · Academic · Cozy Library · Warm · Timeless — *"This is my library, and I like being here."*

| Theme | Background | Surface | Elevated | Accent | Text |
|---|---|---|---|---|---|
| **Light** Terracotta × Dusty Rose | `#E5D9D4` | `#F0E4DF` | `#FDF7F3` | `#A25F4C` | `#2B2727` |
| **Dark** Ink & Copper | `#1D2020` | `#272A29` | `#333735` | `#C17A5E` | `#F2EEE8` |

- **Typography:** Noto Serif (titles) · Noto Sans (ui) · Noto Mono (technical)
- **Cards:** Identical geometry, `rounded-[12px]`, subtle `border-strong` + `shadow-sm` on hover — no drag-drop
- **Sources:** `UI_Design_Language.md` · `Architecture_Principles.md` · `Project_Rules.md`

---

## 🚀 Quick Start

### Docker — pre-built (easiest)

```bash
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

echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env
docker compose up -d
# → http://localhost:1024
```

### Build from source

```bash
git clone https://github.com/farukylmz0550/KatipCelebi.git
cd KatipCelebi
cp .env.example .env  # set NEXTAUTH_SECRET=$(openssl rand -base64 32)
docker compose up -d --build
```

### Local dev

```bash
git clone https://github.com/farukylmz0550/KatipCelebi.git && cd KatipCelebi
npm install
npx prisma migrate dev
npm run db:seed
npm run dev  # → http://localhost:3000
```

**First run:** `/setup` → create admin → `/login` → approval at `/admin/users` → add books.

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript `strict` |
| UI | Tailwind 4 · shadcn/ui · lucide-react (Sun/Moon ISC) · Recharts · Noto |
| DB | SQLite · Prisma 7 (`better-sqlite3`) |
| Auth | NextAuth v5 (Credentials/JWT/bcrypt, approval guard) |
| Validation | Zod (trim, max, url) |
| Format | Prettier + ESLint (`flat` + `prettier`) |
| Test | Vitest 97 unit · Playwright 25 e2e |
| i18n | Cookie locale, 6 dicts |
| Theme | Cookie `light/dark` (consent-gated) |
| PWA | `sw.js` + `manifest.json` + `sw-register.tsx` |
| Deploy | Docker multi-stage · GHCR |

---

## 📁 Project Structure

<details>
<summary>Click to expand</summary>

```
katipcelebi/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── books/            # Card/List toggle · ISBN one-click + detailed arrow · filters · Excel
│   │   │   │   ├── books-add-section.tsx
│   │   │   │   ├── book-card.tsx          # h-[380px] 60/40 object-contain
│   │   │   │   ├── books-grid.tsx
│   │   │   │   └── [id]/                 # detail / edit / lending / personal
│   │   │   ├── lending/ · people/ · stats/ · achievements/ · leaderboard/ · profile/ · settings/ · more/ · admin/
│   │   │   └── layout.tsx        # Hybrid shell: sidebar (desktop) + bottom-nav (mobile)
│   │   ├── actions/              # books/lending/people/goals/excel/profile/covers/admin/locale/theme/logout/settings/cookies
│   │   ├── api/                  # auth / test/reset / streak / well-known
│   │   └── login/register/setup/
│   ├── components/
│   │   ├── ui/                   # shadcn (token-aware)
│   │   ├── sidebar.tsx           # collapsible, cookie sidebar-collapsed
│   │   ├── bottom-nav.tsx        # safe-area
│   │   ├── cookie-consent.tsx    # desktop modal / mobile bar
│   │   └── theme-dropdown.tsx    # Sun/Moon
│   ├── lib/
│   │   ├── books/ · cookies* · isbn.ts (full meta) · gamification-pure.ts (Fibonacci) · streak.ts
│   │   └── theme.ts              # light/dark only
│   └── i18n/  auth.ts  proxy.ts
├── prisma/  schema.prisma  seed.ts/cjs  migrations/
├── e2e/  *.spec.ts  screenshots/
├── public/  sw.js  manifest.json  icon.svg
├── UI_Design_Language.md  Architecture_Principles.md  Project_Rules.md
├── Dockerfile  docker-compose.yml  vitest.config.ts
```

</details>

---

## 🗃️ Data Model

```
User ──────┬── Book ──────── LendingRecord
           ├── Person ────── LendingRecord
           ├── Goal
           └── UserAchievement ── Achievement
```

| Model | Key fields |
|---|---|
| **User** | email, passwordHash, name, isAdmin, approved, xp, streak |
| **Book** | isbn/title/author/coverUrl/status/rating/tags/copies + subtitle/publishers/publishDate/publishPlaces/edition/series/pages/languages/isbn10/13/subjects (full Open Library) |
| **Person** | name (unique per user) |
| **LendingRecord** | book, borrower, lentAt, returnedAt, bookTitle, personId |
| **Goal / Achievement / UserAchievement** | yearly/monthly, 8 achievements |

---

## 🔧 Server Actions

All mutations via `src/app/actions/` — `awardXp()` + `syncAchievements()` after:

| File | Mutations |
|---|---|
| `books` | `add` (full meta) · `update` · `delete` · `setStatus` · `lookupIsbn` (one-click) |
| `lending` | `create` · `return` |
| `people` | `create` · `remove` |
| `goals` | `set yearly/monthly` |
| `excel` | `export` · `template` · `import` |
| `profile` | `updateName` · `changePassword` |
| `admin` | `approve/reject` · `toggleAdmin` · `deleteUser` |
| `locale` / `theme` | `switch` (consent-gated, Settings-only) |
| `settings` / `cookies` | `updateSettings` · `setConsentCookie` |

---

## 🔑 Environment

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite path |
| `NEXTAUTH_SECRET` | Yes | — | JWT secret |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | App URL |
| `APP_PORT` | No | `3000` | Docker port |
| `RESET_SECRET` | No | — | `/api/test/reset` |
| `ALLOW_REGISTRATION` | No | `true` | `false` to disable public sign-up |

---

## ✅ Testing

```bash
npm test              # 97 unit (vitest)
npx playwright test   # 25 e2e (chromium, webServer: npm run dev)
npm run lint
npm run format:check
```

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) — TypeScript strict, Prettier 120 width, Conventional Commits, `npm run lint && npm run format:check && npm test` before push.

---

## 📄 License

**GPLv3** — Only source code is licensed under the GPLV3 license

**CC-BY-NC-ND** — The KatipCelebi™ logo, brand assets, and all materials contained within the brand set directory are licensed under the CC BY-NC-ND 4.0 license.

**KatipCelebi™** — is an unregistered trademark that identifies the KatipCelebi™ project and the brand associated with the project.

**The KatipCelebi™ name, logo, and brand identity are not licensed under the GNU GPLv3.** Use of the KatipCelebi™ source code under the GNU GPLv3 does not grant any trademark rights to use the KatipCelebi™ name or brand identity.

Forked and modified versions of the software may be used and distributed under the terms of the GNU GPLv3. However, unless separate permission to use the KatipCelebi™ trademark is granted, such versions must use a different project name and brand identity.

The KatipCelebi name or logo must not be used in a way that creates the impression that a project is approved, supported, endorsed, or officially associated with KatipCelebi™.

<div align="center">

*Cozy Library + Personal Collection · Clarity before decoration.*

**[⬆ back to top](#katipcelebi)**

</div>
