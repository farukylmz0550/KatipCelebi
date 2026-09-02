import { describe, expect, it } from "vitest";
import { monthlyFinishCounts } from "@/lib/stats";

describe("monthlyFinishCounts", () => {
  it("returns 6 buckets for last 6 months", () => {
    const result = monthlyFinishCounts([], new Date("2024-06-15"));
    expect(result).toHaveLength(6);
  });

  it("counts finished books per month", () => {
    const dates = [
      new Date("2024-04-10"),
      new Date("2024-04-20"),
      new Date("2024-05-05"),
    ];
    const result = monthlyFinishCounts(dates, new Date("2024-06-01"));
    const april = result.find((r) => r.month === "Apr");
    const may = result.find((r) => r.month === "May");
    expect(april?.count).toBe(2);
    expect(may?.count).toBe(1);
  });

  it("returns zeros for months with no finished books", () => {
    const result = monthlyFinishCounts([], new Date("2024-06-01"));
    expect(result.every((r) => r.count === 0)).toBe(true);
  });
});
