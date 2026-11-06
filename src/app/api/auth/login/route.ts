import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword } from "@/lib/auth";
import { withSession } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required."),
});

/**
 * POST /api/auth/login — credential sign-in for the admin portal.
 * Returns a signed httpOnly session cookie plus the safe user fields.
 */
export async function POST(request: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  // Same generic message for unknown email and wrong password so the
  // endpoint never discloses which accounts exist.
  if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect email or password. Please try again." },
      { status: 401 },
    );
  }

  const token = createSessionToken(user);
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  return withSession(response, token);
}
