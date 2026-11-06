import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** GET /api/quarantine — quarantined items, newest first. */
export async function GET() {
  const items = await prisma.quarantineItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(255),
  kind: z.enum(["file", "link"]).default("file"),
  reason: z.string().trim().min(1).max(500),
  status: z.enum(["Threat found", "Suspicious"]).default("Threat found"),
  sizeLabel: z.string().trim().max(32).optional(),
});

/** POST /api/quarantine — hold an item out of reach (verdict-driven). */
export async function POST(request: Request) {
  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid quarantine payload." }, { status: 400 });
  }
  const item = await prisma.quarantineItem.create({ data: body });
  return NextResponse.json({ item }, { status: 201 });
}
