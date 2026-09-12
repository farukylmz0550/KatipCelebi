-- v2.8.0 — groups/shelves: user-defined personal organization for books.
-- Many-to-many BookGroup ↔ Book via BookGroupMembership. No existing data is
-- modified; groups start empty and cascade only their own memberships.

CREATE TABLE "BookGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "BookGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BookGroup_userId_name_key" ON "BookGroup"("userId", "name");
CREATE INDEX "BookGroup_userId_idx" ON "BookGroup"("userId");

CREATE TABLE "BookGroupMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL,
    CONSTRAINT "BookGroupMembership_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BookGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BookGroupMembership_bookId_groupId_key" ON "BookGroupMembership"("bookId", "groupId");
CREATE INDEX "BookGroupMembership_bookId_idx" ON "BookGroupMembership"("bookId");
CREATE INDEX "BookGroupMembership_groupId_idx" ON "BookGroupMembership"("groupId");
