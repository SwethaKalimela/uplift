import type { StateCreator } from "zustand";
import type { DraftSlice, FilterSlice, Filters, PanelSlice, ProjectSlice, WorkspaceState } from "./types";

type Middlewares = [["zustand/devtools", never], ["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]];
type Slice<T> = StateCreator<WorkspaceState, Middlewares, [], T>;

export const defaultFilters: Filters = { search: "", bump: "all", group: "all", riskyOnly: false };

export const createProjectSlice: Slice<ProjectSlice> = (set) => ({
  project: null,
  setProject: (project) =>
    set(
      { project: { ...project, importedAt: Date.now() }, filters: defaultFilters, draft: [], savedPlanId: null },
      false,
      "project/set",
    ),
  clearProject: () => set({ project: null }, false, "project/clear"),
});

export const createFilterSlice: Slice<FilterSlice> = (set) => ({
  filters: defaultFilters,
  sort: { key: "bump", direction: "desc" },
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } }), false, "filters/search"),
  setBumpFilter: (bump) => set((state) => ({ filters: { ...state.filters, bump } }), false, "filters/bump"),
  setGroup: (group) => set((state) => ({ filters: { ...state.filters, group } }), false, "filters/group"),
  toggleRiskyOnly: () =>
    set((state) => ({ filters: { ...state.filters, riskyOnly: !state.filters.riskyOnly } }), false, "filters/risky"),
  setSort: (key) =>
    set(
      (state) => ({
        sort:
          state.sort.key === key
            ? { key, direction: state.sort.direction === "asc" ? "desc" : "asc" }
            : { key, direction: key === "name" ? "asc" : "desc" },
      }),
      false,
      "sort/set",
    ),
  resetFilters: () => set({ filters: defaultFilters }, false, "filters/reset"),
});

export const createDraftSlice: Slice<DraftSlice> = (set) => ({
  draft: [],
  editTokens: {},
  savedPlanId: null,
  addToDraft: (name, target) =>
    set(
      (state) =>
        state.draft.some((item) => item.name === name)
          ? state
          : { draft: [...state.draft, { name, target, note: "" }] },
      false,
      "draft/add",
    ),
  addManyToDraft: (items) =>
    set(
      (state) => {
        const existing = new Set(state.draft.map((item) => item.name));
        const additions = items.filter((item) => !existing.has(item.name)).map((item) => ({ ...item, note: "" }));
        return additions.length === 0 ? state : { draft: [...state.draft, ...additions] };
      },
      false,
      "draft/addMany",
    ),
  removeFromDraft: (name) =>
    set((state) => ({ draft: state.draft.filter((item) => item.name !== name) }), false, "draft/remove"),
  moveDraftItem: (from, to) =>
    set(
      (state) => {
        if (from === to || from < 0 || to < 0 || from >= state.draft.length || to >= state.draft.length) return state;
        const draft = [...state.draft];
        const [moved] = draft.splice(from, 1);
        if (!moved) return state;
        draft.splice(to, 0, moved);
        return { draft };
      },
      false,
      "draft/move",
    ),
  setDraftNote: (name, note) =>
    set(
      (state) => ({ draft: state.draft.map((item) => (item.name === name ? { ...item, note } : item)) }),
      false,
      "draft/note",
    ),
  clearDraft: () => set({ draft: [] }, false, "draft/clear"),
  rememberEditToken: (id, token) =>
    set((state) => ({ editTokens: { ...state.editTokens, [id]: token } }), false, "plan/rememberToken"),
  setSavedPlanId: (savedPlanId) => set({ savedPlanId }, false, "plan/setId"),
});

export const createPanelSlice: Slice<PanelSlice> = (set) => ({
  inspectorOpen: false,
  commandOpen: false,
  faultSaves: false,
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }, false, "panel/inspector"),
  setCommandOpen: (commandOpen) => set({ commandOpen }, false, "panel/command"),
  setFaultSaves: (faultSaves) => set({ faultSaves }, false, "panel/fault"),
});
