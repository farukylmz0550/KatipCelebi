import { describe, expect, it } from "vitest";
import { canonical, display, splitTags, store, show, contains, fromSubjects } from "@/lib/books/tags";

describe("canonical", () => {
  it("lowercases and trims", () => {
    expect(canonical("  Fiction  ")).toBe("fiction");
  });
});

describe("display", () => {
  it("capitalizes first letter", () => {
    expect(display("fiction")).toBe("Fiction");
  });
  it("returns empty for empty string", () => {
    expect(display("")).toBe("");
  });
});

describe("splitTags", () => {
  it("splits by comma and normalizes", () => {
    expect(splitTags("fiction, Poetry, Sci-Fi")).toEqual(["fiction", "poetry", "sci-fi"]);
  });
  it("filters empty strings", () => {
    expect(splitTags("fiction,,poetry,")).toEqual(["fiction", "poetry"]);
  });
});

describe("store", () => {
  it("joins tags with comma", () => {
    expect(store(["fiction", "poetry"])).toBe("fiction, poetry");
  });
  it("filters empty strings", () => {
    expect(store(["fiction", "", "poetry"])).toBe("fiction, poetry");
  });
});

describe("show", () => {
  it("displays tags with proper casing", () => {
    expect(show("fiction,poetry")).toBe("Fiction, Poetry");
  });
});

describe("contains", () => {
  it("finds a tag in CSV", () => {
    expect(contains("fiction, poetry", "fiction")).toBe(true);
    expect(contains("fiction, poetry", "sci-fi")).toBe(false);
  });
});

describe("fromSubjects", () => {
  it("filters noise words and limits to MAX_SUBJECT_TAGS", () => {
    const subjects = ["Fiction", "Translations", "In Library", "Poetry", "History", "Science", "Art", "Travel", "Religion", "Textbooks", "Reference", "Fantasy", "Biography", "Philosophy", "Juvenile Fiction", "Detective", "Short Stories"];
    const result = fromSubjects(subjects);
    expect(result).not.toContain("translations");
    expect(result).not.toContain("in library");
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("lowercases all subjects", () => {
    const result = fromSubjects(["Fiction", "Poetry"]);
    expect(result).toEqual(["fiction", "poetry"]);
  });
});
