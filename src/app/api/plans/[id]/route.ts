import { getPlan, PlanError } from "@/server/db/plans";
import { fromError, json, problem } from "@/server/http/respond";

export async function GET(_request: Request, context: RouteContext<"/api/plans/[id]">) {
  const { id } = await context.params;
  try {
    return json(await getPlan(id));
  } catch (error) {
    if (error instanceof PlanError) return problem(error.status, error.message);
    return fromError(error);
  }
}
