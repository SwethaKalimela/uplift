import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { createLimiter } from "@/shared/lib/limiter";
import type { PackageName } from "@/shared/schemas/primitives";
import {
  AdvisoriesSchema,
  DownloadsSchema,
  type GitHubRepo,
  PackageSummarySchema,
  ReleasePageSchema,
} from "@/shared/schemas/registry";
import { apiFetch } from "./api";
import { queryKeys } from "./keys";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const freshness = {
  package: HOUR,
  downloads: DAY,
  advisories: 15 * MINUTE,
  releases: HOUR,
} as const;

export const packageRequests = createLimiter(6);

function encodePackagePath(name: PackageName) {
  return name.split("/").map(encodeURIComponent).join("/");
}

export function packageQuery(name: PackageName) {
  return queryOptions({
    queryKey: queryKeys.package(name),
    queryFn: ({ signal }) =>
      packageRequests.run(() => apiFetch(`/api/packages/${encodePackagePath(name)}`, PackageSummarySchema, { signal })),
    staleTime: freshness.package,
    meta: { label: name },
  });
}

export function downloadsQuery(names: readonly PackageName[]) {
  return queryOptions({
    queryKey: queryKeys.downloads(names),
    queryFn: ({ signal }) => apiFetch("/api/downloads", DownloadsSchema, { method: "POST", body: { names }, signal }),
    staleTime: freshness.downloads,
    enabled: names.length > 0,
    meta: { label: "weekly downloads" },
  });
}

export function advisoriesQuery(installed: Readonly<Record<string, string>>) {
  return queryOptions({
    queryKey: queryKeys.advisories(installed),
    queryFn: ({ signal }) => apiFetch("/api/advisories", AdvisoriesSchema, { method: "POST", body: { installed }, signal }),
    staleTime: freshness.advisories,
    refetchOnWindowFocus: true,
    enabled: Object.keys(installed).length > 0,
    meta: { label: "security advisories" },
  });
}

export function releasesQuery(repo: GitHubRepo) {
  return infiniteQueryOptions({
    queryKey: queryKeys.releases(repo),
    queryFn: ({ pageParam, signal }) =>
      apiFetch(
        `/api/releases/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}?page=${pageParam}`,
        ReleasePageSchema,
        { signal },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: freshness.releases,
    meta: { label: `${repo.owner}/${repo.repo} releases` },
  });
}
