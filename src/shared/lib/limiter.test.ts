import { describe, expect, it } from "vitest";
import { createLimiter } from "./limiter";

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe("createLimiter", () => {
  it("never runs more than the allowed number of tasks at once", async () => {
    const limiter = createLimiter(2);
    let running = 0;
    let peak = 0;

    const task = async (value: number) => {
      running += 1;
      peak = Math.max(peak, running);
      await tick();
      running -= 1;
      return value;
    };

    const results = await Promise.all([1, 2, 3, 4, 5].map((value) => limiter.run(() => task(value))));

    expect(results).toEqual([1, 2, 3, 4, 5]);
    expect(peak).toBe(2);
    expect(limiter.active).toBe(0);
  });

  it("keeps going after a task rejects", async () => {
    const limiter = createLimiter(1);
    const failed = limiter.run(() => Promise.reject(new Error("boom")));
    const passed = limiter.run(() => Promise.resolve("ok"));

    await expect(failed).rejects.toThrow("boom");
    await expect(passed).resolves.toBe("ok");
  });
});
