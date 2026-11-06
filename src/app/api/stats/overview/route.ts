import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*
 * GET /api/stats/overview — one call that feeds the welcome screen's
 * security-overview cards and the dark security-operations band.
 *
 *   ?period=today|week|all   (filters the scan-count cards; ops band is a
 *                             rolling 10-day window regardless)
 *
 * Shapes match the screen's existing demo constants so the preview can
 * hydrate the same slots with live numbers and fall back to the demo
 * snapshot whenever this API is unreachable.
 */

const DAILY_QUOTA = 20;

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period");
  const since = new Date();
  if (period === "today") since.setHours(0, 0, 0, 0);
  else if (period === "week") since.setDate(since.getDate() - 7);
  else if (period === "all") since.setFullYear(2000);
  else since.setMonth(since.getMonth() - 1); // default window: month (free-plan quota cycle)

  const [scans, malicious, links, todayScans, alerts] = await Promise.all([
    prisma.scan.count({ where: { createdAt: { gte: since } } }),
    prisma.scan.count({ where: { createdAt: { gte: since }, verdict: "malicious" } }),
    prisma.scan.count({ where: { createdAt: { gte: since }, kind: "link" } }),
    prisma.scan.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.alert.findMany({ where: { createdAt: { gte: new Date(Date.now() - 10 * 86400_000) } } }),
  ]);

  // Threat-severity index: share of flagged scans, weighted 100% malicious /
  // 40% suspicious, scaled ×2.2 to mirror how ops teams weight exposure, and
  // floored at 12 so an empty window still shows a baseline.
  const [suspicious, windowTotal] = await Promise.all([
    prisma.scan.count({ where: { createdAt: { gte: since }, verdict: "suspicious" } }),
    prisma.scan.count({ where: { createdAt: { gte: since } } }),
  ]);
  const severityIndex =
    windowTotal === 0
      ? 12
      : Math.max(12, Math.min(100, Math.round(((malicious + suspicious * 0.4) / windowTotal) * 220)));

  // System health: 99 minus a penalty proportional to the flagged-scan share,
  // clamped to 58..99 (a clean window reads mid-90s, not a fake 100).
  const flagged = malicious + suspicious * 0.5;
  const health =
    windowTotal === 0
      ? 97
      : Math.max(58, Math.min(99, Math.round(99 - (28 * flagged) / windowTotal)));

  // 10-day sparkline buckets per alert kind.
  const days: number[] = Array.from({ length: 10 }, () => 0);
  const spark = (kind: string) => {
    const buckets = [...days];
    for (const alert of alerts) {
      if (alert.kind !== kind) continue;
      const dayIndex = Math.floor((Date.now() - alert.createdAt.getTime()) / 86400_000);
      if (dayIndex >= 0 && dayIndex < 10) buckets[9 - dayIndex] += 1;
    }
    return buckets;
  };
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "high").length;

  return NextResponse.json({
    period: period ?? "month",
    cards: {
      scansCompleted: scans,
      threatsBlocked: malicious,
      linksChecked: links,
      quota: { used: todayScans, total: DAILY_QUOTA },
    },
    ops: {
      severityIndex,
      health,
      alerts: {
        total: { value: alerts.length, spark: spark("system") },
        critical: { value: criticalAlerts, spark: spark("critical") },
        intrusion: { value: alerts.filter((a) => a.kind === "intrusion").length, spark: spark("intrusion") },
        malware: { value: alerts.filter((a) => a.kind === "malware").length, spark: spark("malware") },
      },
    },
    generatedAt: new Date().toISOString(),
  });
}
