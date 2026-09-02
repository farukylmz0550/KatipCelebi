import { describe, expect, it } from "vitest";
import {
  normalizeIsbn, checkIsbn, isValidIsbn10, isValidIsbn13,
  parseCopies, parseRating, isLocalKey, newLocalKey, displayIsbn, MAX_COPIES,
} from "@/lib/books/model";

describe("normalizeIsbn", () => {
  it("strips non-digit characters", () => {
    expect(normalizeIsbn("978-0-13-468599-1")).toBe("9780134685991");
  });
  it("preserves X for ISBN-10", () => {
    expect(normalizeIsbn("0-804-42957-X")).toBe("080442957X");
  });
});

describe("checkIsbn", () => {
  it("returns EMPTY for empty string", () => {
    expect(checkIsbn("")).toBe("EMPTY");
  });
  it("returns LENGTH for invalid length", () => {
    expect(checkIsbn("12345")).toBe("LENGTH");
  });
  it("returns OK for valid ISBN-13", () => {
    expect(checkIsbn("9780134685991")).toBe("OK");
  });
  it("returns OK for valid ISBN-10", () => {
    expect(checkIsbn("080442957X")).toBe("OK");
  });
  it("returns CHECKSUM13 for invalid checksum", () => {
    expect(checkIsbn("9780134685990")).toBe("CHECKSUM13");
  });
});

describe("isValidIsbn13", () => {
  it("validates correct checksum", () => {
    expect(isValidIsbn13("9780134685991")).toBe(true);
  });
  it("rejects incorrect checksum", () => {
    expect(isValidIsbn13("9780134685990")).toBe(false);
  });
});

describe("isValidIsbn10", () => {
  it("validates correct checksum", () => {
    expect(isValidIsbn10("080442957X")).toBe(true);
  });
  it("rejects incorrect checksum", () => {
    expect(isValidIsbn10("0804429570")).toBe(false);
  });
});

describe("parseCopies", () => {
  it("returns 1 for empty string", () => {
    expect(parseCopies("")).toBe(1);
  });
  it("returns parsed value", () => {
    expect(parseCopies("3")).toBe(3);
  });
  it("caps at MAX_COPIES", () => {
    expect(parseCopies("9999")).toBe(MAX_COPIES);
  });
  it("floors to 1 for invalid input", () => {
    expect(parseCopies("abc")).toBe(1);
  });
});

describe("parseRating", () => {
  it("returns 0 for empty string", () => {
    expect(parseRating("")).toBe(0);
  });
  it("clamps to 0-5 range", () => {
    expect(parseRating("6")).toBe(5);
    expect(parseRating("-1")).toBe(0);
  });
  it("floors to integer", () => {
    expect(parseRating("3.7")).toBe(3);
  });
});

describe("isLocalKey / newLocalKey / displayIsbn", () => {
  it("newLocalKey starts with local_", () => {
    const key = newLocalKey();
    expect(key.startsWith("local_")).toBe(true);
    expect(isLocalKey(key)).toBe(true);
  });
  it("displayIsbn returns empty for local key", () => {
    expect(displayIsbn("local_abc")).toBe("");
  });
  it("displayIsbn returns key for ISBN", () => {
    expect(displayIsbn("9780134685991")).toBe("9780134685991");
  });
});
