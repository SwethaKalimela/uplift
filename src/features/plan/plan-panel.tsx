"use client";

import { X } from "lucide-react";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/input";

export function PlanPanel() {
  const draft = useWorkspace((state) => state.draft);
  const removeFromDraft = useWorkspace((state) => state.removeFromDraft);
  const setDraftNote = useWorkspace((state) => state.setDraftNote);
  const clearDraft = useWorkspace((state) => state.clearDraft);

  return (
    <aside className="flex w-full flex-col gap-3 rounded-xl border bg-surface p-4 lg:w-80 lg:shrink-0">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Upgrade plan</h2>
        <span className="text-xs text-muted-foreground">{draft.length}</span>
      </div>
      {draft.length === 0 ? (
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
            </li>
          ))}
        </ul>
      )}
      {draft.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearDraft}>
          Clear plan
        </Button>
      )}
    </aside>
  );
}
