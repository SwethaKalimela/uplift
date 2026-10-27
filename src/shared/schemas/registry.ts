import { z } from "zod";
import { PackageNameSchema, SemverStringSchema } from "./primitives";

const RepositoryFieldSchema = z.union([z.string(), z.object({ url: z.string().optional() })]).optional();

export const NpmPackumentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  license: z.union([z.string(), z.object({ type: z.string() })]).optional(),
  homepage: z.string().optional(),
  repository: RepositoryFieldSchema,
  "dist-tags": z.record(z.string(), z.string()),
  time: z.record(z.string(), z.string()).optional(),
  versions: z.record(
    z.string(),
    z.object({
      deprecated: z.union([z.string(), z.boolean()]).optional(),
      repository: RepositoryFieldSchema,
    }),
  ),
});
export type NpmPackument = z.infer<typeof NpmPackumentSchema>;

export const GitHubRepoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
});
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

export const VersionEntrySchema = z.object({
  version: SemverStringSchema,
  publishedAt: z.string().nullable(),
  deprecated: z.boolean(),
});
export type VersionEntry = z.infer<typeof VersionEntrySchema>;

export const PackageSummarySchema = z.object({
  name: PackageNameSchema,
  description: z.string().nullable(),
  license: z.string().nullable(),
  homepage: z.string().nullable(),
  repository: GitHubRepoSchema.nullable(),
  latest: SemverStringSchema,
  latestPublishedAt: z.string().nullable(),
  deprecated: z.string().nullable(),
  versionCount: z.number().int().nonnegative(),
  versions: z.array(VersionEntrySchema),
});
export type PackageSummary = z.infer<typeof PackageSummarySchema>;

export const DownloadsSchema = z.record(z.string(), z.number().int().nonnegative().nullable());
export type Downloads = z.infer<typeof DownloadsSchema>;

export const AdvisorySeveritySchema = z.enum(["low", "moderate", "high", "critical"]);
export type AdvisorySeverity = z.infer<typeof AdvisorySeveritySchema>;

export const AdvisorySchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  severity: AdvisorySeveritySchema,
  vulnerableVersions: z.string(),
});
export type Advisory = z.infer<typeof AdvisorySchema>;

export const AdvisoriesSchema = z.record(z.string(), z.array(AdvisorySchema));
export type Advisories = z.infer<typeof AdvisoriesSchema>;

export const ReleaseSchema = z.object({
  id: z.number(),
  tagName: z.string(),
  name: z.string().nullable(),
  publishedAt: z.string().nullable(),
  url: z.string(),
  body: z.string(),
  prerelease: z.boolean(),
});
export type Release = z.infer<typeof ReleaseSchema>;

export const ReleasePageSchema = z.object({
  releases: z.array(ReleaseSchema),
  nextPage: z.number().int().positive().nullable(),
});
export type ReleasePage = z.infer<typeof ReleasePageSchema>;
