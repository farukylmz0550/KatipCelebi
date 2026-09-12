-- v2.9.0 — AppSettings becomes a fixed singleton row (id = 'singleton').
-- The previous delete+create writer could leave duplicate rows under
-- concurrent admin updates; collapse them, then pin the surviving row's id.
-- Additive/repair only — existing settings values are preserved.

DELETE FROM "AppSettings" WHERE "rowid" NOT IN (SELECT MIN("rowid") FROM "AppSettings");
UPDATE "AppSettings" SET "id" = 'singleton';
