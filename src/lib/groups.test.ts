// SPDX-License-Identifier: GPL-3.0-only
import { describe, expect, it } from "vitest";
import {
  applyReorder,
  GROUP_COLORS,
  GROUP_DOTS_MAX,
  GROUP_NAME_MAX,
  validateGroupColor,
  validateGroupName,
} from "@/lib/groups";

describe("validateGroupName", () => {
  it("accepts a normal name and trims whitespace", () => {
    expect(validateGroupName("Favorites")).toEqual({ ok: true, value: "Favorites" });
    expect(validateGroupName("  To Read  ")).toEqual({ ok: true, value: "To Read" });
  });

  it("collapses internal whitespace", () => {
    expect(validateGroupName("A   B")).toEqual({ ok: true, value: "A B" });
  });

  it("rejects empty and whitespace-only names", () => {
    expect(validateGroupName("")).toEqual({ ok: false, error: "INVALID_NAME" });
    expect(validateGroupName("   ")).toEqual({ ok: false, error: "INVALID_NAME" });
  });

  it("rejects non-string input", () => {
    expect(validateGroupName(null)).toEqual({ ok: false, error: "INVALID_NAME" });
    expect(validateGroupName(undefined)).toEqual({ ok: false, error: "INVALID_NAME" });
    expect(validateGroupName(42)).toEqual({ ok: false, error: "INVALID_NAME" });
  });

  it("rejects overly long names", () => {
    const long = "a".repeat(GROUP_NAME_MAX + 1);
    expect(validateGroupName(long)).toEqual({ ok: false, error: "NAME_TOO_LONG" });
    expect(validateGroupName("a".repeat(GROUP_NAME_MAX)).ok).toBe(true);
  });
});

describe("validateGroupColor", () => {
  it("accepts palette colors", () => {
    for (const color of GROUP_COLORS) {
      expect(validateGroupColor(color)).toEqual({ ok: true, value: color });
    }
  });

  it("accepts a strict 6-digit hex and normalizes case", () => {
    expect(validateGroupColor("#12ABcD")).toEqual({ ok: true, value: "#12abcd" });
  });

  it("accepts empty values as no color", () => {
    expect(validateGroupColor(null)).toEqual({ ok: true, value: null });
    expect(validateGroupColor(undefined)).toEqual({ ok: true, value: null });
    expect(validateGroupColor("")).toEqual({ ok: true, value: null });
    expect(validateGroupColor("   ")).toEqual({ ok: true, value: null });
  });

  it("rejects unsafe or invalid values", () => {
    expect(validateGroupColor("red")).toEqual({ ok: false, error: "INVALID_COLOR" });
    expect(validateGroupColor("#fff")).toEqual({ ok: false, error: "INVALID_COLOR" });
    expect(validateGroupColor("#12345")).toEqual({ ok: false, error: "INVALID_COLOR" });
    expect(validateGroupColor("#GGG111")).toEqual({ ok: false, error: "INVALID_COLOR" });
    expect(validateGroupColor("javascript:alert(1)")).toEqual({ ok: false, error: "INVALID_COLOR" });
    expect(validateGroupColor("#123; } body { background: url(x)")).toEqual({
      ok: false,
      error: "INVALID_COLOR",
    });
    expect(validateGroupColor(42)).toEqual({ ok: false, error: "INVALID_COLOR" });
  });
});

describe("applyReorder", () => {
  it("accepts a complete permutation of the user's groups", () => {
    const result = applyReorder(["a", "b", "c"], ["c", "a", "b"]);
    expect(result).toEqual({ ok: true, ordered: ["c", "a", "b"] });
  });

  it("rejects foreign group ids (cross-user protection)", () => {
    expect(applyReorder(["a", "b"], ["a", "x"])).toEqual({ ok: false, error: "INVALID_IDS" });
  });

  it("rejects duplicate ids", () => {
    expect(applyReorder(["a", "b"], ["a", "a"])).toEqual({ ok: false, error: "INVALID_IDS" });
  });

  it("rejects missing ids (incomplete permutation)", () => {
    expect(applyReorder(["a", "b", "c"], ["a", "b"])).toEqual({ ok: false, error: "INVALID_IDS" });
  });

  it("rejects non-array or non-string payloads", () => {
    expect(applyReorder(["a"], "a")).toEqual({ ok: false, error: "INVALID_IDS" });
    expect(applyReorder(["a"], [null])).toEqual({ ok: false, error: "INVALID_IDS" });
    expect(applyReorder(["a"], undefined)).toEqual({ ok: false, error: "INVALID_IDS" });
  });

  it("handles a single group", () => {
    expect(applyReorder(["a"], ["a"])).toEqual({ ok: true, ordered: ["a"] });
  });
});

describe("constants", () => {
  it("palette has no duplicates", () => {
    expect(new Set(GROUP_COLORS).size).toBe(GROUP_COLORS.length);
  });

  it("card dot limit stays manageable", () => {
    expect(GROUP_DOTS_MAX).toBeLessThanOrEqual(3);
  });
});
