import type { Plan } from "@/shared/schemas/plan";

export type StoredPlan = Plan & { editTokenHash: string };

type Store = Map<string, StoredPlan>;

function memory(): Store {
  const globalStore = globalThis as { __upliftPlans?: Store };
  globalStore.__upliftPlans ??= new Map();
  return globalStore.__upliftPlans;
}

export function memoryGet(id: string) {
  return memory().get(id) ?? null;
}

export function memorySave(plan: StoredPlan) {
  memory().set(plan.id, plan);
}

export function memoryList() {
  return [...memory().values()];
}
