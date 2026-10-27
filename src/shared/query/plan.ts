import { queryOptions } from "@tanstack/react-query";
import { PlanSchema } from "@/shared/schemas/plan";
import type { PlanId } from "@/shared/schemas/primitives";
import { apiFetch } from "./api";
import { queryKeys } from "./keys";

export function planQuery(id: PlanId) {
  return queryOptions({
    queryKey: queryKeys.plan(id),
    queryFn: ({ signal }) => apiFetch(`/api/plans/${id}`, PlanSchema, { signal }),
    staleTime: 30_000,
    meta: { label: "upgrade plan", persist: false },
  });
}
