#!/usr/bin/env python3
"""Verify every Ionicons icon name used by screen 17 exists in the
@expo/vector-icons Ionicons glyphmap (used on both Expo and web)."""
import json, re, pathlib

glyphs = json.loads(pathlib.Path(
    "/home/z/my-project/node_modules/@expo/vector-icons/build/vendor/"
    "react-native-vector-icons/glyphmaps/Ionicons.json"
).read_text())

code = pathlib.Path(
    "/home/z/my-project/Zerodek/download/security-scanner-expo/HelpContentScreen.tsx"
).read_text()

# Ionicons names appear as string literals passed to `name=` props, both
# bare (icon: "grid-outline") and inside JSX (name="menu").
names = sorted(set(re.findall(r'"([a-z][a-z0-9-]*)"', code)))
skip_prefixes = ("use", "react", "en-", "false", "true")
iconish = [n for n in names if 3 <= len(n) <= 32 and not n.startswith(skip_prefixes)]

missing = [n for n in iconish if n not in glyphs]
print("candidate names:", len(iconish))
for n in iconish:
    print(f"  {'OK ' if n in glyphs else 'MISSING'} {n}")
print("MISSING:", missing if missing else "none")
