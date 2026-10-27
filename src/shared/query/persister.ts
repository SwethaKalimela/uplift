import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Query } from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

export const CACHE_BUSTER = "uplift-cache-v1";
const MAX_AGE = 24 * 60 * 60 * 1000;

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function createPersistOptions(): Omit<PersistQueryClientOptions, "queryClient"> {
  const persister = createSyncStoragePersister({
    storage: typeof window === "undefined" ? noopStorage : window.localStorage,
    key: "uplift-query-cache",
    throttleTime: 1000,
  });

  return {
    persister,
    maxAge: MAX_AGE,
    buster: CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) => query.state.status === "success" && query.meta?.persist !== false,
    },
  };
}
