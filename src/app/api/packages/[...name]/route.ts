import { fromError, json, problem } from "@/server/http/respond";
import { getPackageSummary } from "@/server/upstream/npm";
import { PackageNameSchema } from "@/shared/schemas/primitives";

export async function GET(_request: Request, context: RouteContext<"/api/packages/[...name]">) {
  const { name: segments } = await context.params;
  const parsed = PackageNameSchema.safeParse(segments.map(decodeURIComponent).join("/"));
  if (!parsed.success) return problem(400, "That is not a valid npm package name.");

  try {
    const lookup = await getPackageSummary(parsed.data);
    if (lookup.status === "missing") return problem(404, `${parsed.data} is not on the npm registry.`);
    return json(lookup.summary, { maxAge: 3600, staleWhileRevalidate: 86_400 });
  } catch (error) {
    return fromError(error);
  }
}
