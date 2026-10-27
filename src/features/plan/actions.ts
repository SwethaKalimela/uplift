"use server";

import { createPlan, getPlan, PlanError, reorderItems, updateItem } from "@/server/db/plans";
import type { ActionResult } from "@/shared/schemas/action";
import { CreatePlanInputSchema, type CreatePlanResult, type Plan, PlanItemStatusSchema } from "@/shared/schemas/plan";
import { z } from "zod";

async function wrap<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof PlanError) return { ok: false, status: error.status, error: error.message };
    if (error instanceof z.ZodError) return { ok: false, status: 400, error: "Invalid plan payload" };
    return { ok: false, status: 500, error: "Could not save the plan" };
  }
}

export async function createPlanAction(input: unknown): Promise<ActionResult<CreatePlanResult>> {
  return wrap(async () => createPlan(CreatePlanInputSchema.parse(input)));
}

export async function getPlanAction(id: string): Promise<ActionResult<Plan>> {
  return wrap(async () => getPlan(id));
}

export async function updateItemAction(input: unknown): Promise<ActionResult<Plan>> {
  return wrap(async () => {
    const parsed = z
      .object({
        id: z.string(),
        token: z.string(),
        itemId: z.string(),
        note: z.string().max(500).optional(),
        status: PlanItemStatusSchema.optional(),
        fault: z.boolean().optional(),
      })
      .parse(input);
    return updateItem(parsed.id, parsed.token, parsed.itemId, { note: parsed.note, status: parsed.status }, parsed.fault);
  });
}

export async function reorderPlanAction(input: unknown): Promise<ActionResult<Plan>> {
  return wrap(async () => {
    const parsed = z
      .object({
        id: z.string(),
        token: z.string(),
        orderedIds: z.array(z.string()).min(1),
        fault: z.boolean().optional(),
      })
      .parse(input);
    return reorderItems(parsed.id, parsed.token, parsed.orderedIds, parsed.fault);
  });
}
