import type { Advisory, AdvisorySeverity } from "@/shared/schemas/registry";
import { assertNever } from "./assert";

export function severityRank(severity: AdvisorySeverity): number {
  switch (severity) {
    case "low":
      return 1;
    case "moderate":
      return 2;
    case "high":
      return 3;
    case "critical":
      return 4;
    default:
      return assertNever(severity);
  }
}

export function worstSeverity(advisories: readonly Advisory[]): AdvisorySeverity | null {
  let worst: AdvisorySeverity | null = null;
  for (const advisory of advisories) {
    if (worst === null || severityRank(advisory.severity) > severityRank(worst)) {
      worst = advisory.severity;
    }
  }
  return worst;
}
