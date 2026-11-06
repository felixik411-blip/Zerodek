import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { scanUrl } from "@/lib/verdict";

const bodySchema = z.object({
  url: z.string().trim().min(4).max(2048),
});

/**
 * POST /api/scan/link — run the URL through the signature table + heuristics,
 * persist a Scan row and return the verdict with its reasons. Works signed
 * or anonymous (userId attaches when a session cookie is present).
 */
export async function POST(request: Request) {
  let url: string;
  try {
    ({ url } = bodySchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ error: "Provide a URL to check." }, { status: 400 });
  }

  const result = await scanUrl(url);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const session = await getSession();
  const scan = await prisma.scan.create({
    data: {
      userId: session?.uid ?? null,
      kind: "link",
      target: url,
      verdict: result.verdict,
      severity: result.severity,
      reasons: JSON.stringify(result.reasons),
    },
  });

  return NextResponse.json({
    id: scan.id,
    kind: "link" as const,
    target: url,
    verdict: result.verdict,
    severity: result.severity,
    reasons: result.reasons,
    threat: result.threat,
    checkedAt: scan.createdAt.toISOString(),
  });
}
