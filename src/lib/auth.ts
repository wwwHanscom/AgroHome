import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { UserRecord } from "./users";
import { readUserRecords } from "./users-store";

export const SESSION_COOKIE = "agrohome-session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const sessionSecretFile = path.join(process.cwd(), ".data", "session-secret");

export type SessionUser = Pick<
  UserRecord,
  "name" | "role" | "email" | "phone" | "address"
>;

async function getSessionSecret() {
  try {
    return await readFile(sessionSecretFile);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  await mkdir(path.dirname(sessionSecretFile), { recursive: true, mode: 0o700 });
  const secret = randomBytes(32);
  try {
    await writeFile(sessionSecretFile, secret, { flag: "wx", mode: 0o600 });
    return secret;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return readFile(sessionSecretFile);
  }
}

function signPayload(payload: string, secret: Buffer) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSessionToken(email: string) {
  const secret = await getSessionSecret();
  const payload = Buffer.from(
    JSON.stringify({ email, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${signPayload(payload, secret)}`;
}

export async function getSessionUser(token?: string): Promise<SessionUser | null> {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const providedSignature = Buffer.from(token.slice(separator + 1), "base64url");
  const secret = await getSessionSecret();
  const expectedSignature = Buffer.from(signPayload(payload, secret), "base64url");
  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  let session: { email?: unknown; expiresAt?: unknown };
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof session.email !== "string" ||
    typeof session.expiresAt !== "number" ||
    session.expiresAt <= Date.now()
  ) {
    return null;
  }

  const users = await readUserRecords();
  const user = users.find((record) => record.email === session.email);
  if (!user) return null;
  const { name, role, email, phone, address } = user;
  return { name, role, email, phone, address };
}
