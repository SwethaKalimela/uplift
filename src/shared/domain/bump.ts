import semver from "semver";
import type { SemverString } from "@/shared/schemas/primitives";
import { assertNever } from "./assert";

export type Bump = "patch" | "minor" | "major";

export type UnsupportedReason = "workspace" | "url" | "tag" | "invalid";

export type Assessment =
  | { kind: "current"; current: SemverString; latest: SemverString }
  | { kind: "behind"; bump: Bump; current: SemverString; latest: SemverString; inRange: boolean }
  | { kind: "ahead"; current: SemverString; latest: SemverString }
  | { kind: "unsupported"; reason: UnsupportedReason; range: string };

const URL_PREFIXES = ["http:", "https:", "git:", "git+", "github:", "file:", "link:", "npm:"];

function unsupportedReason(range: string): UnsupportedReason | null {
  const value = range.trim();
  if (value.startsWith("workspace:")) return "workspace";
  if (URL_PREFIXES.some((prefix) => value.startsWith(prefix)) || value.includes("/")) return "url";
  if (value === "" || value === "*" || value === "latest" || value === "next" || value === "x") return "tag";
  if (semver.validRange(value) === null) return "invalid";
  return null;
}

function toBump(current: semver.SemVer, latest: semver.SemVer): Bump {
  if (latest.major !== current.major) return "major";
  if (latest.minor !== current.minor) return current.major === 0 ? "major" : "minor";
  if (latest.patch !== current.patch) return current.major === 0 && current.minor === 0 ? "major" : "patch";
  return "patch";
}

export function assess(range: string, latest: SemverString): Assessment {
  const reason = unsupportedReason(range);
  if (reason !== null) return { kind: "unsupported", reason, range };

  const floor = semver.minVersion(range);
  const latestVersion = semver.parse(latest);
  if (floor === null || latestVersion === null) return { kind: "unsupported", reason: "invalid", range };

  const current = floor.version as SemverString;
  const order = semver.compare(floor, latestVersion);

  if (order === 0) return { kind: "current", current, latest };
  if (order > 0) return { kind: "ahead", current, latest };

  return {
    kind: "behind",
    bump: toBump(floor, latestVersion),
    current,
    latest,
    inRange: semver.satisfies(latestVersion, range),
  };
}

export function bumpRank(bump: Bump): number {
  switch (bump) {
    case "patch":
      return 1;
    case "minor":
      return 2;
    case "major":
      return 3;
    default:
      return assertNever(bump);
  }
}

export function describeAssessment(assessment: Assessment): string {
  switch (assessment.kind) {
    case "current":
      return "Up to date";
    case "ahead":
      return "Ahead of latest";
    case "behind":
      if (assessment.inRange) return `${assessment.bump} update within your range`;
      return `${assessment.bump} update`;
    case "unsupported":
      switch (assessment.reason) {
        case "workspace":
          return "Workspace package";
        case "url":
          return "Installed from a URL";
        case "tag":
          return "Tracks a dist-tag";
        case "invalid":
          return "Range not recognised";
        default:
          return assertNever(assessment.reason);
      }
    default:
      return assertNever(assessment);
  }
}
