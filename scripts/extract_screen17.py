#!/usr/bin/env python3
"""Extract the fenced tsx code block from upload/17.md byte-identically
and write it to the expo package and the web components directory
(mirroring the screen-16 hand-off flow)."""
import pathlib
import shutil

ROOT = pathlib.Path("/home/z/my-project")
SRC = ROOT / "upload/17.md"

targets = [
    ROOT / "Zerodek/download/security-scanner-expo/HelpContentScreen.tsx",
    ROOT / "Zerodek/src/components/helpcontent/HelpContentScreen.tsx",
]

text = SRC.read_text(encoding="utf-8")
lines = text.split("\n")

# Locate the first ```tsx fence and the matching closing fence
start = next(i for i, l in enumerate(lines) if l.strip() == "```tsx")
end = next(i for i in range(start + 1, len(lines)) if lines[i].strip() == "```")
code = "\n".join(lines[start + 1 : end]) + "\n"

assert "export default function HelpContentScreen()" in code, "screen component missing"
assert "```" not in code, "fence leaked into extracted code"

for target in targets:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(code, encoding="utf-8", newline="")

# Mirror into the parent tree (dev server runs from the project root).
mirrors = [
    ROOT / "download/security-scanner-expo/HelpContentScreen.tsx",
    ROOT / "src/components/helpcontent/HelpContentScreen.tsx",
]
for src, dst in zip(targets, mirrors):
    shutil.copyfile(src, dst)

print(f"lines: {end - start - 1}, bytes: {len(code.encode('utf-8'))}")
print("starts:", code.splitlines()[0])
print("ends:  ", code.splitlines()[-1])
for t in targets + mirrors:
    print("wrote:", t)
