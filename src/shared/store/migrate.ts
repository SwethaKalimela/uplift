import type { PlanId } from "@/shared/schemas/primitives";
import type { DraftItem, Project } from "./types";

export const STORE_VERSION = 4;

export type PersistedWorkspace = {
  project: Project | null;
  draft: DraftItem[];
  editTokens: Record<PlanId, string>;
  savedPlanId: PlanId | null;
};

type LegacyWorkspace = {
  project?: Project | null;
  filters?: Record<string, unknown>;
  sort?: unknown;
  draft?: Array<Pick<DraftItem, "name" | "target"> & Partial<DraftItem>>;
  editTokens?: Record<PlanId, string>;
  planTokens?: Record<string, string>;
  savedPlanId?: PlanId | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateWorkspace(persisted: unknown, version: number): PersistedWorkspace {
  if (!isRecord(persisted)) return emptyWorkspace();
  const current = persisted as LegacyWorkspace;

  return {
    project: current.project ?? null,
    draft: (current.draft ?? []).map((item) => ({ name: item.name, target: item.target, note: item.note ?? "" })),
    editTokens: (version < 2 ? current.planTokens : current.editTokens) ?? {},
    savedPlanId: version < 2 ? null : (current.savedPlanId ?? null),
  };
}

export function emptyWorkspace(): PersistedWorkspace {
  return {
    project: null,
    draft: [],
    editTokens: {},
    savedPlanId: null,
  };
}
