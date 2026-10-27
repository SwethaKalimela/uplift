import type { PlanId } from "@/shared/schemas/primitives";
import { defaultFilters } from "./slices";
import type { DraftItem, Filters, Project, Sort } from "./types";

export const STORE_VERSION = 3;

export type PersistedWorkspace = {
  project: Project | null;
  filters: Filters;
  sort: Sort;
  draft: DraftItem[];
  editTokens: Record<PlanId, string>;
  savedPlanId: PlanId | null;
};

type V1Workspace = Omit<PersistedWorkspace, "draft" | "editTokens"> & {
  draft: Array<Pick<DraftItem, "name" | "target">>;
  planTokens?: Record<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateWorkspace(persisted: unknown, version: number): PersistedWorkspace {
  if (!isRecord(persisted)) return emptyWorkspace();

  if (version < 2) {
    const v1 = persisted as Partial<V1Workspace>;
    return {
      project: v1.project ?? null,
      filters: { ...defaultFilters, ...v1.filters },
      sort: v1.sort ?? { key: "bump", direction: "desc" },
      draft: (v1.draft ?? []).map((item) => ({ ...item, note: "" })),
      editTokens: (v1.planTokens ?? {}) as Record<PlanId, string>,
      savedPlanId: null,
    };
  }

  const current = persisted as Partial<PersistedWorkspace>;
  return {
    project: current.project ?? null,
    filters: { ...defaultFilters, ...current.filters },
    sort: current.sort ?? { key: "bump", direction: "desc" },
    draft: current.draft ?? [],
    editTokens: current.editTokens ?? {},
    savedPlanId: current.savedPlanId ?? null,
  };
}

export function emptyWorkspace(): PersistedWorkspace {
  return {
    project: null,
    filters: defaultFilters,
    sort: { key: "bump", direction: "desc" },
    draft: [],
    editTokens: {},
    savedPlanId: null,
  };
}
