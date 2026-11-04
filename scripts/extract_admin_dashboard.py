#!/usr/bin/env python3
"""Extract screen 14 (AdminDashboardScreen) byte-identically from upload/14.md.

Slices the single ```tsx block after the `## \\`AdminDashboardScreen.tsx\\``
marker, sanity-asserts its shape, writes it byte-for-byte to the web preview
component and the Expo package, and asserts both copies hash identical.
"""
import hashlib
import pathlib

ROOT = pathlib.Path("/home/z/my-project")
SRC = ROOT / "upload" / "14.md"
COMPONENT = "AdminDashboardScreen"
TARGETS = [
    ROOT / "src" / "components" / "admindashboard" / "AdminDashboardScreen.tsx",
    ROOT / "download" / "security-scanner-expo" / "AdminDashboardScreen.tsx",
]

text = SRC.read_text(encoding="utf-8")

marker = f"## `{COMPONENT}.tsx`"
start = text.index(marker)
fence_open = text.index("```tsx\n", start)
code_start = fence_open + len("```tsx\n")
fence_close = text.index("\n```", code_start)
code = text[code_start:fence_close]

# Sanity assertions on the extracted hand-off code.
lines = code.splitlines()
assert lines[0] == "import React, { useState } from 'react';", lines[0]
assert f"export default function {COMPONENT}()" in code
assert "from '@expo/vector-icons';" in code
assert "from 'react-native-safe-area-context';" in code
assert "const ACTIVITY: Activity[]" in code
assert "activeNav" in code and "periodOpen" in code and "showDetails" in code
assert "MaterialCommunityIcons" in code and "Feather" in code
assert code.rstrip().endswith("});"), code[-20:]

for target in TARGETS:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(code.encode("utf-8"))

digests = [hashlib.sha256(t.read_bytes()).hexdigest() for t in TARGETS]
assert len(set(digests)) == 1, digests
print(digests[0], len(code.encode("utf-8")), "bytes ->", ", ".join(map(str, TARGETS)))
