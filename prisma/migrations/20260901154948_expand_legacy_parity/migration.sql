-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "yearly" INTEGER NOT NULL DEFAULT 0,
    "monthly" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "coverUrl" TEXT,
    "coverFetchedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'TO_READ',
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "subtitle" TEXT,
    "publishers" TEXT,
    "publishDate" TEXT,
    "publishPlaces" TEXT,
    "editionName" TEXT,
    "series" TEXT,
    "numberOfPages" TEXT,
    "languages" TEXT,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "subjects" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "tags" TEXT,
    "startedAt" DATETIME,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "copies" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("addedAt", "author", "coverUrl", "finishedAt", "id", "isbn", "status", "title", "userId") SELECT "addedAt", "author", "coverUrl", "finishedAt", "id", "isbn", "status", "title", "userId" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE INDEX "Book_userId_idx" ON "Book"("userId");
CREATE INDEX "Book_tags_idx" ON "Book"("tags");
CREATE TABLE "new_LendingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "bookTitle" TEXT,
    "borrowerName" TEXT NOT NULL,
    "personId" TEXT,
    "personName" TEXT,
    "lentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" DATETIME,
    CONSTRAINT "LendingRecord_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LendingRecord_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LendingRecord" ("bookId", "borrowerName", "id", "lentAt", "returnedAt") SELECT "bookId", "borrowerName", "id", "lentAt", "returnedAt" FROM "LendingRecord";
DROP TABLE "LendingRecord";
ALTER TABLE "new_LendingRecord" RENAME TO "LendingRecord";
CREATE INDEX "LendingRecord_bookId_idx" ON "LendingRecord"("bookId");
CREATE INDEX "LendingRecord_personId_idx" ON "LendingRecord"("personId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "Person"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_name_key" ON "Person"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_key" ON "Goal"("userId");
