/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PackageNameSchema, SemverStringSchema } from "@/shared/schemas/primitives";
import { selectDraftCount, selectDraftNote } from "./selectors";
import { useWorkspace } from "./workspace";

const reactName = PackageNameSchema.parse("react");

function DraftCount({ onRender }: { onRender: () => void }) {
  const count = useWorkspace(selectDraftCount);
  onRender();
  return <span>packages in plan: {count}</span>;
}

function NoteField() {
  const note = useWorkspace(selectDraftNote(reactName));
  const setDraftNote = useWorkspace((state) => state.setDraftNote);
  return <textarea aria-label="Note for react" value={note} onChange={(event) => setDraftNote(reactName, event.target.value)} />;
}

describe("workspace selectors in the UI", () => {
  beforeEach(() => {
    useWorkspace.setState({ draft: [], project: null, savedPlanId: null });
    useWorkspace.getState().addToDraft(reactName, SemverStringSchema.parse("19.3.1"));
  });

  afterEach(() => {
    cleanup();
  });

  it("does not re-render the plan count while a note is typed", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(
      <>
        <DraftCount onRender={onRender} />
        <NoteField />
      </>,
    );

    onRender.mockClear();
    await user.type(screen.getByLabelText("Note for react"), "check peer deps");
    expect(onRender).not.toHaveBeenCalled();
    expect(screen.getByText("packages in plan: 1")).toBeInTheDocument();
  });
});
