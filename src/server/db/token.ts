import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { customAlphabet } from "nanoid";

const idAlphabet = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);
const itemAlphabet = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 16);

export function newPlanId() {
  return idAlphabet();
}

export function newItemId() {
  return itemAlphabet();
}

export function newEditToken() {
  return randomBytes(18).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(token: string, hash: string) {
  const hashed = hashToken(token);
  if (hashed.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(hashed), Buffer.from(hash));
}
