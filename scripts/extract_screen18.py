#!/usr/bin/env python3
"""Extract SystemHealthScreen.tsx byte-identical from upload/18.md.

Takes the ```tsx code fence under the `## \`SystemHealthScreen.tsx\`` heading
and writes it verbatim (no reformatting) to both the Expo package and the
web components directory, then verifies the two copies are identical.
"""
import difflib
import pathlib
import re
import sys

ROOT = pathlib.Path("/home/z/my-project")
MD = (ROOT / "upload" / "18.md").read_text(encoding="utf-8")

# Locate the heading, then the first tsx fence after it.
heading = MD.index("## `SystemHealthScreen.tsx`")
fence_start = MD.index("```tsx", heading)
code_start = MD.index("\n", fence_start) + 1
code_end = MD.index("\n```", code_start)
code = MD[code_start : code_end + 1]  # keep trailing newline before fence

if not code.endswith("\n"):
    code += "\n"

expected_first = 'import React, { useMemo, useState } from "react";'
if not code.lstrip().startswith(expected_first):
    sys.exit(f"unexpected first line: {code[:80]!r}")

targets = [
    ROOT / "download" / "security-scanner-expo" / "SystemHealthScreen.tsx",
    ROOT / "src" / "components" / "systemhealth" / "SystemHealthScreen.tsx",
]
for target in targets:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(code, encoding="utf-8")

a = targets[0].read_text(encoding="utf-8")
b = targets[1].read_text(encoding="utf-8")
if a != b:
    sys.exit("copies differ!")

# Re-verify byte-identity against the markdown source itself.
if a != code:
    diff = list(difflib.unified_diff(code.splitlines(), a.splitlines(), lineterm=""))
    sys.exit("file differs from md source:\n" + "\n".join(diff[:20]))

print(f"OK: {len(a.splitlines())} lines, byte-identical in both locations")
print(f"exports default: {bool(re.search(r'export default function SystemHealthScreen', a))}")
