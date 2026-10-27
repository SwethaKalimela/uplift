import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import semver from "semver";
import type { PackageName } from "@/shared/schemas/primitives";
import { NpmPackumentSchema, type PackageSummary, PackageSummarySchema } from "@/shared/schemas/registry";
import { fetchUpstream, readJson } from "./http";
import { parseGitHubRepo } from "./repository";

const REGISTRY = "https://registry.npmjs.org";
const VERSION_HISTORY_LIMIT = 40;

export type PackageLookup = { status: "found"; summary: PackageSummary } | { status: "missing"; name: PackageName };

function encodeName(name: string) {
  return name.startsWith("@") ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name);
}

export async function getPackageSummary(name: PackageName): Promise<PackageLookup> {
  "use cache";
  cacheLife("hours");
  cacheTag(`package:${name}`);

  const response = await fetchUpstream(`${REGISTRY}/${encodeName(name)}`);
  if (response.status === 404) return { status: "missing", name };

  const packument = NpmPackumentSchema.parse(await readJson("npm registry", response));
  const latest = packument["dist-tags"].latest;
  if (!latest || !semver.valid(latest)) return { status: "missing", name };

  const time = packument.time ?? {};
  const latestManifest = packument.versions[latest];
  const deprecated = latestManifest?.deprecated;

  const versions = Object.entries(packument.versions)
    .filter(([version]) => semver.valid(version) !== null)
    .map(([version, manifest]) => ({
      version,
      publishedAt: time[version] ?? null,
      deprecated: Boolean(manifest.deprecated),
    }))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, VERSION_HISTORY_LIMIT);

  const license = typeof packument.license === "string" ? packument.license : (packument.license?.type ?? null);

  const summary = PackageSummarySchema.parse({
    name,
    description: packument.description ?? null,
    license,
    homepage: packument.homepage ?? null,
    repository: parseGitHubRepo(packument.repository) ?? parseGitHubRepo(latestManifest?.repository),
    latest,
    latestPublishedAt: time[latest] ?? null,
    deprecated: typeof deprecated === "string" && deprecated.length > 0 ? deprecated : deprecated === true ? "Deprecated" : null,
    versionCount: Object.keys(packument.versions).length,
    versions,
  });

  return { status: "found", summary };
}
