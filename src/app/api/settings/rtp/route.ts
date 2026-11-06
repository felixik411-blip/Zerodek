import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const KEY = "realtime_protection_enabled";

/**
 * GET /api/settings/rtp — current real-time protection state (screen 12).
 * Backed by the Setting key-value table so the toggle survives reloads.
 */
export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  // Default ON — protection only exists to be on until the user says stop.
  return NextResponse.json({ enabled: row ? row.value === "true" : true });
}

const putSchema = z.object({ enabled: z.boolean() });

/**
 * PUT /api/settings/rtp — persist the real-time protection master toggle
 * ("Resume now" / the protection switch / pause actions on screen 12).
 */
export async function PUT(request: NextRequest) {
  let body: z.infer<typeof putSchema>;
  try {
    body = putSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Expected { enabled: boolean }." }, { status: 400 });
  }
  await prisma.setting.upsert({
    where: { key: KEY },
    update: { value: body.enabled ? "true" : "false" },
    create: { key: KEY, value: body.enabled ? "true" : "false" },
  });
  return NextResponse.json({ enabled: body.enabled });
}
