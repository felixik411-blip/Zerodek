'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./WebsiteLinkScreen');

const FONT =
  'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

function WebsiteLinkPreviewInner() {
  const router = useRouter();

  const handleBackHome = React.useCallback(() => {
    // Trailing slash on purpose — see ScanProgressPreview for the redirect
    // loop rationale.
    router.push('/dashboard/');
  }, [router]);

  // The hand-off only reports a syntactically valid URL through this
  // callback ("connect it to your real URL reputation/scanning service").
  // No link-check result screen has been handed off yet, so instead of a
  // dead button the glue layer shows an honest, auto-dismissing notice —
  // same plain-language pattern the dashboard uses for not-yet-connected
  // actions. Nothing is faked as a real scan result.
  const [toastUrl, setToastUrl] = React.useState<string | null>(null);
  const toastTimer = React.useRef<number | null>(null);

  const handleCheckLink = React.useCallback((url: string) => {
    setToastUrl(url);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastUrl(null), 5000);
  }, []);

  React.useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  return (
    <>
      <ScreenLoader load={loadScreen} screenProps={{ onBackHome: handleBackHome, onCheckLink: handleCheckLink }} />
      {toastUrl && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 16,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 560,
              backgroundColor: '#192D47',
              color: '#F0F5FC',
              fontSize: 13,
              lineHeight: '20px',
              padding: '12px 18px',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(23, 43, 73, 0.28)',
              fontFamily: FONT,
              textAlign: 'center',
            }}
          >
            Link check requested for <strong>{toastUrl}</strong> — the
            link-check result screen isn&rsquo;t connected in this preview
            yet, so there is no result to show.
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Renders the React Native website-link screen in the browser via
 * react-native-web.
 *
 * The dashboard's "Check a link" card routes here, and this screen's
 * callbacks are wired at the glue level: `onBackHome` returns to the
 * dashboard and `onCheckLink` shows an honest notice until a real
 * link-check result screen exists. The hand-off component itself is not
 * modified.
 */
export default function WebsiteLinkPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F7FAFE',
        fontFamily: FONT,
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <React.Suspense fallback={null}>
          <WebsiteLinkPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
