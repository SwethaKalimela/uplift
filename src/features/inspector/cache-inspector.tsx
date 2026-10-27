"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/shared/store/workspace";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

type Snapshot = {
  hash: string;
  status: string;
  fetchStatus: string;
  stale: boolean;
  observers: number;
};

type LogItem = { id: number; at: string; text: string };

function toneFor(row: Snapshot) {
  if (row.fetchStatus === "fetching") return "minor" as const;
  if (row.status === "error") return "danger" as const;
  if (row.stale) return "outline" as const;
  return "success" as const;
}

export function CacheInspector() {
  const open = useWorkspace((state) => state.inspectorOpen);
  const setOpen = useWorkspace((state) => state.setInspectorOpen);
  const faultSaves = useWorkspace((state) => state.faultSaves);
  const setFaultSaves = useWorkspace((state) => state.setFaultSaves);
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Snapshot[]>([]);
  const [log, setLog] = useState<LogItem[]>([]);

  useEffect(() => {
    const cache = queryClient.getQueryCache();
    let alive = true;
    const sync = () => {
      if (!alive) return;
      setRows(
        cache.getAll().map((query) => ({
          hash: query.queryHash,
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          stale: query.isStale(),
          observers: query.getObserversCount(),
        })),
      );
    };
    sync();
    const unsubscribe = cache.subscribe((event) => {
      queueMicrotask(() => {
        if (!alive) return;
        sync();
        if (event.type === "updated") {
          const action = event.action.type;
          if (action === "success" || action === "error" || action === "fetch") {
            setLog((current) =>
              [{ id: Date.now(), at: new Date().toLocaleTimeString(), text: `${action} ${event.query.queryHash}` }, ...current].slice(0, 40),
            );
          }
        }
      });
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [queryClient]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-[70dvh]">
        <SheetHeader>
          <SheetTitle>Query cache</SheetTitle>
          <SheetDescription>Live view of TanStack Query. Fresh, stale, fetching, or inactive.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 overflow-auto px-6 py-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Queries</h3>
              <div className="flex items-center gap-2">
                {process.env.NODE_ENV !== "production" && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={faultSaves} onChange={(event) => setFaultSaves(event.target.checked)} />
                    Force next save to fail
                  </label>
                )}
                <Button size="sm" variant="ghost" onClick={() => queryClient.invalidateQueries()}>
                  Invalidate all
                </Button>
              </div>
            </div>
            <ul className="flex flex-col gap-2 font-mono text-xs">
              {rows.map((row) => (
                <li key={row.hash} className="rounded-md border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={toneFor(row)}>{row.fetchStatus === "fetching" ? "fetching" : row.stale ? "stale" : row.status}</Badge>
                    <span className="text-muted-foreground">{row.observers} observers</span>
                  </div>
                  <p className="mt-1 break-all text-muted-foreground">{row.hash}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Event log</h3>
            <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
              {log.map((item) => (
                <li key={item.id}>
                  {item.at} {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
