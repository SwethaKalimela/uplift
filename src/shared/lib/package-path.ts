import type { Route } from "next";
import type { PackageName } from "@/shared/schemas/primitives";

export function encodePackagePath(name: PackageName) {
  return name.split("/").map(encodeURIComponent).join("/");
}

export function packageHref(name: PackageName) {
  return `/pkg/${encodePackagePath(name)}` as Route;
}

export function parsePackageSegments(segments: readonly string[]) {
  return segments.map(decodeURIComponent).join("/");
}
