#!/usr/bin/env python3
"""Extract the ScanHistoryScreen.tsx code block from upload/10.md
byte-identically and place it into the web app and the Expo package."""
import hashlib
import os

SRC = "/home/z/my-project/upload/10.md"
TARGETS = [
    "/home/z/my-project/src/components/scanhistory/ScanHistoryScreen.tsx",
    "/home/z/my-project/download/security-scanner-expo/ScanHistoryScreen.tsx",
]

with open(SRC, "r", encoding="utf-8") as f:
    md = f.read()

marker = "## File: `ScanHistoryScreen.tsx`"
start = md.index(marker)
fence_open = md.index("```tsx\n", start)
code_start = fence_open + len("```tsx\n")
fence_close = md.index("\n```", code_start)
code = md[code_start:fence_close]

# Sanity checks on the extracted code
assert code.startswith("import React, { useMemo, useState } from 'react';"), "unexpected start"
assert "export default function ScanHistoryScreen()" in code, "missing export"
assert "INITIAL_RECORDS" in code, "missing sample data"
assert code.rstrip().endswith("});"), "unexpected end"

for target in TARGETS:
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "w", encoding="utf-8", newline="") as f:
        f.write(code)

def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

print(f"extracted chars: {len(code)}")
print(f"md block sha256  : {hashlib.sha256(code.encode('utf-8')).hexdigest()}")
for t in TARGETS:
    print(f"{t}\n  sha256: {sha(t)}")

# Byte-identity proof: re-read files and compare to the md slice
ok = all(open(t, "rb").read() == code.encode("utf-8") for t in TARGETS)
print(f"BYTE-IDENTICAL: {ok}")
assert ok
