"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("./command-palette").then((mod) => mod.CommandPalette), { ssr: false });
const CacheInspector = dynamic(() => import("@/features/inspector/cache-inspector").then((mod) => mod.CacheInspector), { ssr: false });

export function Chrome() {
  return (
    <>
      <CommandPalette />
      <CacheInspector />
    </>
  );
}
