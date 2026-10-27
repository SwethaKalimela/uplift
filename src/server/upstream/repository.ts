import type { GitHubRepo } from "@/shared/schemas/registry";

const PATTERNS = [
  /^github:([^/\s]+)\/([^/#\s]+)/i,
  /github\.com[/:]([^/\s]+)\/([^/#?\s]+)/i,
  /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/,
];

export function parseGitHubRepo(value: string | { url?: string | undefined } | undefined): GitHubRepo | null {
  const raw = typeof value === "string" ? value : value?.url;
  if (!raw) return null;

  for (const pattern of PATTERNS) {
    const match = raw.trim().match(pattern);
    if (match?.[1] && match[2]) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}
