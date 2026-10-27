"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPlanAction, reorderPlanAction, updateItemAction } from "@/features/plan/actions";
import type { ActionResult } from "@/shared/schemas/action";
import { ApiError } from "@/shared/query/errors";
import { queryKeys } from "@/shared/query/keys";
import { planQuery } from "@/shared/query/plan";
import type { Plan, PlanItemStatus } from "@/shared/schemas/plan";
import type { PlanId } from "@/shared/schemas/primitives";
import { useWorkspace } from "@/shared/store/workspace";

const SCOPE = { id: "plan-writes" } as const;

async function unwrap<T>(result: Promise<ActionResult<T>>): Promise<T> {
  const resolved = await result;
  if (!resolved.ok) throw new ApiError(resolved.status, resolved.error);
  return resolved.data;
}

export function usePlanMutations() {
  const queryClient = useQueryClient();
  const draft = useWorkspace((state) => state.draft);
  const project = useWorkspace((state) => state.project);
  const savedPlanId = useWorkspace((state) => state.savedPlanId);
  const rememberEditToken = useWorkspace((state) => state.rememberEditToken);
  const setSavedPlanId = useWorkspace((state) => state.setSavedPlanId);
  const editTokens = useWorkspace((state) => state.editTokens);
  const faultSaves = useWorkspace((state) => state.faultSaves);
  const token = savedPlanId ? (editTokens[savedPlanId] ?? "") : "";

  const plan = useQuery({
    ...planQuery(savedPlanId ?? ("" as PlanId)),
    enabled: Boolean(savedPlanId),
  });

  const create = useMutation({
    mutationFn: () =>
      unwrap(
        createPlanAction({
          name: project?.name ? `${project.name} upgrades` : "Upgrade plan",
          projectName: project?.name ?? null,
          items: draft.map((item) => ({ name: item.name, target: item.target, note: item.note })),
          fault: faultSaves,
        }),
      ),
    networkMode: "offlineFirst",
    onSuccess: (result) => {
      rememberEditToken(result.plan.id, result.editToken);
      setSavedPlanId(result.plan.id);
      queryClient.setQueryData(queryKeys.plan(result.plan.id), result.plan);
      const url = `${window.location.origin}/p/${result.plan.id}`;
      const copied = navigator.clipboard
        ? navigator.clipboard.writeText(url).then(
            () => true,
            () => false,
          )
        : Promise.resolve(false);
      void copied.then((ok) => {
        toast.success(ok ? "Share link copied" : "Plan saved");
      });
    },
  });

  const patchItem = useMutation({
    scope: SCOPE,
    networkMode: "offlineFirst",
    mutationFn: (input: { itemId: string; note?: string; status?: PlanItemStatus }) => {
      if (!savedPlanId) throw new ApiError(400, "Save the plan first");
      return unwrap(updateItemAction({ id: savedPlanId, token, ...input, fault: faultSaves }));
    },
    onMutate: async (input) => {
      if (!savedPlanId) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: queryKeys.plan(savedPlanId) });
      const previous = queryClient.getQueryData<Plan>(queryKeys.plan(savedPlanId));
      queryClient.setQueryData<Plan>(queryKeys.plan(savedPlanId), (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === input.itemId ? { ...item, note: input.note ?? item.note, status: input.status ?? item.status } : item,
              ),
            }
          : current,
      );
      return { previous };
    },
    onError: (error, _input, context: { previous?: Plan } | undefined) => {
      if (savedPlanId && context?.previous) queryClient.setQueryData(queryKeys.plan(savedPlanId), context.previous);
      toast.error("Change rolled back", { description: error.message });
    },
  });

  const reorder = useMutation({
    scope: SCOPE,
    networkMode: "offlineFirst",
    mutationFn: (orderedIds: string[]) => {
      if (!savedPlanId) throw new ApiError(400, "Save the plan first");
      return unwrap(reorderPlanAction({ id: savedPlanId, token, orderedIds, fault: faultSaves }));
    },
    onMutate: async (orderedIds) => {
      if (!savedPlanId) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: queryKeys.plan(savedPlanId) });
      const previous = queryClient.getQueryData<Plan>(queryKeys.plan(savedPlanId));
      queryClient.setQueryData<Plan>(queryKeys.plan(savedPlanId), (current) => {
        if (!current) return current;
        const byId = new Map(current.items.map((item) => [item.id, item]));
        return {
          ...current,
          items: orderedIds.flatMap((itemId, position) => {
            const item = byId.get(itemId);
            return item ? [{ ...item, position }] : [];
          }),
        };
      });
      return { previous };
    },
    onError: (error, _input, context: { previous?: Plan } | undefined) => {
      if (savedPlanId && context?.previous) queryClient.setQueryData(queryKeys.plan(savedPlanId), context.previous);
      toast.error("Order rolled back", { description: error.message });
    },
  });

  return { plan, create, patchItem, reorder, savedPlanId, token };
}
