-- v2.7.0 — annual summary, read events, app settings, goal lock

-- Goal lock: targets confirmed once per calendar year, locked until next Jan 1.
-- Existing goals are migrated as already-confirmed for the current year.
ALTER TABLE "Goal" ADD COLUMN "targetYear" INTEGER;
ALTER TABLE "Goal" ADD COLUMN "confirmedAt" DATETIME;
UPDATE "Goal" SET "targetYear" = CAST(strftime('%Y', 'now') AS INTEGER), "confirmedAt" = datetime('now') WHERE "targetYear" IS NULL;

-- Read sessions: completions and partial page-logs (re-reads count).
CREATE TABLE "BookReadEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookTitle" TEXT,
    "pagesRead" INTEGER,
    "readAt" DATETIME NOT NULL,
    CONSTRAINT "BookReadEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookReadEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BookReadEvent_userId_readAt_idx" ON "BookReadEvent"("userId", "readAt");
CREATE INDEX "BookReadEvent_bookId_idx" ON "BookReadEvent"("bookId");

-- Backfill: existing completed books become one read event each (real history,
-- not fabrication) so booksRead counting has a single canonical source.
INSERT INTO "BookReadEvent" ("id", "userId", "bookId", "bookTitle", "pagesRead", "readAt")
SELECT
  lower(hex(randomblob(16))),
  b."userId",
  b."id",
  b."title",
  CASE WHEN b."numberOfPages" IS NULL THEN NULL
       ELSE CAST(CAST(b."numberOfPages" AS INTEGER) AS INTEGER) END,
  b."finishedAt"
FROM "Book" b
WHERE b."status" = 'FINISHED' AND b."finishedAt" IS NOT NULL;

-- Singleton site settings editable by the system admin.
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pagesPerReadEvent" INTEGER NOT NULL,
    "xpBookAdded" INTEGER NOT NULL,
    "xpBookFinishedBase" INTEGER NOT NULL,
    "xpPagesPer10" INTEGER NOT NULL,
    "xpLending" INTEGER NOT NULL,
    "xpPerLevelBase" INTEGER NOT NULL
);

-- Goal-progress push notification toggle
ALTER TABLE "UserSettings" ADD COLUMN "goalReminders" BOOLEAN NOT NULL DEFAULT true;

-- Per-user locale for localized push notifications (synced from the browser cookie)
ALTER TABLE "UserSettings" ADD COLUMN "locale" TEXT;
