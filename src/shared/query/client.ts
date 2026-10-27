import { defaultShouldDehydrateQuery, isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { retryDelay, shouldRetry } from "./errors";
import "./register";

const DAY = 24 * 60 * 60 * 1000;

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isServer || query.state.data === undefined) return;
        toast.error(`Could not refresh ${query.meta?.label ?? "data"}`, { description: error.message });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.options.onError) return;
        toast.error("Change not saved", { description: error.message });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: DAY,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: (failureCount, error) => error.status === 0 && failureCount < 3,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
