import { describe, expect, it } from "vitest";
import { normalizeName, trustScore, canRemovePerson, displayName } from "@/lib/person";

describe("normalizeName", () => {
  it("lowercases and trims whitespace", () => {
    expect(normalizeName("  John  Doe  ")).toBe("john doe");
  });
  it("collapses multiple spaces", () => {
    expect(normalizeName("John    Doe")).toBe("john doe");
  });
});

describe("displayName", () => {
  it("trims whitespace", () => {
    expect(displayName("  John Doe  ")).toBe("John Doe");
  });
});

describe("trustScore", () => {
  it("returns returned - out", () => {
    expect(trustScore(5, 2)).toBe(3);
  });
  it("returns negative when more out than returned", () => {
    expect(trustScore(1, 3)).toBe(-2);
  });
  it("returns 0 when equal", () => {
    expect(trustScore(3, 3)).toBe(0);
  });
});

describe("canRemovePerson", () => {
  it("returns true when no books out", () => {
    expect(canRemovePerson(0)).toBe(true);
  });
  it("returns false when books are out", () => {
    expect(canRemovePerson(1)).toBe(false);
    expect(canRemovePerson(5)).toBe(false);
  });
});
