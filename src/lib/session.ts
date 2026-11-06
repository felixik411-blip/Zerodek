import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionToken, type SessionPayload } from "./auth";

/** Read + verify the session cookie in a route handler. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Attach a fresh session cookie (httpOnly, 7 days) to a JSON response. */
export function withSession<T>(response: NextResponse<T>, token: string): NextResponse<T> {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

/** Clear the session cookie on a JSON response. */
export function clearSession<T>(response: NextResponse<T>): NextResponse<T> {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
