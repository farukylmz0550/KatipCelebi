import { describe, expect, it } from "vitest";
import {
  statusOf, normalizeWebStatus, parseStamp, readingDays, formatDuration,
  NOT_READ, WANT_TO_READ, READING, READ,
} from "@/lib/books/reading";

describe("statusOf", () => {
  it("returns NOT_READ for empty string", () => {
    expect(statusOf("")).toBe(NOT_READ);
  });
  it("returns valid status", () => {
    expect(statusOf("reading")).toBe(READING);
  });
  it("returns NOT_READ for invalid status", () => {
    expect(statusOf("invalid")).toBe(NOT_READ);
  });
});

describe("normalizeWebStatus", () => {
  it("maps TO_READ to want_to_read", () => {
    expect(normalizeWebStatus("TO_READ")).toBe(WANT_TO_READ);
  });
  it("maps READING to reading", () => {
    expect(normalizeWebStatus("READING")).toBe(READING);
  });
  it("maps FINISHED to read", () => {
    expect(normalizeWebStatus("FINISHED")).toBe(READ);
  });
});

describe("parseStamp", () => {
  it("returns null for empty string", () => {
    expect(parseStamp("")).toBeNull();
  });
  it("parses valid date", () => {
    const d = parseStamp("2024-01-15");
    expect(d).toBeInstanceOf(Date);
    expect(d?.getFullYear()).toBe(2024);
  });
  it("returns null for invalid date", () => {
    expect(parseStamp("not-a-date")).toBeNull();
  });
});

describe("readingDays", () => {
  it("returns null when either date is missing", () => {
    expect(readingDays("", "2024-01-20")).toBeNull();
    expect(readingDays("2024-01-01", "")).toBeNull();
  });
  it("returns null when finished before started", () => {
    expect(readingDays("2024-01-20", "2024-01-10")).toBeNull();
  });
  it("returns number of days", () => {
    expect(readingDays("2024-01-01", "2024-01-11")).toBe(10);
  });
});

describe("formatDuration", () => {
  it("returns 'unknown' for null", () => {
    expect(formatDuration(null)).toBe("unknown");
  });
  it("returns 'under a minute' for 0", () => {
    expect(formatDuration(0)).toBe("under a minute");
  });
  it("formats days and hours", () => {
    const result = formatDuration(2.5);
    expect(result).toContain("2 days");
    expect(result).toContain("12 hours");
  });
});
