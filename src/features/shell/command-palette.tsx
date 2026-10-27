"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { assess } from "@/shared/domain/bump";
import { packageHref } from "@/shared/lib/package-path";
import { queryKeys } from "@/shared/query/keys";
import type { PackageSummary } from "@/shared/schemas/registry";
import { useWorkspace } from "@/shared/store/workspace";

export function CommandPalette() {
  const open = useWorkspace((state) => state.commandOpen);
  const setOpen = useWorkspace((state) => state.setCommandOpen);
  const project = useWorkspace((state) => state.project);
  const addManyToDraft = useWorkspace((state) => state.addManyToDraft);
  const setInspectorOpen = useWorkspace((state) => state.setInspectorOpen);
  const clearProject = useWorkspace((state) => state.clearProject);
  const clearDraft = useWorkspace((state) => state.clearDraft);
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const packages = project?.dependencies ?? [];
  const majors = packages.flatMap((spec) => {
    const summary = queryClient.getQueryData<PackageSummary>(queryKeys.package(spec.name));
    if (!summary) return [];
    const assessment = assess(spec.range, summary.latest);
    return assessment.kind === "behind" && assessment.bump === "major" ? [{ name: spec.name, target: assessment.latest }] : [];
  });

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed top-[20vh] left-1/2 z-50 w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border bg-surface shadow-2xl"
    >
      <Command.Input
        placeholder="Search packages or run a command"
        className="h-12 w-full border-b bg-transparent px-4 text-sm outline-none"
      />
      <Command.List className="max-h-80 overflow-auto p-2">
        <Command.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">Nothing matches.</Command.Empty>
        <Command.Group heading="Commands" className="text-xs text-muted-foreground">
          <Command.Item
            className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-muted"
            onSelect={() => {
              addManyToDraft(majors);
              setOpen(false);
            }}
          >
            Add all majors to plan
          </Command.Item>
          <Command.Item
            className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-muted"
            onSelect={() => {
              setInspectorOpen(true);
              setOpen(false);
            }}
          >
            Open cache inspector
          </Command.Item>
          <Command.Item
            className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-muted"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            Toggle theme
          </Command.Item>
          <Command.Item
            className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-muted"
            onSelect={() => {
              clearDraft();
              clearProject();
              setOpen(false);
            }}
          >
            New project
          </Command.Item>
        </Command.Group>
        {packages.length > 0 && (
          <Command.Group heading="Packages" className="text-xs text-muted-foreground">
            {packages.map((spec) => (
              <Command.Item
                key={spec.name}
                value={spec.name}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-muted"
                onSelect={() => {
                  router.push(packageHref(spec.name));
                  setOpen(false);
                }}
              >
                {spec.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
