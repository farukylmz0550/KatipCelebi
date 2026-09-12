// SPDX-License-Identifier: GPL-3.0-only
import { describe, it, expect, vi } from "vitest";
import { parseDueDate, isOverdue, groupOverdueByUser } from "./lending-due";

describe("parseDueDate", () => {
  it("returns null when no due date is provided (A)", () => {
    expect(parseDueDate(undefined)).toBeNull();
    expect(parseDueDate(null)).toBeNull();
    expect(parseDueDate("")).toBeNull();
    expect(parseDueDate("   ")).toBeNull();
  });

  it("accepts a valid future due date and normalizes to end of its UTC day (B)", () => {
    vi.useFakeTimers({ now: new Date(Date.UTC(2026, 8, 11, 12, 0, 0)) });
    const parsed = parseDueDate("2026-09-15");
    expect(parsed).not.toBeNull();
    expect(parsed?.getTime()).toBe(Date.UTC(2026, 8, 15, 23, 59, 59, 999));
    vi.useRealTimers();
  });

  it("rejects a past due date (C)", () => {
    vi.useFakeTimers({ now: new Date(Date.UTC(2026, 8, 11, 12, 0, 0)) });
    expect(() => parseDueDate("2026-09-01")).toThrow("Due date must be in the future");
    vi.useRealTimers();
  });

  it("rejects an invalid due date (D)", () => {
    expect(() => parseDueDate("not-a-date")).toThrow("Invalid due date");
  });

  it("treats today as still due, not overdue-until-day-passes", () => {
    vi.useFakeTimers({ now: new Date(Date.UTC(2026, 8, 11, 8, 0, 0)) });
    const parsed = parseDueDate("2026-09-11");
    expect(parsed).not.toBeNull();
    expect(parsed?.getTime()).toBe(Date.UTC(2026, 8, 11, 23, 59, 59, 999));
    vi.useRealTimers();
  });
});

describe("isOverdue", () => {
  const now = new Date(Date.UTC(2026, 8, 12, 10, 0, 0));

  it("selects an active record whose due date has passed (F)", () => {
    const record = { dueDate: new Date(now.getTime() - 1000), returnedAt: null };
    expect(isOverdue(record, now)).toBe(true);
  });

  it("does not select a returned overdue record (G)", () => {
    const record = { dueDate: new Date(now.getTime() - 1000), returnedAt: now };
    expect(isOverdue(record, now)).toBe(false);
  });

  it("never treats a null due date as overdue (E)", () => {
    expect(isOverdue({ dueDate: null, returnedAt: null }, now)).toBe(false);
  });

  it("does not mark a due date still in the future", () => {
    const record = { dueDate: new Date(now.getTime() + 1000), returnedAt: null };
    expect(isOverdue(record, now)).toBe(false);
  });
});

describe("groupOverdueByUser", () => {
  it("groups multiple overdue books into one payload per user (J)", () => {
    const records = [
      { book: { userId: "userA", title: "Book X" } },
      { book: { userId: "userA", title: "Book Y" } },
      { book: { userId: "userB", title: "Book Z" } },
    ];
    const grouped = groupOverdueByUser(records);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].userId).toBe("userA");
    expect(grouped[0].payload.body).toContain("2 books are overdue");
    expect(grouped[0].payload.body).toContain("Book X");
    expect(grouped[1].userId).toBe("userB");
    expect(grouped[1].payload.body).toContain("1 book is overdue");
  });

  it("summarizes beyond the max title limit with +N more", () => {
    const records = ["a", "b", "c", "d"].map((t) => ({ book: { userId: "userA", title: t } }));
    const grouped = groupOverdueByUser(records, 3);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].payload.body).toContain("+1 more");
    expect(grouped[0].payload.body).not.toContain("“d”");
  });
});
