import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { scanFile } from "@/lib/verdict";

/**
 * POST /api/scan/file — multipart upload (field name `file`), hashed with
 * SHA-256, matched against the threat table plus file-type heuristics.
 * Only the digest and metadata are stored — never the file bytes, which
 * keeps the "files stay on your phone" promise of the UI honest.
 */
export async function POST(request: Request) {
  // React Native's ambient types shadow the DOM `FormData` (they declare a
  // parts-array shape without .get), so the parsed body is viewed through a
  // minimal structural type instead of a nominal one.
  type FormDataLike = { get(name: string): FormDataEntryValue | null };
  const form = (await request.formData().catch(() => null)) as unknown as FormDataLike | null;
  if (!form) {
    return NextResponse.json(
      { error: "Send the file as multipart/form-data with a `file` field." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing `file` field." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await scanFile(file.name, bytes);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const session = await getSession();
  const scan = await prisma.scan.create({
    data: {
      userId: session?.uid ?? null,
      kind: "file",
      target: file.name,
      sha256: result.sha256,
      size: result.size,
      verdict: result.verdict,
      severity: result.severity,
      reasons: JSON.stringify(result.reasons),
    },
  });

  return NextResponse.json({
    id: scan.id,
    kind: "file" as const,
    target: file.name,
    size: result.size,
    sha256: result.sha256,
    verdict: result.verdict,
    severity: result.severity,
    reasons: result.reasons,
    threat: result.threat,
    checkedAt: scan.createdAt.toISOString(),
  });
}
