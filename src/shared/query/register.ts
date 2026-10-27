import type { ApiError } from "./errors";

export type UpliftQueryMeta = {
  persist?: boolean;
  label?: string;
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    queryMeta: UpliftQueryMeta;
    mutationMeta: UpliftQueryMeta;
  }
}
