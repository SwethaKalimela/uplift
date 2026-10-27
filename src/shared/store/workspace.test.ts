import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PackageName, SemverString } from "@/shared/schemas/primitives";
import { migrateWorkspace, STORE_VERSION } from "./migrate";
import { selectDraftCount } from "./selectors";
import { useWorkspace } from "./workspace";

const name = (value: string) => value as PackageName;
const version = (value: string) => value as SemverString;

beforeEach(() => {
  useWorkspace.setState({
    draft: [],
    project: null,
    planOpen: false,
    planAutoOpen: false,
    autoOpenSeq: 0,
    countPulse: 0,
  });
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

  it("opens the plan drawer for the first three additions and pulses after that", () => {
    const { addToDraft, addManyToDraft, setPlanOpen } = useWorkspace.getState();
    addToDraft(name("react"), version("19.3.1"));
    expect(useWorkspace.getState().planOpen).toBe(true);
    expect(useWorkspace.getState().planAutoOpen).toBe(true);

    addToDraft(name("zod"), version("4.6.7"));
    addToDraft(name("next"), version("16.4.3"));
    expect(useWorkspace.getState().draft).toHaveLength(3);
    expect(useWorkspace.getState().planOpen).toBe(true);

    setPlanOpen(false);
    expect(useWorkspace.getState().countPulse).toBe(0);
    addToDraft(name("zustand"), version("5.0.16"));
    expect(useWorkspace.getState().planOpen).toBe(false);
    expect(useWorkspace.getState().countPulse).toBe(1);

    addManyToDraft([{ name: name("sonner"), target: version("2.0.8") }]);
    expect(useWorkspace.getState().planOpen).toBe(false);
  });

  it("does not auto-open when more than three packages are added at once", () => {
    const { addManyToDraft } = useWorkspace.getState();
    addManyToDraft([
      { name: name("react"), target: version("19.3.1") },
      { name: name("zod"), target: version("4.6.7") },
      { name: name("next"), target: version("16.4.3") },
      { name: name("zustand"), target: version("5.0.16") },
    ]);
    expect(useWorkspace.getState().planOpen).toBe(false);
    expect(useWorkspace.getState().countPulse).toBe(1);
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
    expect(migrated.editTokens).toEqual({ abc123xyz789: "secret" });
    expect(migrated.savedPlanId).toBeNull();
  });

  it("passes the current version through and resets garbage", () => {
    const current = migrateWorkspace({ draft: [], filters: {}, sort: {}, project: null, editTokens: {} }, STORE_VERSION);
    expect(current.draft).toEqual([]);
    expect(migrateWorkspace("nonsense", 1).draft).toEqual([]);
  });
});

describe("clearProject", () => {
  it("resets filters so a new scan does not keep the previous query", () => {
    useWorkspace.setState({ filters: { search: "react", bump: "major", group: "all", riskyOnly: true } });
    useWorkspace.getState().clearProject();
    expect(useWorkspace.getState().filters).toEqual({ search: "", bump: "all", group: "all", riskyOnly: false });
  });
});
