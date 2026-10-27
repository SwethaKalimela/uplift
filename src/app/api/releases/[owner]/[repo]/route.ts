import { z } from "zod";
import { fromError, json, problem } from "@/server/http/respond";
import { getReleases } from "@/server/upstream/github";

const SegmentSchema = z.string().regex(/^[A-Za-z0-9._-]{1,100}$/);
const PageSchema = z.coerce.number().int().min(1).max(50).default(1);

export async function GET(request: Request, context: RouteContext<"/api/releases/[owner]/[repo]">) {
  const { owner, repo } = await context.params;
  const ownerResult = SegmentSchema.safeParse(owner);
  const repoResult = SegmentSchema.safeParse(repo);
  if (!ownerResult.success || !repoResult.success) return problem(400, "That is not a valid GitHub repository.");

  const page = PageSchema.safeParse(new URL(request.url).searchParams.get("page") ?? undefined);
  if (!page.success) return problem(400, "Page must be a number between 1 and 50.");

  try {
    const releases = await getReleases({ owner: ownerResult.data, repo: repoResult.data }, page.data);
    return json(releases, { maxAge: 3600, staleWhileRevalidate: 86_400 });
  } catch (error) {
    return fromError(error);
  }
}
