"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/cn";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { exportDraft, exportPlan } from "./export";
import { usePlanMutations } from "./use-plan-mutations";

const CART_LINE = "flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/40";

export function usePlanSummary() {
  const draft = useWorkspace((state) => state.draft);
  const removeFromDraft = useWorkspace((state) => state.removeFromDraft);
  const setDraftNote = useWorkspace((state) => state.setDraftNote);
  const clearDraft = useWorkspace((state) => state.clearDraft);
  const moveDraftItem = useWorkspace((state) => state.moveDraftItem);
  const projectName = useWorkspace((state) => state.project?.name);
  const { plan, create, patchItem, reorder, savedPlanId } = usePlanMutations();
  const items = plan.data?.items ?? [];
  const title = plan.data?.name ?? (projectName ? `${projectName} upgrades` : "Upgrade plan");
  const exported = plan.data ? exportPlan(plan.data) : exportDraft(title, draft);
  const count = draft.length;
  const empty = count === 0;

  const copy = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label);
    } catch {
      toast.error("Could not copy");
    }
  };

  return {
    draft,
    items,
    title,
    exported,
    count,
    empty,
    savedPlanId,
    projectName,
    create,
    patchItem,
    reorder,
    removeFromDraft,
    setDraftNote,
    clearDraft,
    moveDraftItem,
    copy,
  };
}

export function PlanSummaryList({ compact = false }: { compact?: boolean }) {
  const { draft, empty, removeFromDraft } = usePlanSummary();

  if (empty) {
    return <p className={cn("text-sm text-muted-foreground", compact ? "px-1 py-5" : "py-12")}>Add outdated packages from the table.</p>;
  }

  const CART_LIMIT = 3;
  const shown = draft.slice(0, CART_LIMIT);
  const rest = draft.length - CART_LIMIT;

  return (
    <div>
      <ul>
        {shown.map((item) => (
          <li key={item.name} className={CART_LINE}>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{item.target}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.name}`} onClick={() => removeFromDraft(item.name)}>
              <X />
            </Button>
          </li>
        ))}
      </ul>
      {rest > 0 && <p className="px-1 py-1.5 text-xs text-muted-foreground">+{rest} more in the plan</p>}
    </div>
  );
}
