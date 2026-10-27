import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import type { GitHubRepo, ReleasePage } from "@/shared/schemas/registry";
import { fetchUpstream, readJson } from "./http";

export const RELEASES_PER_PAGE = 10;
const BODY_LIMIT = 6000;

const GitHubReleaseSchema = z.object({
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable(),
  published_at: z.string().nullable(),
  html_url: z.string(),
  body: z.string().nullable(),
  prerelease: z.boolean(),
  draft: z.boolean(),
});

export async function getReleases(repo: GitHubRepo, page: number): Promise<ReleasePage> {
  "use cache";
  cacheLife("hours");
  cacheTag(`releases:${repo.owner}/${repo.repo}`);

  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`;

  const response = await fetchUpstream(url, {
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) return { releases: [], nextPage: null };

  const releases = z.array(GitHubReleaseSchema).parse(await readJson("GitHub", response));

  return {
    releases: releases
      .filter((release) => !release.draft)
      .map((release) => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at,
        url: release.html_url,
        body: (release.body ?? "").slice(0, BODY_LIMIT),
        prerelease: release.prerelease,
      })),
    nextPage: releases.length === RELEASES_PER_PAGE ? page + 1 : null,
  };
}
