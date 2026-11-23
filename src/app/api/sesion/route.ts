import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!user) {
      return NextResponse.json(
        { error: "Sesión no válida." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("No se pudo verificar la sesión.", error);
    return NextResponse.json(
      { error: "No se pudo verificar la sesión." },
      { status: 500 },
    );
  }
}
