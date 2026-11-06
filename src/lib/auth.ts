import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/*
 * Lean cookie-session auth for the admin portal (screen 13).
 *
 * Deliberately dependency-free instead of pulling next-auth into the route
 * handlers: the screens are React Native components rendered through
 * react-native-web and only talk to the API over fetch, so all we need is
 * one signed httpOnly cookie. Passwords use Node's built-in `scrypt` (the
 * same primitive-class next-auth's default `credentials` flow recommends
 * when bcrypt isn't available), and sessions are HMAC-SHA256 signed tokens
 * of the shape `base64url(payload).base64url(signature)`.
 */

const SESSION_COOKIE = "zerodek_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  // Dev fallback keeps the local sandbox self-contained; production must set
  // AUTH_SECRET in .env (documented in the seed script header).
  return process.env.AUTH_SECRET || "zerodek-dev-secret-do-not-use-in-prod";
}

/** Hash a plaintext password for storage: `salt:hash`, both hex. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Constant-time password check against a stored `salt:hash` digest. */
export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

export type SessionPayload = {
  uid: string;
  email: string;
  name: string | null;
  role: string;
  /** Expiry, unix seconds. */
  exp: number;
};

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

/** Mint a signed session token for a user. */
export function createSessionToken(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
}): string {
  const payload: SessionPayload = {
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify a session token; returns null for tampered/expired tokens. */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  // Length differs → definitely wrong; equal length → constant-time compare.
  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.uid || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
