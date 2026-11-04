/**
 * Bundler-level stand-in for the `react-native` module specifier (wired via
 * next.config.ts resolveAlias / webpack alias).
 *
 * It re-exports everything from react-native-web — so every screen and
 * library keeps exactly the behaviour it had when `react-native` aliased to
 * react-native-web directly — and additionally provides stub exports for
 * native-only APIs that some React Native libraries reference at import
 * time but never call in a browser.
 *
 * Why: react-native-svg's web build (`lib/module/lib/SvgTouchableMixin.js`)
 * lazily `require`s its fabric module (`../fabric/NativeSvgSoundModule`),
 * which does `TurboModuleRegistry.getEnforcing(...)` from 'react-native'.
 * react-native-web does not export `TurboModuleRegistry`, so under
 * Turbopack the mere presence of that import breaks the whole bundle. The
 * stub below is never invoked in the browser (the call site is guarded by
 * a native-only Platform check); it only needs to exist for the build.
 */
export * from 'react-native-web';

// Native-only TurboModule registry (react-native-svg fabric modules).
export const TurboModuleRegistry = {
  get: (_name: string): unknown => undefined,
  getEnforcing: (_name: string): unknown => ({}),
};
