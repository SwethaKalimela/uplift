import type { z } from "zod";
import { ApiError, isAbort } from "./errors";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal | undefined;
};

async function readError(response: Response) {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "error" in data && typeof data.error === "string") return data.error;
  } catch {
    return response.statusText || "Request failed";
  }
  return response.statusText || "Request failed";
}

export async function apiFetch<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<z.infer<Schema>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError(0, "Network unavailable. Check your connection.");
  }

  if (!response.ok) throw new ApiError(response.status, await readError(response));

  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new ApiError(500, `Unexpected response from ${path}`);
  return parsed.data;
}
