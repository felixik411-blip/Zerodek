#!/usr/bin/env python3
"""Extract the fenced tsx code block from upload/16.md byte-identically
and write it to the expo package and the web components directory."""
import pathlib

SRC = pathlib.Path("/home/z/my-project/upload/16.md")
EXPO = pathlib.Path("/home/z/my-project/Zerodek/download/security-scanner-expo/ThreatInformationScreen.tsx")
WEB = pathlib.Path("/home/z/my-project/Zerodek/src/components/threatinformation/ThreatInformationScreen.tsx")

text = SRC.read_text(encoding="utf-8")
lines = text.split("\n")

# Locate the first ```tsx fence and the matching closing fence
start = next(i for i, l in enumerate(lines) if l.strip() == "```tsx")
end = next(i for i in range(start + 1, len(lines)) if lines[i].strip() == "```")
code = "\n".join(lines[start + 1 : end]) + "\n"

assert "export default function ThreatInformationScreen()" in code, "screen component missing"
assert "```" not in code, "fence leaked into extracted code"

EXPO.write_text(code, encoding="utf-8", newline="")
WEB.parent.mkdir(parents=True, exist_ok=True)
WEB.write_text(code, encoding="utf-8", newline="")

print(f"lines: {end - start - 1}, bytes: {len(code.encode('utf-8'))}")
print("starts:", code.splitlines()[0])
print("ends:  ", code.splitlines()[-1])
