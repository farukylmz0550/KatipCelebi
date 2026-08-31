import { describe, expect, it } from "vitest";
import { evaluateAchievements, levelForXp, levelProgress } from "@/lib/gamification";

describe("levelForXp", () => {
  it("starts at level 1 with zero xp", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("increases with more xp", () => {
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(200)).toBe(3);
  });
});

describe("levelProgress", () => {
  it("reports progress within the current level's band", () => {
    const { level, progress } = levelProgress(60);
    expect(level).toBe(2);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThan(1);
  });
});

describe("evaluateAchievements", () => {
  it("unlocks nothing for a user with no activity", () => {
    expect(evaluateAchievements({ booksAdded: 0, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 0 })).toEqual([]);
  });

  it("unlocks first_book once a book is added", () => {
    const keys = evaluateAchievements({ booksAdded: 1, booksFinished: 0, lendingsCreated: 0, distinctAuthors: 1 });
    expect(keys).toContain("first_book");
  });

  it("unlocks ten_finished only at ten finished books", () => {
    const under = evaluateAchievements({ booksAdded: 9, booksFinished: 9, lendingsCreated: 0, distinctAuthors: 9 });
    const at = evaluateAchievements({ booksAdded: 10, booksFinished: 10, lendingsCreated: 0, distinctAuthors: 10 });
    expect(under).not.toContain("ten_finished");
    expect(at).toContain("ten_finished");
  });
});
