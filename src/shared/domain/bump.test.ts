import { describe, expect, it } from "vitest";
import type { SemverString } from "@/shared/schemas/primitives";
import { assess, describeAssessment } from "./bump";

const v = (value: string) => value as SemverString;

describe("assess", () => {
  it("reports current when the range floor matches latest", () => {
    expect(assess("^19.2.0", v("19.2.0"))).toEqual({ kind: "current", current: "19.2.0", latest: "19.2.0" });
  });

  it("classifies patch, minor and major bumps", () => {
    expect(assess("^5.1.2", v("5.1.4"))).toMatchObject({ kind: "behind", bump: "patch", inRange: true });
    expect(assess("~5.1.2", v("5.3.0"))).toMatchObject({ kind: "behind", bump: "minor", inRange: false });
    expect(assess("^4.0.0", v("5.0.0"))).toMatchObject({ kind: "behind", bump: "major", inRange: false });
  });

  it("treats 0.x minor bumps as breaking", () => {
    expect(assess("^0.4.1", v("0.5.0"))).toMatchObject({ kind: "behind", bump: "major" });
    expect(assess("^0.0.3", v("0.0.4"))).toMatchObject({ kind: "behind", bump: "major" });
  });

  it("handles ranges that are ahead of the latest tag", () => {
    expect(assess("^3.0.0-beta.1", v("2.9.0"))).toMatchObject({ kind: "ahead" });
  });

  it("flags ranges it cannot compare", () => {
    expect(assess("workspace:*", v("1.0.0"))).toMatchObject({ kind: "unsupported", reason: "workspace" });
    expect(assess("github:vercel/next.js", v("1.0.0"))).toMatchObject({ kind: "unsupported", reason: "url" });
    expect(assess("latest", v("1.0.0"))).toMatchObject({ kind: "unsupported", reason: "tag" });
    expect(assess("not a range", v("1.0.0"))).toMatchObject({ kind: "unsupported", reason: "invalid" });
  });
});

describe("describeAssessment", () => {
  it("mentions when the update is already allowed by the range", () => {
    expect(describeAssessment(assess("^5.1.2", v("5.1.4")))).toBe("patch update within your range");
    expect(describeAssessment(assess("^4.0.0", v("5.0.0")))).toBe("major update");
  });
});
