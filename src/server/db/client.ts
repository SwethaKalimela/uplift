import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getPostgres() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url), { schema });
}

export function usingPostgres() {
  return Boolean(process.env.DATABASE_URL);
}
