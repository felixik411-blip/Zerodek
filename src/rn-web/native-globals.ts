/**
 * Native globals polyfill (client + server).
 *
 * React Native apps get `__DEV__` injected by Metro. Some RN libraries
 * (e.g. @expo/vector-icons) reference it at runtime, and react-native-web
 * does not define it. Import this module BEFORE any react-native library
 * import so the global exists when those modules evaluate.
 */
if (typeof globalThis.__DEV__ === "undefined") {
  (globalThis as { __DEV__?: boolean }).__DEV__ =
    process.env.NODE_ENV !== "production";
}

export {};
