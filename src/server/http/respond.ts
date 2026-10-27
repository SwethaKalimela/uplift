import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpstreamError } from "@/server/upstream/http";

export type CachePolicy = { maxAge: number; staleWhileRevalidate: number };

export function json<T>(data: T, policy?: CachePolicy) {
  return NextResponse.json(data, {
    headers: policy
      ? { "cache-control": `public, s-maxage=${policy.maxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}` }
      : { "cache-control": "no-store" },
  });
}

export function problem(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status, headers: { "cache-control": "no-store" } });
}

export function fromError(error: unknown) {
  if (error instanceof ZodError) return problem(400, "Invalid request", { issues: error.issues.map((issue) => issue.message) });
  if (error instanceof UpstreamError) {
    if (error.status === 429) return problem(429, `${error.source} rate limit reached. Try again shortly.`);
    return problem(502, `${error.source} is not responding right now.`);
  }
  if (error instanceof Error && error.name === "TimeoutError") return problem(504, "The upstream request timed out.");
  return problem(500, "Something went wrong.");
}
