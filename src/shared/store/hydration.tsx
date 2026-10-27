"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useWorkspace } from "./workspace";

function subscribe(onChange: () => void) {
  const unsubscribeStart = useWorkspace.persist.onHydrate(onChange);
  const unsubscribeFinish = useWorkspace.persist.onFinishHydration(onChange);
  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function useStoreHydrated() {
  return useSyncExternalStore(subscribe, () => useWorkspace.persist.hasHydrated(), () => false);
}

export function WorkspaceHydrator() {
  useEffect(() => {
    void useWorkspace.persist.rehydrate();
  }, []);
  return null;
}
