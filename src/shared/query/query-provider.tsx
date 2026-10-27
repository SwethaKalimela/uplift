"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import dynamic from "next/dynamic";
import { type ReactNode, useState } from "react";
import { getQueryClient } from "./client";
import { createPersistOptions } from "./persister";

const Devtools = dynamic(() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools), {
  ssr: false,
});

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [persistOptions] = useState(createPersistOptions);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={() => queryClient.resumePausedMutations()}
    >
      {children}
      {process.env.NODE_ENV === "development" && <Devtools buttonPosition="bottom-left" />}
    </PersistQueryClientProvider>
  );
}
