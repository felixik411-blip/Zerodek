'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerDashboard');

function DashboardPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get('view');

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let destination: string | null = null;
      while (node && node !== root) {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
        // Innermost match wins: the button's own Text node fires before any
        // outer wrapper can.
        if (!destination) {
          if (text === 'Scan file') destination = '/file-selection/';
          // The "Check a link" card's Check button: hand off to the
          // dedicated website-link screen (screen 6) instead of the
          // in-card notice.
          else if (text === 'Check') destination = '/website-link/';
          // The real scan-history screen (screen 10) now exists, so the
          // sidebar History item and the activity card's "View all" go
          // there instead of the hand-off's internal History sub-screen.
          else if (text === 'History' || text === 'View all')
            destination = '/scan-history/';
        }
        node = node.parentElement;
      }
      if (destination) router.push(destination);
    },
    [router],
  );

  // Deep-link bridge for other screens' navigation actions (e.g. the
  // scan-result screen's "View quarantine", the quarantine-details screen's
  // History / Settings items). The dashboard hand-off is self-contained
  // (internal `activeNav` state, no props), so once it has rendered, this
  // clicks the first element whose text is exactly the requested view's
  // name — those labels live inside the hand-off's own `goTo(...)`
  // pressables, so the hand-off's own handler performs the switch. The
  // hand-off component itself is not modified. A short rAF retry absorbs
  // late first paint; the bridge runs at most once per loaded view.
  const [ready, setReady] = React.useState(false);
  const handleScreenReady = React.useCallback(() => setReady(true), []);

  const requestedView =
    view === 'Quarantine' || view === 'History' || view === 'Settings'
      ? view
      : null;

  React.useEffect(() => {
    if (!ready || !requestedView) return;
    let cancelled = false;
    let frames = 0;
    const tick = () => {
      if (cancelled) return;
      const target = Array.from(document.querySelectorAll('div')).find(
        el =>
          (el.innerText || '').replace(/\s+/g, ' ').trim() === requestedView,
      );
      if (target) {
        target.click();
        return;
      }
      if (++frames > 120) return; // ~2s cap, then simply stay on Home
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [ready, requestedView]);

  return (
    // The capture-phase bridge must sit ABOVE the rendered screen: without
    // this wrapper the listener is never attached and the hand-off's
    // "Scan file" / "Check" buttons do nothing on the web preview.
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      <ScreenLoader load={loadScreen} onScreenReady={handleScreenReady} />
    </div>
  );
}

/**
 * Renders the React Native dashboard screen in the browser via
 * react-native-web.
 *
 * The dashboard hand-off is intentionally self-contained (no navigation
 * props), so the flow is bridged at the glue level: a capture-phase DOM
 * listener detects clicks on the element whose text is exactly "Scan file"
 * and routes to the file-selection screen, the "Check a link" card's Check
 * button routes to the website-link screen (screen 6), and a `?view=` query
 * param (Quarantine / History / Settings) deep-links into the hand-off's
 * internal sub-screens. The hand-off component itself is not modified.
 *
 * `useSearchParams` needs a Suspense boundary during static prerender.
 */
export default function DashboardPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F7FAFE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <React.Suspense fallback={null}>
          <DashboardPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
