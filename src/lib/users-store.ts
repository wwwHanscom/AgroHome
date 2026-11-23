import { readFile } from "node:fs/promises";
import { usersFile, UserRecord } from "./users";

function isUserRecord(value: unknown): value is UserRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    (record.personType === "usuario" || record.personType === "empresa") &&
    typeof record.name === "string" &&
    ["agricultora", "comprador", "inversionista"].includes(
      String(record.role),
    ) &&
    typeof record.email === "string" &&
    typeof record.phone === "string" &&
    typeof record.address === "string" &&
    typeof record.passwordHash === "string" &&
    typeof record.createdAt === "string"
  );
}

export async function readUserRecords(): Promise<UserRecord[]> {
  try {
    const contents = await readFile(usersFile, "utf8");
    const records: unknown = JSON.parse(contents);
    if (!Array.isArray(records) || !records.every(isUserRecord)) {
      throw new Error("El archivo de usuarios tiene un formato inválido.");
    }
    return records;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
