import { describe, expect, it } from "vitest";
import { goal, reached, fraction, yearlyGoal, monthlyGoal, finishedInYear, finishedInMonth } from "@/lib/goals";

describe("goal", () => {
  it("creates a goal with target and done", () => {
    const g = goal(10, 5);
    expect(g.target).toBe(10);
    expect(g.done).toBe(5);
  });
  it("floors negative values to 0", () => {
    const g = goal(-5, -3);
    expect(g.target).toBe(0);
    expect(g.done).toBe(0);
  });
});

describe("reached", () => {
  it("returns true when done >= target", () => {
    expect(reached({ target: 5, done: 5 })).toBe(true);
    expect(reached({ target: 5, done: 6 })).toBe(true);
  });
  it("returns false when done < target", () => {
    expect(reached({ target: 5, done: 4 })).toBe(false);
  });
  it("returns false when target is 0", () => {
    expect(reached({ target: 0, done: 0 })).toBe(false);
  });
});

describe("fraction", () => {
  it("returns 0 when target is 0", () => {
    expect(fraction({ target: 0, done: 5 })).toBe(0);
  });
  it("returns correct fraction", () => {
    expect(fraction({ target: 10, done: 5 })).toBe(0.5);
  });
  it("caps at 1", () => {
    expect(fraction({ target: 5, done: 10 })).toBe(1);
  });
});

describe("yearlyGoal / monthlyGoal", () => {
  it("creates yearly goal", () => {
    const g = yearlyGoal(24, 12);
    expect(g.target).toBe(24);
    expect(g.done).toBe(12);
  });
  it("creates monthly goal", () => {
    const g = monthlyGoal(3, 1);
    expect(g.target).toBe(3);
    expect(g.done).toBe(1);
  });
});

describe("finishedInYear", () => {
  it("counts finished books in a year", () => {
    const dates = [
      new Date("2024-03-15"),
      new Date("2024-07-20"),
      new Date("2025-01-10"),
    ];
    expect(finishedInYear(dates, 2024)).toBe(2);
    expect(finishedInYear(dates, 2025)).toBe(1);
  });
});

describe("finishedInMonth", () => {
  it("counts finished books in a specific month", () => {
    const dates = [
      new Date("2024-03-15"),
      new Date("2024-03-20"),
      new Date("2024-04-10"),
    ];
    expect(finishedInMonth(dates, 2024, 2)).toBe(2); // March = index 2
    expect(finishedInMonth(dates, 2024, 3)).toBe(1); // April = index 3
  });
});
