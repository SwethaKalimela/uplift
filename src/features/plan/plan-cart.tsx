"use client";

import { ChevronDown, FileText, Link2, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { PlanSummaryList, usePlanSummary } from "./plan-summary";

const AUTO_CLOSE_MS = 5000;

export function PlanCartButton() {
  const project = useWorkspace((state) => state.project);
  const planOpen = useWorkspace((state) => state.planOpen);
  const planAutoOpen = useWorkspace((state) => state.planAutoOpen);
  const autoOpenSeq = useWorkspace((state) => state.autoOpenSeq);
  const countPulse = useWorkspace((state) => state.countPulse);
  const setPlanOpen = useWorkspace((state) => state.setPlanOpen);
  const pathname = usePathname();
  const { count, draft, savedPlanId, create, clearDraft } = usePlanSummary();
  const onPlanPage = pathname === "/plan";
  const rootRef = useRef<HTMLDivElement>(null);
  const open = planOpen;

  useEffect(() => {
    if (!open || !planAutoOpen) return;
    const timer = window.setTimeout(() => setPlanOpen(false), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, planAutoOpen, autoOpenSeq, setPlanOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlanOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (planAutoOpen) return;
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setPlanOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open, planAutoOpen, setPlanOpen]);

  if (!project) return null;

  return (
    <div ref={rootRef} className="relative flex items-center gap-0.5">
      <Button
        variant={open ? "secondary" : "ghost"}
        size="sm"
        className="relative overflow-visible"
        aria-expanded={open}
        aria-controls="upgrade-plan"
        aria-label={count === 0 ? "Plan" : `Plan, ${count} packages`}
        onClick={() => setPlanOpen(!planOpen)}
      >
        <span className="relative">
          <ShoppingCart />
          {count > 0 && (
            <span
              key={countPulse}
              className={cn(
                "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground tabular-nums",
                countPulse > 0 && "count-pulse-ring",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </span>
        Plan
        <span className={cn("inline-flex transition-transform duration-200 ease-out", open && "rotate-180")}>
          <ChevronDown className="size-3.5" />
        </span>
      </Button>
      <Button variant={onPlanPage ? "secondary" : "ghost"} size="sm" asChild>
        <Link href="/plan" onClick={() => setPlanOpen(false)}>
          <FileText />
          Open plan
        </Link>
      </Button>

      <div
        id="upgrade-plan"
        role="dialog"
        aria-hidden={!open}
        className={cn(
          "absolute top-full right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border bg-background shadow-xl transition-[opacity,transform,visibility] duration-200 ease-out",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b px-3 py-2">
          <div>
            <h2 className="text-sm font-medium">Upgrade plan</h2>
            <p className="text-xs text-muted-foreground">{count === 0 ? "Empty" : `${count} package${count === 1 ? "" : "s"}`}</p>
          </div>
          {draft.length > 0 && (
            <Button variant="ghost" size="sm" className="-mr-1 -mt-0.5 rounded-lg text-danger hover:bg-danger/20 hover:text-danger" onClick={clearDraft}>
              <Trash2 />
              Remove all
            </Button>
          )}
        </div>
        <div className="px-2 py-1">
          <PlanSummaryList compact />
        </div>
        {draft.length > 0 && !savedPlanId && (
          <div className="border-t px-3 py-2">
            <Button className="w-full" size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
              <Link2 />
              {create.isPending ? "Creating link" : "Create share link"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
