#!/usr/bin/env python3
"""Screen 15: extract the UserManagementScreen hand-off byte-identically.

upload/15.md contains one ```tsx fenced block. The hand-off must ship
byte-for-byte, so this script slices exactly the bytes between the fences and
writes the same bytes to the two targets (web + expo package), then asserts
sha256 equality across both copies.
"""
import hashlib
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
HANDOFF = ROOT / "upload" / "15.md"
WEB = ROOT / "src" / "components" / "usermanagement" / "UserManagementScreen.tsx"
EXPO = ROOT / "download" / "security-scanner-expo" / "UserManagementScreen.tsx"

FENCE_OPEN = "```tsx"
FENCE_CLOSE = "```"

raw = HANDOFF.read_bytes()
text = raw.decode("utf-8")

open_idx = text.find(FENCE_OPEN)
assert open_idx != -1, "no ```tsx fence found"
# The bash fence ("```bash") must not be confused with the tsx one: the tsx
# fence is the first one whose opener is exactly "```tsx".
line_start = text.rfind("\n", 0, open_idx) + 1
assert text[line_start:open_idx].strip() == "", "```tsx not at line start"
body_start = open_idx + len(FENCE_OPEN)
# Skip the newline directly after the opener.
if text[body_start] == "\r":
    body_start += 1
if text[body_start] == "\n":
    body_start += 1

close_idx = text.find("\n" + FENCE_CLOSE, body_start)
assert close_idx != -1, "no closing fence found"

body = text[body_start:close_idx]
# Strip nothing else: keep the block's own trailing newline exactly as-is.

# Sanity assertions on the extracted hand-off.
assert body.startswith('import React, { useMemo, useState } from "react";'), body[:80]
assert "export default function UserManagementScreen()" in body
assert "const s = StyleSheet.create({" in body
assert 'from "@expo/vector-icons"' in body
assert body.rstrip().endswith("});"), body[-40:]
assert "TODO" not in body and "FIXME" not in body
assert "【" not in body and "XXX" not in body

WEB.parent.mkdir(parents=True, exist_ok=True)
EXPO.parent.mkdir(parents=True, exist_ok=True)
WEB.write_bytes(body.encode("utf-8"))
EXPO.write_bytes(body.encode("utf-8"))

sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
web_sha, expo_sha = sha(WEB), sha(EXPO)
assert web_sha == expo_sha, "byte drift between web and expo copies"
print(f"extracted bytes : {len(body.encode('utf-8'))}")
print(f"web  sha256     : {web_sha}")
print(f"expo sha256     : {expo_sha}")
print("byte-identical  : OK")
sys.exit(0)
