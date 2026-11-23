import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { NextResponse } from "next/server";
import { usersFile, UserRecord } from "@/lib/users";

const scrypt = promisify(scryptCallback);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;

  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { personType, name, role, email, phone, address, password } = data;
  if (
    (personType !== "usuario" && personType !== "empresa") ||
    !isNonEmptyString(name) ||
    !["agricultora", "comprador", "inversionista"].includes(String(role)) ||
    !isNonEmptyString(email) ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    !isNonEmptyString(phone) ||
    !/^\d+$/.test(phone) ||
    !isNonEmptyString(address) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: "Revise los datos ingresados e inténtelo de nuevo." },
      { status: 400 },
    );
  }

  try {
    const records = await readFile(usersFile, "utf8")
      .then((contents) => JSON.parse(contents) as UserRecord[])
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") return [];
        throw error;
      });

    const normalizedEmail = email.trim().toLowerCase();
    if (records.some((record) => record.email === normalizedEmail)) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo electrónico." },
        { status: 409 },
      );
    }

    const salt = randomBytes(16);
    const passwordHash = (await scrypt(password, salt, 64)) as Buffer;
    const record: UserRecord = {
      personType,
      name: name.trim(),
      role: role as UserRecord["role"],
      email: normalizedEmail,
      phone,
      address: address.trim(),
      passwordHash: `${salt.toString("hex")}:${passwordHash.toString("hex")}`,
      createdAt: new Date().toISOString(),
    };

    const formspreeResponse = await fetch("https://formspree.io/f/xyewbljg", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personType: record.personType,
        name: record.name,
        role: record.role,
        email: record.email,
        phone: record.phone,
        address: record.address,
        createdAt: record.createdAt,
      }),
    });

    if (!formspreeResponse.ok) {
      throw new Error(`Formspree rechazó el registro (${formspreeResponse.status}).`);
    }

    await mkdir(path.dirname(usersFile), { recursive: true, mode: 0o700 });
    const temporaryFile = `${usersFile}.${randomBytes(8).toString("hex")}.tmp`;
    await writeFile(temporaryFile, JSON.stringify([...records, record], null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryFile, usersFile);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("No se pudo guardar el registro.", error);
    return NextResponse.json(
      { error: "No se pudo guardar el registro. Inténtelo de nuevo." },
      { status: 500 },
    );
  }
}
