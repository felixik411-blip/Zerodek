/*
 * Zerodek seed — demo dataset behind the scanner screens.
 *
 *   node scripts/seed.mjs
 *
 * Creates:
 *   • admin@zerodek.app / Passw0rd!23  (role "admin", scrypt-hashed)
 *   • threat signatures — EICAR's real SHA-256 for files + known-bad hosts
 *   • ~2 weeks of scan records, alerts and quarantine items so every
 *     dashboard number is live data, not a hardcoded constant
 *
 * Idempotent: re-running clears and rebuilds the demo rows (users are
 * upserted so existing sessions stay valid). AUTH_SECRET is only needed at
 * runtime, not here — dev falls back to an inline dev secret.
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

const daysAgo = (n, hourOffset = 0) =>
  new Date(Date.now() - n * 86400_000 + hourOffset * 3600_000);

async function main() {
  // --- Users ---------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@zerodek.app" },
    update: { role: "admin" },
    create: {
      email: "admin@zerodek.app",
      name: "Security Admin",
      role: "admin",
      passwordHash: hashPassword("Passw0rd!23"),
    },
  });
  await prisma.user.upsert({
    where: { email: "demo@zerodek.app" },
    update: {},
    create: {
      email: "demo@zerodek.app",
      name: "Demo User",
      role: "user",
      passwordHash: hashPassword("Demo1234!"),
    },
  });

  // --- Threat signatures -----------------------------------------------------
  const threats = [
    // EICAR test file — the industry-standard benign "malware" sample.
    { signature: "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f", kind: "file", name: "EICAR-Test-File", severity: "high", description: "The EICAR antivirus test payload — harmless by design, but proves the signature pipeline end to end." },
    { signature: "e1112134b6dcc8bed54e0e34d8ac272795e73d74" + "110c9a9f7dcb7fa1a4c8a123", kind: "file", name: "Trojan.Script.Agent", severity: "critical", description: "Obfuscated script dropper family." },
    { signature: "d41d8cd98f00b204e9800998ecf8427e0000000000000000000000000000abc1", kind: "file", name: "Worm.AutoRun", severity: "high", description: "Removable-media spreading worm." },
    { signature: "malicious-site.fake", kind: "url", name: "Phishing-Kit/malicious-site", severity: "high", description: "Credential-harvesting kit hosted on a look-alike domain." },
    { signature: "zerodek-test-malware.example", kind: "url", name: "Malware-Dropper/test-host", severity: "critical", description: "Direct malware download host used in test corpora." },
    { signature: "wallet-connect-verify.com", kind: "url", name: "CryptoDrainer/wallet-connect", severity: "critical", description: "Wallet-drainer front end." },
  ];
  for (const t of threats) {
    await prisma.threat.upsert({ where: { signature: t.signature }, update: t, create: t });
  }

  // --- Scans (2 weeks of history) -------------------------------------------
  const scans = [
    ["file", "report-q3-final.pdf", 2411724, "clean", null, ["No signature match and no risky file-type signals."], 0],
    ["file", "setup-installer.exe", 8_412_160, "suspicious", "medium", ['".exe" is an executable/script format that can run code on the device.'], 0],
    ["link", "https://example.com/release-notes", null, "clean", null, ["No signature or heuristic signals fired for this link."], 0],
    ["link", "https://malicious-site.fake/login", null, "malicious", "high", ['malicious-site.fake matches the "Phishing-Kit/malicious-site" signature in the threat intelligence table.', "Credential-harvesting kit hosted on a look-alike domain."], 0],
    ["file", "promo-codes.docx", 88_412, "clean", null, ["No signature match and no risky file-type signals."], 1],
    ["link", "https://bit.ly/abc123", null, "suspicious", "medium", ["bit.ly is a link shortener — the final destination is hidden until you open it."], 1],
    ["file", "photo-backup.zip", 44_702_816, "clean", null, ["No signature match and no risky file-type signals."], 2],
    ["link", "https://wallet-connect-verify.com/unlock", null, "malicious", "critical", ['wallet-connect-verify.com matches the "CryptoDrainer/wallet-connect" signature in the threat intelligence table.', "Wallet-drainer front end."], 2],
    ["file", "invoice-scan.pdf.exe", 1_204_224, "suspicious", "high", ['".exe" is an executable/script format that can run code on the device.', "The name hides an executable extension behind a document extension."], 3],
    ["link", "https://zerodek-test-malware.example/payload", null, "malicious", "critical", ['zerodek-test-malware.example matches the "Malware-Dropper/test-host" signature in the threat intelligence table.', "Direct malware download host used in test corpora."], 3],
    ["link", "https://trusted-shop.example/checkout", null, "clean", null, ["No signature or heuristic signals fired for this link."], 4],
    ["file", "quarter-report.xlsx", 3_115_008, "clean", null, ["No signature match and no risky file-type signals."], 5],
    ["link", "http://192.168.13.37/admin", null, "suspicious", "medium", ["The link points at a raw IP address instead of a named domain.", "The link is not encrypted (http instead of https)."], 5],
    ["file", "resume-2025.docx", 1_048_576, "clean", null, ["No signature match and no risky file-type signals."], 7],
    ["link", "https://secure-login-verify.example.net/session", null, "suspicious", "medium", ["The domain contains pressure keywords typical of phishing pages (verify, login, unlock…)."], 8],
    ["file", "notes-backup.txt", 4_096, "clean", null, ["No signature match and no risky file-type signals."], 9],
    ["link", "https://example.org/docs/getting-started", null, "clean", null, ["No signature or heuristic signals fired for this link."], 10],
    ["file", "presentation-deck.pptx", 7_864_320, "clean", null, ["No signature match and no risky file-type signals."], 12],
  ];
  await prisma.scan.deleteMany({});
  for (const [kind, target, size, verdict, severity, reasons, ago] of scans) {
    await prisma.scan.create({
      data: {
        userId: ago % 3 === 0 ? admin.id : null,
        kind,
        target,
        sha256: kind === "file" ? Buffer.from(target).toString("hex").padEnd(64, "0").slice(0, 64) : null,
        size,
        verdict,
        severity,
        reasons: JSON.stringify(reasons),
        createdAt: daysAgo(ago, -2),
      },
    });
  }

  // --- Alerts (10-day window feeding the ops band) ---------------------------
  await prisma.alert.deleteMany({});
  const alertPlan = [
    ["malware", "high", 9], ["malware", "critical", 8], ["malware", "medium", 8],
    ["intrusion", "medium", 8], ["intrusion", "high", 7], ["malware", "high", 7],
    ["intrusion", "medium", 6], ["critical", "critical", 6], ["system", "low", 6],
    ["intrusion", "medium", 5], ["malware", "critical", 5], ["system", "low", 5],
    ["intrusion", "high", 4], ["malware", "medium", 4], ["critical", "high", 4],
    ["system", "low", 3], ["intrusion", "medium", 3], ["malware", "high", 3],
    ["critical", "critical", 2], ["intrusion", "medium", 2], ["system", "low", 2],
    ["malware", "medium", 1], ["intrusion", "high", 1], ["critical", "high", 1],
    ["system", "low", 1], ["malware", "low", 0], ["intrusion", "medium", 0],
    ["critical", "high", 0], ["system", "low", 0],
  ];
  for (const [kind, severity, ago] of alertPlan) {
    await prisma.alert.create({
      data: {
        kind,
        severity,
        message:
          kind === "malware" ? "Signature engine flagged a sample during scan."
          : kind === "intrusion" ? "Repeated blocked probes against the device endpoint."
          : kind === "critical" ? "Escalated case opened by the duty analyst."
          : "Routine engine heartbeat and feed sync.",
        status: ago === 0 ? "open" : "resolved",
        createdAt: daysAgo(ago, -1 - (ago % 5)),
      },
    });
  }

  // --- Quarantine ------------------------------------------------------------
  await prisma.quarantineItem.deleteMany({});
  await prisma.quarantineItem.createMany({
    data: [
      { name: "Project_Proposal.pdf", kind: "file", reason: "Signature match: Trojan.Script.Agent embedded layer.", status: "Threat found", sizeLabel: "2.4 MB", createdAt: daysAgo(1) },
      { name: "photo_vacation.jpg", kind: "file", reason: "Unusual script payload appended to image metadata.", status: "Suspicious", sizeLabel: "3.6 MB", createdAt: daysAgo(2) },
    ],
  });

  // --- Permission audit --------------------------------------------------------
  await prisma.permissionAudit.deleteMany({});
  await prisma.permissionAudit.createMany({
    data: [
      { app: "com.free.torch", permission: "READ_CONTACTS", risk: "high", advice: "A torch app has no business reading contacts — revoke." },
      { app: "com.chat.messaging", permission: "RECORD_AUDIO", risk: "medium", advice: "Needed for voice notes; review privacy policy." },
      { app: "com.bank.mobile", permission: "USE_BIOMETRIC", risk: "low", advice: "Expected for the app's purpose." },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    threats: await prisma.threat.count(),
    scans: await prisma.scan.count(),
    alerts: await prisma.alert.count(),
    quarantine: await prisma.quarantineItem.count(),
    permissionAudit: await prisma.permissionAudit.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
