# Changelog

All notable changes to **Book Shelf** are documented here.
From **2.9.0 onward the project is in feature-freeze**: every future release is a
PATCH (bugfix / security / performance only — no behavior, schema or feature changes).

## 2.9.0 — 2026-09-12

**Feature-freeze begins:** 2.9.0 and onward: patches only.

### Fixed

- **AppSettings singleton race** — admin settings update used a non-atomic
  `deleteMany` + `create`; two concurrent updates could leave two rows. The
  table is now a fixed singleton row (`id = 'singleton'`) written with a single
  atomic `upsert`; reads use the fixed id. Migration
  `20260912130000_appsettings_singleton_id` collapses any pre-existing duplicate
  rows and pins the surviving row's id — existing settings values are preserved.
- **Page-log double XP / lost progress** — `logPagesRead` overwrote
  `currentPage` from a stale read and awarded XP unconditionally, so a
  double-tap (or two devices) could award XP twice while one write was silently
  lost. The write is now an optimistic lock (`updateMany` matching the read
  `currentPage`); on conflict the call returns
  `{ ok: false, error: "Conflict, please retry" }` and awards nothing. The
  auto-finish branch gained the same lock plus a `status != FINISHED` guard so
  a concurrent duplicate can never add a second read event or second finish XP.
- **Finish XP idempotency guard** — `finishBookWithXp` now re-verifies
  ownership + `FINISHED` status fresh from the DB and holds a short (10 s)
  in-process claim per book, so a duplicate invocation right after a
  legitimate finish awards nothing. Re-read flows are unaffected.
- **Group order race** — `createGroup` computed the new group's `order` from a
  non-atomic max-read; the aggregate + create now run inside one transaction.

### Security

- Dependency supply-chain pass — `npm audit` reports **0 vulnerabilities**:
  - `mysql2` → `^3.24.4` via `overrides` (GHSA-3f6p-5ww8-9rcr, GHSA-rgwj-5xj2-c3m3 — high; pulled by the Prisma CLI's unused MySQL driver)
  - `deepmerge-ts` → `^8.0.2` via `overrides` (GHSA-ggr8-5vv4-36mx — high; via `@prisma/config`)
  - `uuid` → `^11.1.1` via `overrides` (GHSA-w5hq-g745-h8pq — moderate; via exceljs)
  - `prisma` stays on 7.10.0 (latest 7.x; no patched 7.x exists and a 6.x
    downgrade would break the current schema), `exceljs` stays on 4.4.0
    (no newer release).

## 2.8.0 — 2026-09-12

- **Groups / Shelves** — first-class personal grouping: create/rename/delete/
  reorder groups with optional colors, many-to-many book membership,
  dedicated `/groups/[id]` grid views, group filter on the main Books page
  (AND semantics with tags/status/search), book-detail membership chips,
  ownership-scoped actions, 6-language i18n.

## 2.7.0 — 2026-09-11

- Annual Reading Summary (Jan 1–7 window, read-event metrics, PNG share card,
  CC0 mood music), reading rules (page-log button, auto-FINISH at all pages
  read, re-read counting, early-finish block), yearly goal lock, goal-progress
  push notifications, admin-editable AppSettings.

## 2.6.0 — 2026-09-11

- Goodreads CSV import (ISBN13-first, shelf→status/tags mapping, Open Library
  enrichment).
