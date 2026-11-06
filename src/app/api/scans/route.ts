import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/scans — scan history feed with optional filters:
 *   ?kind=file|link   ?verdict=clean|suspicious|malicious
 *   ?period=today|week|month|all   ?limit=50 (max 200)
 * Newest first. `reasons` arrives as a parsed string array.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const kind = params.get("kind");
  const verdict = params.get("verdict");
  const period = params.get("period") ?? "all";
  const limit = Math.min(Number(params.get("limit") ?? 50) || 50, 200);

  const since = new Date();
  if (period === "today") since.setHours(0, 0, 0, 0);
  else if (period === "week") since.setDate(since.getDate() - 7);
  else if (period === "month") since.setMonth(since.getMonth() - 1);

  const rows = await prisma.scan.findMany({
    where: {
      ...(kind === "file" || kind === "link" ? { kind } : {}),
      ...(verdict ? { verdict } : {}),
      ...(period === "all" ? {} : { createdAt: { gte: since } }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    scans: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      target: row.target,
      sha256: row.sha256,
      size: row.size,
      verdict: row.verdict,
      severity: row.severity,
      reasons: row.reasons ? (JSON.parse(row.reasons) as string[]) : [],
      checkedAt: row.createdAt.toISOString(),
    })),
  });
}
