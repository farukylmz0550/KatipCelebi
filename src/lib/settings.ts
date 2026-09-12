// AppSettings (v2.7.0) — singleton site settings editable by the system admin.
// Resolution order: DB row (admin edits) → env defaults → code defaults.
// Pure defaults/env reading is separated so tests can exercise the pure part.

import { db } from "@/lib/db";

export type AppSettingsValues = {
  /** Pages credited by one "I read N pages" click. */
  pagesPerReadEvent: number;
  xpBookAdded: number;
  xpBookFinishedBase: number;
  xpPagesPer10: number;
  xpLending: number;
  xpPerLevelBase: number;
};

/** Fixed singleton row id (v2.9.0) — writes are one upsert, never delete+create. */
export const APP_SETTINGS_ID = "singleton";

function envInt(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

/** Code + env defaults (no DB row). Pure over process.env. */
export function defaultAppSettings(env: NodeJS.ProcessEnv = process.env): AppSettingsValues {
  return {
    pagesPerReadEvent: envInt(env, "READ_EVENT_PAGES", 20),
    xpBookAdded: envInt(env, "XP_BOOK_ADDED", 5),
    xpBookFinishedBase: envInt(env, "XP_BOOK_FINISHED_BASE", 50),
    xpPagesPer10: envInt(env, "XP_PAGES_PER_10", 3),
    xpLending: envInt(env, "XP_LENDING", 5),
    xpPerLevelBase: envInt(env, "XP_PER_LEVEL_BASE", 100),
  };
}

/** Clamp a settings value into a sane range (1..100000). */
export function clampSetting(value: number): number {
  const parsed = Math.floor(Number(value));
  if (Number.isNaN(parsed)) return 1;
  return Math.min(1_000_000, Math.max(1, parsed));
}

// Short in-memory cache so actions don't re-query settings on every call.
const CACHE_TTL_MS = 60_000;
let cache: { values: AppSettingsValues; at: number } | null = null;

/** Valid (admin-confirmed) settings row, else null. */
export async function readAppSettingsRow(): Promise<AppSettingsValues | null> {
  const row = await db.appSettings.findUnique({ where: { id: APP_SETTINGS_ID } });
  if (!row) return null;
  return {
    pagesPerReadEvent: clampSetting(row.pagesPerReadEvent),
    xpBookAdded: clampSetting(row.xpBookAdded),
    xpBookFinishedBase: clampSetting(row.xpBookFinishedBase),
    xpPagesPer10: clampSetting(row.xpPagesPer10),
    xpLending: clampSetting(row.xpLending),
    xpPerLevelBase: clampSetting(row.xpPerLevelBase),
  };
}

/** Effective settings: DB row (admin) wins, else env/code defaults. Cached 60s. */
export async function getAppSettings(): Promise<AppSettingsValues> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.values;
  const row = await readAppSettingsRow();
  const values = row ?? defaultAppSettings();
  cache = { values, at: Date.now() };
  return values;
}

/** Drop the in-memory cache — call after admin updates. */
export function invalidateAppSettingsCache() {
  cache = null;
}
