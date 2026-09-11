import { describe, it, expect } from "vitest";
import { getNextStatus, getPrevStatus, statusLabel } from "./status-cycle";

describe("status cycle", () => {
  it("cycles forward through the status order", () => {
    expect(getNextStatus("TO_READ")).toBe("READING");
    expect(getNextStatus("READING")).toBe("FINISHED");
    expect(getNextStatus("FINISHED")).toBe("TO_READ");
  });

  it("cycles backward through the status order", () => {
    expect(getPrevStatus("TO_READ")).toBe("FINISHED");
    expect(getPrevStatus("READING")).toBe("TO_READ");
    expect(getPrevStatus("FINISHED")).toBe("READING");
  });

  it("falls back to the first status for unknown values", () => {
    expect(getNextStatus("UNKNOWN")).toBe("TO_READ");
    expect(getPrevStatus("UNKNOWN")).toBe("FINISHED");
  });

  it("labels with provided labels or fallbacks", () => {
    expect(statusLabel("TO_READ", { toRead: "K", reading: "R", finished: "F" })).toBe("K");
    expect(statusLabel("READING", { toRead: "K", reading: "R", finished: "F" })).toBe("R");
    expect(statusLabel("FINISHED", { toRead: "K", reading: "R", finished: "F" })).toBe("F");
    expect(statusLabel("READING")).toBe("Reading");
    expect(statusLabel("MYSTERY")).toBe("MYSTERY");
  });
});
