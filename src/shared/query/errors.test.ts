import { describe, expect, it } from "vitest";
import { ApiError, retryDelay, shouldRetry } from "./errors";

describe("shouldRetry", () => {
  it("does not retry requests that will fail the same way", () => {
    expect(shouldRetry(0, new ApiError(400, "bad"))).toBe(false);
    expect(shouldRetry(0, new ApiError(404, "missing"))).toBe(false);
  });

  it("retries rate limits, server errors and dropped connections", () => {
    expect(shouldRetry(0, new ApiError(429, "slow down"))).toBe(true);
    expect(shouldRetry(1, new ApiError(502, "upstream"))).toBe(true);
    expect(shouldRetry(2, new ApiError(0, "offline"))).toBe(true);
  });

  it("stops after three attempts and never retries an aborted request", () => {
    expect(shouldRetry(3, new ApiError(503, "down"))).toBe(false);
    expect(shouldRetry(0, new DOMException("aborted", "AbortError"))).toBe(false);
  });
});

describe("retryDelay", () => {
  it("backs off further for rate limits", () => {
    expect(retryDelay(1, new ApiError(429, "slow down"))).toBeGreaterThanOrEqual(8000);
    expect(retryDelay(1, new ApiError(502, "upstream"))).toBeLessThan(1500);
  });
});
