import { describe, expect, it } from "vitest";
import { parseManifest } from "@/shared/domain/manifest";
import { SAMPLE_PROJECTS } from "./samples";

describe("SAMPLE_PROJECTS", () => {
  it("each sample is a valid package.json with enough packages to scan", () => {
    for (const sample of SAMPLE_PROJECTS) {
      const result = parseManifest(sample.text);
      expect(result.ok, sample.id).toBe(true);
      if (!result.ok) continue;
      expect(result.manifest.dependencies.length).toBeGreaterThan(6);
    }
  });
});
