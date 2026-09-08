import { describe, expect, it } from "vitest";
import { evaluateAchievements, levelForXp, levelProgress } from "@/lib/gamification";

describe("levelForXp", () => {
  it("starts at level 1 with zero xp", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("reaches level 2 at 100 xp", () => {
    expect(levelForXp(100)).toBe(2);
  });

  it("reaches level 3 at 200 xp", () => {
    expect(levelForXp(200)).toBe(3);
  });

  it("reaches level 4 at 400 xp", () => {
    expect(levelForXp(400)).toBe(4);
  });

  it("reaches level 5 at 700 xp", () => {
    expect(levelForXp(700)).toBe(5);
  });
});

describe("levelProgress", () => {
  it("reports progress within the current level's band", () => {
    const { level, progress } = levelProgress(150);
    expect(level).toBe(2);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThan(1);
  });
});

describe("evaluateAchievements", () => {
  it("unlocks nothing for a user with no activity", () => {
    expect(
      evaluateAchievements({ booksAdded: 0, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 0, currentStreak: 0, longestStreak: 0 })
    ).toEqual([]);
  });

  it("unlocks first_book once a book is added", () => {
    const keys = evaluateAchievements({ booksAdded: 1, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 1, currentStreak: 0, longestStreak: 0 });
    expect(keys).toContain("first_book");
  });

  it("unlocks ten_finished only at ten finished books", () => {
    const under = evaluateAchievements({ booksAdded: 9, booksFinished: 9, lendingsCreated: 0, distinctAuthors: 9, currentStreak: 0, longestStreak: 0 });
    const at = evaluateAchievements({ booksAdded: 10, booksFinished: 10, lendingsCreated: 0, distinctAuthors: 10, currentStreak: 0, longestStreak: 0 });
    expect(under).not.toContain("ten_finished");
    expect(at).toContain("ten_finished");
  });

  it("unlocks week_streak at 7 days", () => {
    const keys = evaluateAchievements({ booksAdded: 0, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 0, currentStreak: 7, longestStreak: 0 });
    expect(keys).toContain("week_streak");
  });

  it("unlocks month_streak via longestStreak", () => {
    const keys = evaluateAchievements({ booksAdded: 0, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 0, currentStreak: 0, longestStreak: 30 });
    expect(keys).toContain("month_streak");
  });
});
