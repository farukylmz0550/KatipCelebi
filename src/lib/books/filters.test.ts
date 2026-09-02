import { describe, expect, it } from "vitest";
import { isSigned, allows, sortKey, arrange, defaultFilters, Filters } from "@/lib/books/filters";

describe("isSigned", () => {
  it("returns true for any filter", () => {
    expect(isSigned(true, "any")).toBe(true);
    expect(isSigned(false, "any")).toBe(true);
  });
  it("returns correct for yes filter", () => {
    expect(isSigned(true, "yes")).toBe(true);
    expect(isSigned(false, "yes")).toBe(false);
  });
  it("returns correct for no filter", () => {
    expect(isSigned(true, "no")).toBe(false);
    expect(isSigned(false, "no")).toBe(true);
  });
});

describe("allows", () => {
  const book = { title: "Test", rating: 3, signed: false, status: "TO_READ", tags: "fiction, sci-fi", author: "Author", isbn: "123", publishers: "Pub" };
  const f: Filters = { ...defaultFilters };

  it("allows all when no filters active", () => {
    expect(allows(book, false, f)).toBe(true);
  });

  it("filters by minRating", () => {
    expect(allows(book, false, { ...f, minRating: 4 })).toBe(false);
    expect(allows(book, false, { ...f, minRating: 3 })).toBe(true);
  });

  it("filters by signed", () => {
    expect(allows(book, false, { ...f, signed: "yes" })).toBe(false);
    expect({ ...book, signed: true }, false, { ...f, signed: "yes" });
  });

  it("filters by status", () => {
    expect(allows(book, false, { ...f, status: "READING" })).toBe(false);
    expect(allows(book, false, { ...f, status: "TO_READ" })).toBe(true);
  });

  it("filters by tag", () => {
    expect(allows(book, false, { ...f, tag: "fiction" })).toBe(true);
    expect(allows(book, false, { ...f, tag: "poetry" })).toBe(false);
  });

  it("filters by search in all fields", () => {
    expect(allows(book, false, { ...f, search: "test", searchField: "all" })).toBe(true);
    expect(allows(book, false, { ...f, search: "xyz", searchField: "all" })).toBe(false);
  });

  it("filters by search in title only", () => {
    expect(allows(book, false, { ...f, search: "test", searchField: "title" })).toBe(true);
    expect(allows(book, false, { ...f, search: "author", searchField: "title" })).toBe(false);
  });

  it("filters by lent out", () => {
    expect(allows(book, true, { ...f, lent: "home" })).toBe(false);
    expect(allows(book, true, { ...f, lent: "out" })).toBe(true);
    expect(allows(book, false, { ...f, lent: "home" })).toBe(true);
  });
});

describe("sortKey", () => {
  it("sorts by title", () => {
    expect(sortKey({ title: "Alpha" }, "title")).toBe("alpha");
  });
  it("sorts by rating", () => {
    expect(sortKey({ rating: 4 }, "rating")).toBe(-4);
  });
  it("sorts by year", () => {
    const key = sortKey({ publishDate: "2023-01-01" }, "year");
    expect(typeof key).toBe("number");
  });
});

describe("arrange", () => {
  const books = [
    { id: "1", title: "Bravo" },
    { id: "2", title: "Alpha" },
    { id: "3", title: "Charlie" },
  ];
  const lentMap = new Map<string, boolean>();

  it("sorts by title ascending by default", () => {
    const result = arrange(books, defaultFilters, lentMap);
    expect(result.map((b) => b.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts by title descending", () => {
    const result = arrange(books, { ...defaultFilters, asc: false }, lentMap);
    expect(result.map((b) => b.id)).toEqual(["3", "1", "2"]);
  });
});
