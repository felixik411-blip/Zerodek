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
 * Glyph aliases for the file-selection and scan-result screens.
 *
 * Two hand-off icon names do not exist in the MaterialCommunityIcons
 * glyphmap (7,448 names checked):
 * - `file-archive` (file-selection screen) — closest real glyph: `zip-box`
 * - `shield-minus` (scan-result quarantined banner) — the real minus-shield
 *   glyph is `shield-remove` (Material Design Icons names "minus" "remove")
 *
 * The glyphmap JSON is a shared module instance and names resolve at render
 * time, so aliasing them here maps the hand-offs' names to the intended
 * glyphs WITHOUT touching the byte-identical screen code.
 */
const mciGlyphMap = MaterialCommunityIconsGlyphMap as Record<string, number>;
if (!mciGlyphMap["file-archive"]) {
  mciGlyphMap["file-archive"] = mciGlyphMap["zip-box"];
}
if (!mciGlyphMap["shield-minus"]) {
  mciGlyphMap["shield-minus"] = mciGlyphMap["shield-remove"];
}

/**
 * Web bridge for `Alert.alert`.
 *
 * react-native-web ships `Alert` as a class whose `alert` static is a silent
 * no-op, so on the web the scan-result screen's "Delete permanently"
 * confirmation would click, do nothing, and feel dead. Bridge it to
 * `window.confirm`: the destructive (or first non-cancel) button's `onPress`
 * fires when the user accepts, mirroring the native dialog contract. The
 * patch lands here — before any screen module evaluates — so every
 * `import { Alert } from 'react-native'` sees the same patched class
 * static, and the byte-identical screen code stays untouched.
 */
import AlertModule from "react-native-web/dist/exports/Alert";

type AlertButton = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

const webAlert = AlertModule as unknown as {
  alert: (
    title?: string,
    message?: string,
    buttons?: AlertButton[],
  ) => void;
};

webAlert.alert = (title, message, buttons) => {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    return;
  }
  const accepted = window.confirm(
    [title, message].filter(Boolean).join("\n\n"),
  );
  if (!accepted) return;
  const handler =
    buttons?.find(button => button.style === "destructive") ??
    buttons?.find(button => button.style !== "cancel");
  handler?.onPress?.();
};

export {};
