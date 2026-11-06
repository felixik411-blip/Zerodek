import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * GET /api/auth/me — returns the signed-in principal, or 401 when the
 * session cookie is missing, tampered with or expired.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: session.uid, email: session.email, name: session.name, role: session.role },
  });
}
