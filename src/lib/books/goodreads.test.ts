import { describe, it, expect } from "vitest";
import { parseCsvText, parseGoodreadsRows, parseShelves, parseGoodreadsDate } from "./goodreads";
import type { GoodreadsParseResult } from "./goodreads";
import { parseRating } from "./model";

/** Narrow the union for TS so `result.rows` is accessible in positive-path tests. */
function expectRows(result: GoodreadsParseResult) {
  if ("error" in result) throw new Error(result.error);
  return result;
}

// Classic Goodreads export columns (formula-wrapped ISBNs are the real-world shape).
const SAMPLE_CSV = `Book Id,Title,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Private Notes,My Review,Spoiler,Owned Copies
1,Kar,Orhan Pamuk,,"=""0439064864""","=""9780439708180""",5,4.2,Yapı Kredi,Paperback,304,2003,2003,2024/03/15,2024/01/01,read,book #1,My copy,Good book,no,1
2,The Three-Body Problem,"Liu, Cixin",,"=""0439708184""","=""9780140449136""",4,4.1,Tor,Paperback,400,2014,2014,2023/05/01,2023/01/01,"read, sci-fi",book #2,"=HYPERLINK(""http://x"")",note,no,1
3,Bare Bones,Unknown Author,,0439064864,,0,3.8,,,300,2001,2001,,2022/01/01,to-read,book #3,,review text,yes,1
4,No Title Here,Someone,,,,0,3.0,,,,,,,2022/01/01,currently-reading,book #4,,note text,yes,1`;

describe("Goodreads CSV parser", () => {
  it("parses multiple valid rows correctly (A)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows).toHaveLength(4);
  });

  it("handles quoted title containing commas as one value (B)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\n"Q, with comma",Auth,0439064864,,3,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows[0].title).toBe("Q, with comma");
    expect(result.rows).toHaveLength(1);
  });

  it("preserves UTF-8 Turkish/non-ASCII text (C)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\nTürkçe ĞÜŞİÖÇ,Şener Şen,0439064864,,4,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows[0].title).toBe("Türkçe ĞÜŞİÖÇ");
  });

  it("normalizes dirty ISBN13 to valid ISBN (E)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[0].isbn).toBe("9780439708180");
    expect(result.rows[0].isbn13).toBe("9780439708180");
  });

  it("prefers ISBN13 when both are valid (F)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[1].isbn).toBe("9780140449136");
  });

  it("keeps rows processable with plain ISBN-10 only (D)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[2].isbn).toBe("0439064864");
    expect(result.rows[2].isbn13).toBeNull();
  });

  it("tolerates missing optional columns (G)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\nOnly Title,Someone,0439064864,,0,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows).toHaveLength(1);
  });

  it("keeps rows with empty ISBN processable when Title exists (H)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    const noIsbnRow = result.rows.find((r) => r.title === "No Title Here");
    expect(noIsbnRow).toBeDefined();
    expect(noIsbnRow?.isbn).toBeNull();
  });

  it("never fabricates an ISBN from invalid input (I)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\nBad ISBN Book,Auth,1234567890,9780439708181.0,0,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows[0].isbn).toBeNull();
  });

  it("maps My Rating into the rating field with clamp", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[0].rating).toBe(5);
    expect(result.rows[2].rating).toBe(0);
  });

  it("maps Date Read into dateRead and Bookshelves into status/tags", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[0].dateRead?.getUTCFullYear()).toBe(2024);
    expect(result.rows[0].dateRead?.getUTCMonth()).toBe(2); // March — no TZ shift
    expect(result.rows[0].status).toBe("FINISHED");
    expect(result.rows[2].status).toBe("TO_READ");
    expect(result.rows[3].status).toBe("READING");
    expect(result.rows[1].tags).toEqual(["sci-fi"]);
  });

  it("maps Private Notes into notes (P: formula-like values stay plain text)", () => {
    const result = expectRows(parseGoodreadsRows(SAMPLE_CSV));
    expect(result.rows[0].notes).toBe("My copy");
    expect(result.rows[1].notes).toBe('=HYPERLINK("http://x")');
  });

  it("reports one malformed row without aborting valid rows (N)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\nGood Book,Auth,0439064864,,3,,\n,MissingTitle,,,,,\nAnother Book,Auth2,,9780439708180,5,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows).toHaveLength(2);
    expect(result.invalidRows).toHaveLength(1);
    expect(result.invalidRows[0]).toContain("Row 3");
  });

  it("rejects CSV without a Title column (M)", () => {
    const csv = `Foo,Bar\n1,2\n`;
    const result = parseGoodreadsRows(csv);
    expect("error" in result).toBe(true);
  });

  it("rejects an empty CSV (M)", () => {
    const result = parseGoodreadsRows("");
    expect("error" in result).toBe(true);
  });

  it("drops trailing empty lines", () => {
    const rows = parseCsvText("Title,Author\nA,B\n\n\n");
    expect(rows).toHaveLength(2); // trailing blank lines dropped, header + 1 data row
  });
});

describe("ISBN normalization helpers", () => {
  it("treats empty/invalid ISBN as unavailable without fabricating (I)", () => {
    const csv = `Title,Author,ISBN,ISBN13,My Rating,Date Read,Bookshelves\nT,A,"garbage","garbage",0,,\n`;
    const result = expectRows(parseGoodreadsRows(csv));
    expect(result.rows[0]?.isbn ?? null).toBeNull();
  });

  it("parses Date Read as UTC regardless of server timezone", () => {
    expect(parseGoodreadsDate("2024/03/15")?.toISOString()).toBe("2024-03-15T00:00:00.000Z");
    expect(parseGoodreadsDate("2024-03-15")?.toISOString()).toBe("2024-03-15T00:00:00.000Z");
    expect(parseGoodreadsDate("2024/03")?.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(parseGoodreadsDate(null)).toBeNull();
  });
});

describe("parseShelves", () => {
  it("maps unambiguous shelves to status, custom shelves to tags", () => {
    expect(parseShelves("read")).toEqual({ status: "FINISHED", tags: [] });
    expect(parseShelves("currently-reading")).toEqual({ status: "READING", tags: [] });
    expect(parseShelves("to-read")).toEqual({ status: "TO_READ", tags: [] });
    expect(parseShelves("to-read, sci-fi")).toEqual({ status: "TO_READ", tags: ["sci-fi"] });
  });

  it("applies precedence read > currently-reading > to-read on conflicts", () => {
    expect(parseShelves("currently-reading,read").status).toBe("FINISHED");
    expect(parseShelves("to-read,currently-reading").status).toBe("READING");
  });

  it("returns null status and no tags for empty shelves", () => {
    expect(parseShelves(null)).toEqual({ status: null, tags: [] });
  });
});

describe("rating semantics", () => {
  it("reuses legacy parseRating clamping for Goodreads 0-5 values (P)", () => {
    expect(parseRating("3.5")).toBe(3);
    expect(parseRating("5")).toBe(5);
    expect(parseRating("")).toBe(0);
    expect(parseRating("-2")).toBe(0);
    expect(parseRating("9")).toBe(5);
  });
});
