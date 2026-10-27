"use client";

import { ArrowDown, ArrowUp, Check, Link2, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/input";
import { exportDraft, exportPlan } from "./export";
import { usePlanMutations } from "./use-plan-mutations";

export function PlanPanel() {
  const draft = useWorkspace((state) => state.draft);
  const removeFromDraft = useWorkspace((state) => state.removeFromDraft);
  const setDraftNote = useWorkspace((state) => state.setDraftNote);
  const clearDraft = useWorkspace((state) => state.clearDraft);
  const moveDraftItem = useWorkspace((state) => state.moveDraftItem);
  const faultSaves = useWorkspace((state) => state.faultSaves);
  const setFaultSaves = useWorkspace((state) => state.setFaultSaves);
  const { plan, create, patchItem, reorder, savedPlanId } = usePlanMutations();
  const items = plan.data?.items ?? [];

  const projectName = useWorkspace((state) => state.project?.name);
  const exported = plan.data
    ? exportPlan(plan.data)
    : exportDraft(projectName ? `${projectName} upgrades` : "Upgrade plan", draft);

  const copy = async (value: string, label: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success(label);
  };

  const copyLink = async () => {
    if (!savedPlanId) return;
    await copy(`${window.location.origin}/p/${savedPlanId}`, "Share link copied");
  };

  return (
    <aside className="flex w-full flex-col gap-3 overflow-y-auto rounded-xl border bg-surface p-4 lg:w-80 lg:shrink-0">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Upgrade plan</h2>
        <span className="text-xs text-muted-foreground">{savedPlanId ? items.length : draft.length}</span>
      </div>

      {savedPlanId && plan.data ? (
        <ul className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{index + 1}</p>
                  <p className="font-medium">{item.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.target}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={item.status === "upgraded" ? "Mark as todo" : `Mark ${item.name} upgraded`}
                  onClick={() => patchItem.mutate({ itemId: item.id, status: item.status === "upgraded" ? "todo" : "upgraded" })}
                >
                  <Check className={item.status === "upgraded" ? "text-success" : ""} />
                </Button>
              </div>
              <Textarea
                defaultValue={item.note}
                onBlur={(event) => {
                  if (event.target.value !== item.note) patchItem.mutate({ itemId: item.id, note: event.target.value });
                }}
                rows={2}
                className="mt-2 text-xs"
                placeholder="Why this one first?"
                aria-label={`Note for ${item.name}`}
              />
              <div className="mt-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() => {
                    const ids = items.map((entry) => entry.id);
                    const swap = ids[index - 1];
                    const current = ids[index];
                    if (!swap || !current) return;
                    ids[index - 1] = current;
                    ids[index] = swap;
                    reorder.mutate(ids);
                  }}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  onClick={() => {
                    const ids = items.map((entry) => entry.id);
                    const swap = ids[index + 1];
                    const current = ids[index];
                    if (!swap || !current) return;
                    ids[index + 1] = current;
                    ids[index] = swap;
                    reorder.mutate(ids);
                  }}
                >
                  <ArrowDown />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : draft.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add outdated packages from the table. Notes stay on this machine until you save a plan.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {draft.map((item, index) => (
            <li key={item.name} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{index + 1}</p>
                  <p className="font-medium">{item.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.target}</p>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.name}`} onClick={() => removeFromDraft(item.name)}>
                  <X />
                </Button>
              </div>
              <Textarea
                value={item.note}
                onChange={(event) => setDraftNote(item.name, event.target.value)}
                rows={2}
                className="mt-2 text-xs"
                placeholder="Why this one first?"
                aria-label={`Note for ${item.name}`}
              />
              <div className="mt-2 flex gap-1">
                <Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Move up" onClick={() => moveDraftItem(index, index - 1)}>
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === draft.length - 1}
                  aria-label="Move down"
                  onClick={() => moveDraftItem(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft.length > 0 && !savedPlanId && (
        <div className="flex flex-col gap-2">
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? "Saving" : "Save and share"}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearDraft}>
            Clear plan
          </Button>
        </div>
      )}

      {(draft.length > 0 || savedPlanId) && (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={() => void copy(exported.install, "Install command copied")}>
            Copy npm install
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void copy(exported.markdown, "Markdown copied")}>
            Copy checklist
          </Button>
        </div>
      )}

      {savedPlanId && (
        <Button variant="secondary" size="sm" onClick={() => void copyLink()}>
          <Link2 />
          Copy share link
        </Button>
      )}

      {process.env.NODE_ENV !== "production" && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={faultSaves} onChange={(event) => setFaultSaves(event.target.checked)} />
          Force next save to fail
        </label>
      )}
    </aside>
  );
}
