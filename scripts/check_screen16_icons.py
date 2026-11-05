#!/usr/bin/env python3
"""Verify every Ionicons icon name used by screen 16 exists in the
@expo/vector-icons Ionicons glyphmap (used on both Expo and web)."""
import json, re, pathlib

glyphs = json.loads(pathlib.Path(
    "/home/z/my-project/node_modules/@expo/vector-icons/build/vendor/"
    "react-native-vector-icons/glyphmaps/Ionicons.json"
).read_text())

code = pathlib.Path(
    "/home/z/my-project/Zerodek/download/security-scanner-expo/ThreatInformationScreen.tsx"
).read_text()

names = sorted(set(re.findall(r'"([a-z][a-z0-9-]*)"(?=\s*(?:,|\)))', code)))
# keep only plausible icon names (lowercase, dashes; filter out obvious non-icons)
skip = {"use state", "react"}
iconish = [n for n in names if 3 <= len(n) <= 32]

missing = [n for n in iconish if n not in glyphs]
print("candidate names:", len(iconish))
for n in iconish:
    print(f"  {'OK ' if n in glyphs else 'MISSING'} {n}")
print("MISSING:", missing if missing else "none")
