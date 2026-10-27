import type { PackageName } from "@/shared/schemas/primitives";
import type { WorkspaceState } from "./types";

export const selectProject = (state: WorkspaceState) => state.project;
export const selectDependencies = (state: WorkspaceState) => state.project?.dependencies ?? [];
export const selectFilters = (state: WorkspaceState) => state.filters;
export const selectSort = (state: WorkspaceState) => state.sort;
export const selectDraft = (state: WorkspaceState) => state.draft;
export const selectDraftCount = (state: WorkspaceState) => state.draft.length;

export const selectIsInDraft = (name: PackageName) => (state: WorkspaceState) =>
  state.draft.some((item) => item.name === name);

export const selectDraftNote = (name: PackageName) => (state: WorkspaceState) =>
  state.draft.find((item) => item.name === name)?.note ?? "";

export const selectDraftActions = (state: WorkspaceState) => ({
  addToDraft: state.addToDraft,
  addManyToDraft: state.addManyToDraft,
  removeFromDraft: state.removeFromDraft,
  moveDraftItem: state.moveDraftItem,
  setDraftNote: state.setDraftNote,
  clearDraft: state.clearDraft,
});

export const selectFilterActions = (state: WorkspaceState) => ({
  setSearch: state.setSearch,
  setBumpFilter: state.setBumpFilter,
  setGroup: state.setGroup,
  toggleRiskyOnly: state.toggleRiskyOnly,
  setSort: state.setSort,
  resetFilters: state.resetFilters,
});
