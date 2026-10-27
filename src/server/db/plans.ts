import "server-only";

import { asc, eq } from "drizzle-orm";
import { PlanItemSchema, type CreatePlanInput, type Plan, type PlanItem, type PlanItemStatus } from "@/shared/schemas/plan";
import { PlanIdSchema } from "@/shared/schemas/primitives";
import { getPostgres } from "./client";
import { memoryGet, memorySave } from "./memory";
import { planItems, plans } from "./schema";
import { hashToken, newEditToken, newItemId, newPlanId, tokensMatch } from "./token";

export class PlanError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "PlanError";
  }
}

function maybeFault(fault: boolean | undefined) {
  if (fault && process.env.NODE_ENV !== "production") {
    throw new PlanError(500, "Simulated save failure");
  }
}

function toPublic(plan: Plan): Plan {
  return {
    ...plan,
    items: [...plan.items].sort((a, b) => a.position - b.position),
  };
}

export async function createPlan(input: CreatePlanInput) {
  maybeFault(input.fault);
  const id = PlanIdSchema.parse(newPlanId());
  const editToken = newEditToken();
  const now = new Date().toISOString();
  const items: PlanItem[] = input.items.map((item, position) => ({
    id: newItemId(),
    name: item.name,
    target: item.target,
    position,
    note: item.note,
    status: "todo",
  }));
  const plan: Plan = {
    id,
    name: input.name,
    projectName: input.projectName,
    items,
    createdAt: now,
    updatedAt: now,
  };
  const record = { ...plan, editTokenHash: hashToken(editToken) };

  const db = getPostgres();
  if (db) {
    await db.insert(plans).values({
      id: plan.id,
      name: plan.name,
      projectName: plan.projectName,
      snapshot: input.items,
      editTokenHash: record.editTokenHash,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    });
    if (items.length > 0) {
      await db.insert(planItems).values(
        items.map((item) => ({
          id: item.id,
          planId: plan.id,
          packageName: item.name,
          target: item.target,
          position: item.position,
          note: item.note,
          status: item.status,
        })),
      );
    }
  } else {
    memorySave(record);
  }

  return { plan: toPublic(plan), editToken };
}

export async function getPlan(id: string): Promise<Plan> {
  const parsed = PlanIdSchema.safeParse(id);
  if (!parsed.success) throw new PlanError(400, "Invalid plan id");

  const db = getPostgres();
  if (db) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, parsed.data));
    if (!plan) throw new PlanError(404, "Plan not found");
    const rows = await db.select().from(planItems).where(eq(planItems.planId, plan.id)).orderBy(asc(planItems.position));
    return toPublic({
      id: PlanIdSchema.parse(plan.id),
      name: plan.name,
      projectName: plan.projectName,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      items: rows.map((row) =>
        PlanItemSchema.parse({
          id: row.id,
          name: row.packageName,
          target: row.target,
          position: row.position,
          note: row.note,
          status: row.status,
        }),
      ),
    });
  }

  const stored = memoryGet(parsed.data);
  if (!stored) throw new PlanError(404, "Plan not found");
  return toPublic(stored);
}

async function loadForEdit(id: string, token: string) {
  const plan = await getPlan(id);
  const db = getPostgres();
  const hash = db
    ? (await db.select({ hash: plans.editTokenHash }).from(plans).where(eq(plans.id, plan.id)))[0]?.hash
    : memoryGet(plan.id)?.editTokenHash;
  if (!hash || !tokensMatch(token, hash)) throw new PlanError(403, "This link cannot edit the plan");
  return plan;
}

export async function updateItem(
  id: string,
  token: string,
  itemId: string,
  patch: { note?: string; status?: PlanItemStatus },
  fault?: boolean,
) {
  maybeFault(fault);
  const plan = await loadForEdit(id, token);
  const items = plan.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
  if (!items.some((item) => item.id === itemId)) throw new PlanError(404, "Item not found");
  return persist(plan, items);
}

export async function reorderItems(id: string, token: string, orderedIds: string[], fault?: boolean) {
  maybeFault(fault);
  const plan = await loadForEdit(id, token);
  const byId = new Map(plan.items.map((item) => [item.id, item]));
  if (orderedIds.length !== plan.items.length || orderedIds.some((itemId) => !byId.has(itemId))) {
    throw new PlanError(400, "Order does not match the plan");
  }
  const items = orderedIds.map((itemId, position) => {
    const item = byId.get(itemId);
    if (!item) throw new PlanError(400, "Order does not match the plan");
    return { ...item, position };
  });
  return persist(plan, items);
}

async function persist(plan: Plan, items: PlanItem[]) {
  const updated: Plan = { ...plan, items, updatedAt: new Date().toISOString() };
  const db = getPostgres();
  if (db) {
    await db.update(plans).set({ updatedAt: new Date(updated.updatedAt) }).where(eq(plans.id, plan.id));
    for (const item of items) {
      await db
        .update(planItems)
        .set({ note: item.note, status: item.status, position: item.position })
        .where(eq(planItems.id, item.id));
    }
  } else {
    const stored = memoryGet(plan.id);
    if (!stored) throw new PlanError(404, "Plan not found");
    memorySave({ ...stored, ...updated });
  }
  return toPublic(updated);
}
