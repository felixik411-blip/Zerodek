/**
 * Native globals polyfill (client + server).
 *
 * React Native apps get `__DEV__` injected by Metro. Some RN libraries
 * (e.g. @expo/vector-icons) reference it at runtime, and react-native-web
 * does not define it. Import this module BEFORE any react-native library
 * import so the global exists when those modules evaluate.
 */
import MaterialCommunityIconsGlyphMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";

if (typeof globalThis.__DEV__ === "undefined") {
  (globalThis as { __DEV__?: boolean }).__DEV__ =
    process.env.NODE_ENV !== "production";
}

/**
 * Glyph alias for the file-selection screen.
 *
 * The hand-off uses the icon name `file-archive`, which does not exist in
 * the MaterialCommunityIcons glyphmap (7,448 names checked — closest real
 * glyph: `zip-box`). The glyphmap JSON is a shared module instance and
 * names resolve at render time, so aliasing it here maps the hand-off's
 * name to the intended archive glyph WITHOUT touching the byte-identical
 * screen code.
 */
const mciGlyphMap = MaterialCommunityIconsGlyphMap as Record<string, number>;
if (!mciGlyphMap["file-archive"]) {
  mciGlyphMap["file-archive"] = mciGlyphMap["zip-box"];
}

export {};
