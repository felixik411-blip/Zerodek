import type { Metrics } from 'react-native-safe-area-context';

// `SafeAreaProvider` renders `insets != null ? children : null`: without
// initial metrics it drops ALL of its children on the server (insets are only
// measured client-side), leaving the SSR shell an empty div. A preview page
// whose JS chunks fail to load then shows a completely blank screen — the
// dead-looking "buttons not clickable" state. Feeding web-safe zero metrics
// lets the provider render its children during SSR; on the client the
// measured values (also zeros in a browser) replace them, so there is no
// hydration mismatch either.
export const webInitialMetrics: Metrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};
