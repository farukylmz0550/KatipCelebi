/* eslint-disable @typescript-eslint/no-require-imports */
// SPDX-License-Identifier: GPL-3.0-only
// @ts-check
// Documented exception to CONTRIBUTING.md "TypeScript everywhere" — see CONTRIBUTING.md
// Plain-JS Docker fallback for prisma/seed.ts (TS source of truth). tsx is dev-only, so production
// image runs this file with plain node + better-sqlite3. Keep ACHIEVEMENTS in sync with seed.ts / gamification.ts.
const Database = require("better-sqlite3");

function cuid() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const ACHIEVEMENTS = [
  { key: "first_book", titleKey: "first_book_title", descriptionKey: "first_book_desc", iconKey: "first_book" },
  { key: "first_finish", titleKey: "first_finish_title", descriptionKey: "first_finish_desc", iconKey: "first_finish" },
  { key: "ten_finished", titleKey: "ten_finished_title", descriptionKey: "ten_finished_desc", iconKey: "ten_finished" },
  {
    key: "first_lending",
    titleKey: "first_lending_title",
    descriptionKey: "first_lending_desc",
    iconKey: "first_lending",
  },
  { key: "five_authors", titleKey: "five_authors_title", descriptionKey: "five_authors_desc", iconKey: "five_authors" },
  { key: "week_streak", titleKey: "week_streak_title", descriptionKey: "week_streak_desc", iconKey: "week_streak" },
  { key: "month_streak", titleKey: "month_streak_title", descriptionKey: "month_streak_desc", iconKey: "month_streak" },
  {
    key: "streak_shield",
    titleKey: "streak_shield_title",
    descriptionKey: "streak_shield_desc",
    iconKey: "streak_shield",
  },
];

const dbUrl = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace(/^file:/, "").replace(/^"|"$/g, "");
const db = new Database(dbUrl);
db.pragma("journal_mode = WAL");

for (const a of ACHIEVEMENTS) {
  const existing = db.prepare("SELECT id FROM Achievement WHERE key = ?").get(a.key);
  if (!existing) {
    db.prepare("INSERT INTO Achievement (id, key, titleKey, descriptionKey, iconKey) VALUES (?, ?, ?, ?, ?)").run(
      cuid(),
      a.key,
      a.titleKey,
      a.descriptionKey,
      a.iconKey,
    );
    console.log("Created achievement: " + a.key);
  } else {
    console.log("Achievement already exists: " + a.key);
  }
}

db.close();
console.log("Seeding complete.");
