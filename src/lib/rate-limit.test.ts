import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("rate limiter", () => {
  beforeEach(() => {
    resetRateLimit("test:key");
  });

  it("allows up to max requests within the window", () => {
    const opts = { max: 3, windowMs: 1000 };
    expect(checkRateLimit("test:key", opts)).toBe(true);
    expect(checkRateLimit("test:key", opts)).toBe(true);
    expect(checkRateLimit("test:key", opts)).toBe(true);
    expect(checkRateLimit("test:key", opts)).toBe(false);
  });

  it("resets the counter after the window elapses", () => {
    const opts = { max: 1, windowMs: 100 };
    expect(checkRateLimit("test:key", opts)).toBe(true);
    expect(checkRateLimit("test:key", opts)).toBe(false);
    vi.useFakeTimers();
    vi.advanceTimersByTime(101);
    expect(checkRateLimit("test:key", opts)).toBe(true);
    vi.useRealTimers();
  });

  it("tracks keys independently", () => {
    const opts = { max: 1, windowMs: 1000 };
    expect(checkRateLimit("test:key", opts)).toBe(true);
    expect(checkRateLimit("test:other", opts)).toBe(true);
    expect(checkRateLimit("test:key", opts)).toBe(false);
    expect(checkRateLimit("test:other", opts)).toBe(false);
  });
});
