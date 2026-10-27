import type { Bump } from "@/shared/domain/bump";
import type { DependencySpec } from "@/shared/domain/manifest";
import type { DependencyGroup, PackageName, PlanId, SemverString } from "@/shared/schemas/primitives";

export type ProjectSource = "paste" | "file" | "sample";

export type Project = {
  name: string | null;
  dependencies: DependencySpec[];
  source: ProjectSource;
  importedAt: number;
};

export type BumpFilter = "all" | "outdated" | Bump;
export type SortKey = "name" | "bump" | "downloads" | "published";
export type SortDirection = "asc" | "desc";

export type Filters = {
  search: string;
  bump: BumpFilter;
  group: DependencyGroup | "all";
  riskyOnly: boolean;
};

export type Sort = { key: SortKey; direction: SortDirection };

export type DraftItem = {
  name: PackageName;
  target: SemverString;
  note: string;
};

export type ProjectSlice = {
  project: Project | null;
  setProject: (project: Omit<Project, "importedAt">) => void;
  clearProject: () => void;
};

export type FilterSlice = {
  filters: Filters;
  sort: Sort;
  setSearch: (search: string) => void;
  setBumpFilter: (bump: BumpFilter) => void;
  setGroup: (group: Filters["group"]) => void;
  toggleRiskyOnly: () => void;
  setSort: (key: SortKey) => void;
  resetFilters: () => void;
};

export type DraftSlice = {
  draft: DraftItem[];
  editTokens: Record<PlanId, string>;
  savedPlanId: PlanId | null;
  addToDraft: (name: PackageName, target: SemverString) => void;
  addManyToDraft: (items: ReadonlyArray<{ name: PackageName; target: SemverString }>) => void;
  removeFromDraft: (name: PackageName) => void;
  moveDraftItem: (from: number, to: number) => void;
  setDraftNote: (name: PackageName, note: string) => void;
  clearDraft: () => void;
  rememberEditToken: (id: PlanId, token: string) => void;
  setSavedPlanId: (id: PlanId | null) => void;
};

export type PanelSlice = {
  inspectorOpen: boolean;
  commandOpen: boolean;
  planOpen: boolean;
  planAutoOpen: boolean;
  autoOpenSeq: number;
  countPulse: number;
  faultSaves: boolean;
  setInspectorOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setPlanOpen: (open: boolean) => void;
  setFaultSaves: (fault: boolean) => void;
};

export type WorkspaceState = ProjectSlice & FilterSlice & DraftSlice & PanelSlice;
