import "server-only";

export class UpstreamError extends Error {
  constructor(
    readonly source: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

const USER_AGENT = "uplift-dependency-planner";

export async function fetchUpstream(url: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(15_000),
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/json",
      ...init.headers,
    },
  });
}

export async function readJson(source: string, response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new UpstreamError(source, response.status, `${source} responded with ${response.status}`);
  }
  return response.json();
}
