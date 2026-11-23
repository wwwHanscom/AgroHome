import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { readUserRecords } from "@/lib/users-store";

const scrypt = promisify(scryptCallback);

export async function POST(request: Request) {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const data = value as Record<string, unknown>;

  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length === 0) {
    return NextResponse.json(
      { error: "Ingrese un correo y una contraseña válidos." },
      { status: 400 },
    );
  }

  try {
    const users = await readUserRecords();
    const user = users.find((record) => record.email === email);
    const [saltHex, hashHex] = user?.passwordHash.split(":") ?? [];
    if (
      !user ||
      !saltHex ||
      !hashHex ||
      !/^[a-f\d]+$/i.test(saltHex) ||
      !/^[a-f\d]{128}$/i.test(hashHex)
    ) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }

    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const actualHash = (await scrypt(password, salt, expectedHash.length)) as Buffer;
    if (!timingSafeEqual(actualHash, expectedHash)) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user.email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("No se pudo iniciar la sesión.", error);
    return NextResponse.json(
      { error: "No se pudo iniciar la sesión. Inténtelo de nuevo." },
      { status: 500 },
    );
  }
}
