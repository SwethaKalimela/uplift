import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PackageName, SemverString } from "@/shared/schemas/primitives";
import { migrateWorkspace, STORE_VERSION } from "./migrate";
import { selectDraftCount } from "./selectors";
import { useWorkspace } from "./workspace";

const name = (value: string) => value as PackageName;
const version = (value: string) => value as SemverString;

beforeEach(() => {
  useWorkspace.setState({ draft: [], project: null });
});

describe("draft actions", () => {
  it("adds each package once and keeps the order the user chose", () => {
    const { addToDraft, addManyToDraft, moveDraftItem } = useWorkspace.getState();
    addToDraft(name("react"), version("19.3.1"));
    addManyToDraft([
      { name: name("react"), target: version("19.3.1") },
      { name: name("zod"), target: version("4.6.7") },
      { name: name("next"), target: version("16.4.3") },
    ]);
    moveDraftItem(2, 0);

    expect(useWorkspace.getState().draft.map((item) => item.name)).toEqual(["next", "react", "zod"]);
  });

  it("ignores moves that are out of range", () => {
    const { addToDraft, moveDraftItem } = useWorkspace.getState();
    addToDraft(name("react"), version("19.3.1"));
    const before = useWorkspace.getState().draft;
    moveDraftItem(0, 5);
    expect(useWorkspace.getState().draft).toBe(before);
  });
});

describe("selector subscriptions", () => {
  it("does not notify a draft-count subscriber when only a note changes", () => {
    const { addToDraft, setDraftNote } = useWorkspace.getState();
    addToDraft(name("react"), version("19.3.1"));

    const listener = vi.fn();
    const unsubscribe = useWorkspace.subscribe(selectDraftCount, listener);

    setDraftNote(name("react"), "Check the new JSX transform");
    expect(listener).not.toHaveBeenCalled();

    addToDraft(name("zod"), version("4.6.7"));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe("migrateWorkspace", () => {
  it("upgrades the version 1 shape without losing the draft", () => {
    const migrated = migrateWorkspace(
      {
        project: null,
        filters: { search: "react" },
        sort: { key: "name", direction: "asc" },
        draft: [{ name: "react", target: "19.3.1" }],
        planTokens: { abc123xyz789: "secret" },
      },
      1,
    );

    expect(migrated.draft).toEqual([{ name: "react", target: "19.3.1", note: "" }]);
    expect(migrated.filters).toMatchObject({ search: "react", bump: "all" });
    expect(migrated.editTokens).toEqual({ abc123xyz789: "secret" });
    expect(migrated.savedPlanId).toBeNull();
  });

  it("passes the current version through and resets garbage", () => {
    const current = migrateWorkspace({ draft: [], filters: {}, sort: {}, project: null, editTokens: {} }, STORE_VERSION);
    expect(current.draft).toEqual([]);
    expect(migrateWorkspace("nonsense", 1).draft).toEqual([]);
  });
});
