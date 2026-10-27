"use client";

import { Plus, Check } from "lucide-react";
import type { Assessment } from "@/shared/domain/bump";
import { selectIsInDraft } from "@/shared/store/selectors";
import { useWorkspace } from "@/shared/store/workspace";
import type { PackageName } from "@/shared/schemas/primitives";
import { Button } from "@/shared/ui/button";

export function RowActions({ name, assessment }: { name: PackageName; assessment: Assessment | null }) {
  const inDraft = useWorkspace(selectIsInDraft(name));
  const addToDraft = useWorkspace((state) => state.addToDraft);
  const removeFromDraft = useWorkspace((state) => state.removeFromDraft);

  if (assessment?.kind !== "behind") return null;

  if (inDraft) {
    return (
      <Button variant="ghost" size="sm" onClick={() => removeFromDraft(name)}>
        <Check className="text-success" />
        In plan
      </Button>
    );
  }

  return (
      <Button variant="secondary" size="sm" onClick={() => addToDraft(name, assessment.latest)}>
      <Plus />
      Add
    </Button>
  );
}
