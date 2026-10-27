import { create } from "zustand";
import { createJSONStorage, devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { migrateWorkspace, type PersistedWorkspace, STORE_VERSION } from "./migrate";
import { createDraftSlice, createFilterSlice, createPanelSlice, createProjectSlice } from "./slices";
import type { WorkspaceState } from "./types";

export const useWorkspace = create<WorkspaceState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (...args) => ({
          ...createProjectSlice(...args),
          ...createFilterSlice(...args),
          ...createDraftSlice(...args),
          ...createPanelSlice(...args),
        }),
        {
          name: "uplift-workspace",
          version: STORE_VERSION,
          storage: createJSONStorage(() => localStorage),
          skipHydration: true,
          partialize: (state): PersistedWorkspace => ({
            project: state.project,
            filters: state.filters,
            sort: state.sort,
            draft: state.draft,
            editTokens: state.editTokens,
          }),
          migrate: migrateWorkspace,
        },
      ),
    ),
    { name: "Uplift workspace", enabled: process.env.NODE_ENV === "development" },
  ),
);

export function useWorkspaceShallow<T extends object>(selector: (state: WorkspaceState) => T) {
  return useWorkspace(useShallow(selector));
}
