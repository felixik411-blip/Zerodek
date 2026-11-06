import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/quarantine/:id — remove a quarantined item (the "Delete"
 * action on the quarantine details screen).
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.quarantineItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  await prisma.quarantineItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
