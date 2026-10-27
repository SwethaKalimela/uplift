import type { PackageName, PlanId } from "@/shared/schemas/primitives";
import type { GitHubRepo } from "@/shared/schemas/registry";

const ROOT = "uplift";

export const queryKeys = {
  all: () => [ROOT] as const,
  packages: () => [ROOT, "package"] as const,
  package: (name: PackageName) => [ROOT, "package", name] as const,
  downloads: (names: readonly PackageName[]) => [ROOT, "downloads", [...names].sort()] as const,
  advisories: (installed: Readonly<Record<string, string>>) => [ROOT, "advisories", installed] as const,
  releases: (repo: GitHubRepo) => [ROOT, "releases", repo.owner.toLowerCase(), repo.repo.toLowerCase()] as const,
  plans: () => [ROOT, "plan"] as const,
  plan: (id: PlanId) => [ROOT, "plan", id] as const,
} satisfies Record<string, (...args: never[]) => readonly [typeof ROOT, ...unknown[]]>;

export type QueryKeyOf<K extends keyof typeof queryKeys> = ReturnType<(typeof queryKeys)[K]>;

export function isPackageKey(key: readonly unknown[]): key is QueryKeyOf<"package"> {
  return key[0] === ROOT && key[1] === "package" && typeof key[2] === "string";
}
