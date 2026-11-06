import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/users — the user-management table (screen 14). Admin-only: the
 * session cookie's role is checked before any account data leaves the
 * server, mirroring the role guard on the admin dashboard routes.
 */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    users: users.map(user => ({
      id: user.id,
      name: user.name ?? user.email.split("@")[0],
      email: user.email,
      role: user.role === "admin" ? "Admin" : "User",
      // The schema has no disable flag yet, so every seeded account is
      // Active; the column stays so the screen keeps its filter working.
      status: "Active",
      joined: user.createdAt,
      lastActive: user.updatedAt,
    })),
  });
}
