/*
 * Verdict engine (heuristic-v1) — the rules behind POST /api/scan/link and
 * POST /api/scan/file. Signals:
 *
 *   1. Signature match against the `Threat` table (SHA-256 for files,
 *      hostname for links — a hostname signature matches the host and all
 *      of its subdomains). A signature hit is always `malicious` and wins.
 *   2. Heuristics for everything else: shorteners, punycode homoglyphs,
 *      IP-literal hosts, credential-bearing URLs, risky TLDs and lure
 *      keywords for links; executable/double extensions and oversized
 *      payloads for files.
 *
 * Outcomes: `clean` | `suspicious` | `malicious`, each with human-readable
 * reasons that the result screens list verbatim.
 */

import { prisma } from "./prisma";

export type Verdict = "clean" | "suspicious" | "malicious";
export type Severity = "low" | "medium" | "high" | "critical";

export type LinkVerdict = {
  verdict: Verdict;
  severity: Severity | null;
  reasons: string[];
  /** Signature hit details, when the threat table matched. */
  threat: { name: string; severity: Severity } | null;
};

export type FileVerdict = LinkVerdict & {
  sha256: string;
  size: number;
};

/** Hostnames that hide the final destination behind a redirect. */
const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly",
  "rb.gy", "ow.ly", "buff.ly", "rebrand.ly", "s.id", "shorturl.at",
]);

/** Cheap-risk TLDs commonly abused in phishing kits. */
const RISKY_TLDS = new Set([".zip", ".mov", ".tk", ".top", ".xyz", ".gq", ".cf", ".ml", ".fake", ".click"]);

/** Lure keywords seen in credential-phishing hostnames. */
const LURE_WORDS = [
  "login", "verify", "secure-update", "account-alert", "unlock", "confirm-identity",
  "wallet-connect", "free-gift", "prize", "recovery-seed", "support-live",
];

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB upload cap

/** Executable/script extensions treated as inherently risky on mobile. */
const RISKY_EXTENSIONS = new Set([
  "exe", "msi", "bat", "cmd", "com", "scr", "pif", "vbs", "vbe", "js", "jse",
  "wsf", "wsh", "ps1", "apk", "jar", "hta", "cpl", "gadget",
]);

/** Fully-blocked extensions that have no legitimate consumer use-case. */
const BLOCKED_EXTENSIONS = new Set(["scr", "pif", "hta", "gadget", "jar"]);

function severityRank(severity: Severity): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[severity];
}

function worstSeverity(a: Severity, b: Severity): Severity {
  return severityRank(a) >= severityRank(b) ? a : b;
}

/** Hostname signature match: exact host or any subdomain of it. */
function hostMatchesSignature(hostname: string, signature: string): boolean {
  const host = hostname.toLowerCase();
  const sig = signature.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host === sig || host.endsWith(`.${sig}`);
}

// ---------------------------------------------------------------------------
// Link scanning
// ---------------------------------------------------------------------------

export async function scanUrl(rawUrl: string): Promise<LinkVerdict | { error: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { error: "That does not look like a URL." };
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    return { error: "Only http and https links can be checked." };
  }

  const reasons: string[] = [];
  const host = url.hostname.toLowerCase();

  // 1. Threat-table signature match (wins over everything).
  const urlThreats = await prisma.threat.findMany({ where: { kind: "url" } });
  const hit = urlThreats.find((t) => hostMatchesSignature(host, t.signature));
  if (hit) {
    return {
      verdict: "malicious",
      severity: hit.severity as Severity,
      reasons: [
        `${host} matches the "${hit.name}" signature in the threat intelligence table.`,
        ...(hit.description ? [hit.description] : []),
      ],
      threat: { name: hit.name, severity: hit.severity as Severity },
    };
  }

  // 2. Heuristics — each adds a reason; any hit makes the link suspicious.
  let suspicious = false;
  let severity: Severity = "low";

  const bump = (reason: string, sev: Severity = "medium") => {
    reasons.push(reason);
    suspicious = true;
    severity = worstSeverity(severity, sev);
  };

  if (SHORTENERS.has(host)) {
    bump(`${host} is a link shortener — the final destination is hidden until you open it.`);
  }
  if (host.startsWith("xn--") || url.pathname.includes("xn--")) {
    bump("The address uses punycode (xn--), which can disguise look-alike characters in the domain.", "high");
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
    bump("The link points at a raw IP address instead of a named domain.");
  }
  if (url.username || url.password) {
    bump("The URL embeds credentials (user:pass@) — a classic phishing disguise.", "high");
  }
  if (RISKY_TLDS.has(host.slice(host.lastIndexOf(".")))) {
    bump(`The ".${host.split(".").pop()}" domain ending is cheap to register and heavily abused.`);
  }
  if (LURE_WORDS.some((word) => host.includes(word))) {
    bump("The domain contains pressure keywords typical of phishing pages (verify, login, unlock…).");
  }
  if (url.protocol === "http:") {
    reasons.push("The link is not encrypted (http instead of https).");
  }

  if (!suspicious) {
    reasons.push("No signature or heuristic signals fired for this link.");
  }
  return { verdict: suspicious ? "suspicious" : "clean", severity: suspicious ? severity : null, reasons, threat: null };
}

// ---------------------------------------------------------------------------
// File scanning
// ---------------------------------------------------------------------------

export type FileNameSignals = {
  verdict: Verdict;
  severity: Severity | null;
  reasons: string[];
  threat: { name: string; severity: Severity } | null;
  sha256: string;
  size: number;
};

export async function scanFile(fileName: string, bytes: Uint8Array): Promise<FileNameSignals | { error: string }> {
  const size = bytes.byteLength;
  if (size === 0) return { error: "The file is empty." };
  if (size > MAX_FILE_BYTES) {
    return { error: "File is larger than the 10 MB upload limit." };
  }

  // SHA-256 via node:crypto (the bytes are already in memory).
  const { createHash } = await import("node:crypto");
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const base = fileName.toLowerCase();

  // 1. Signature match on the digest.
  const fileThreat = await prisma.threat.findFirst({ where: { kind: "file", signature: sha256 } });
  if (fileThreat) {
    return {
      verdict: "malicious",
      severity: fileThreat.severity as Severity,
      reasons: [
        `The file's SHA-256 digest matches the "${fileThreat.name}" signature in the threat intelligence table.`,
        ...(fileThreat.description ? [fileThreat.description] : []),
      ],
      threat: { name: fileThreat.name, severity: fileThreat.severity as Severity },
      sha256,
      size,
    };
  }

  // 2. Extension heuristics.
  const reasons: string[] = [];
  let suspicious = false;
  let severity: Severity = "low";
  const bump = (reason: string, sev: Severity = "medium") => {
    reasons.push(reason);
    suspicious = true;
    severity = worstSeverity(severity, sev);
  };

  const ext = base.slice(base.lastIndexOf(".") + 1);
  if (BLOCKED_EXTENSIONS.has(ext)) {
    bump(`".${ext}" files are a common malware carrier and are blocked outright.`, "high");
  } else if (RISKY_EXTENSIONS.has(ext)) {
    bump(`".${ext}" is an executable/script format that can run code on the device.`);
  }

  // Double-extension disguise (invoice.pdf.exe) — the real extension is last.
  const parts = base.split(".");
  if (parts.length > 2 && RISKY_EXTENSIONS.has(parts[parts.length - 1])) {
    bump("The name hides an executable extension behind a document extension.", "high");
  }

  if (!suspicious) {
    reasons.push("No signature match and no risky file-type signals.");
  }
  return { verdict: suspicious ? "suspicious" : "clean", severity: suspicious ? severity : null, reasons, threat: null, sha256, size };
}

export { MAX_FILE_BYTES };
