import crypto from "crypto";

export function generateHashName(value1: string): string;
export function generateHashName(value1: string, value2: string): string;

export function generateHashName(value1: string, value2?: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(value2 ? value1 + value2 : value1);
  return hash.digest("hex");
}
