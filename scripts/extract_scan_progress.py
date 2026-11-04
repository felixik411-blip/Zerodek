#!/usr/bin/env python3
"""Extract the Screen 4 (Scan Progress) hand-off code block from upload/4.md
byte-for-byte into both build targets (web preview + Expo package), then
assert the three copies are identical via sha256.

The hand-off file is the single source of truth: this script never transforms
the code in any way (no reformat, no import rewrite, nothing).
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "upload" / "4.md"
TARGETS = [
    ROOT / "src" / "components" / "scanprogress" / "SecurityScannerScanProgressScreen.tsx",
    ROOT / "download" / "security-scanner-expo" / "SecurityScannerScanProgressScreen.tsx",
]

md = MD.read_bytes()
match = re.search(rb"```tsx\n(.*?)\n```", md, re.S)
if not match:
    sys.exit("FAIL: no ```tsx block found in 4.md")
block = match.group(1)

for target in TARGETS:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(block)

digest = hashlib.sha256(block).hexdigest()
for target in TARGETS:
    got = hashlib.sha256(target.read_bytes()).hexdigest()
    if got != digest:
        sys.exit(f"FAIL: {target} does not match the 4.md block")

print(f"OK: 2 targets written, sha256 {digest[:16]}… (full: {digest})")
print(f"bytes: {len(block)}")
