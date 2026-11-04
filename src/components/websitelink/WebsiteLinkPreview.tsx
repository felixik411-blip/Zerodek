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
  // The link-check result screen (screen 7) now exists, so the glue layer
  // forwards the checked URL plus the live check timestamp to it. The
  // verdict shown there comes from the result hand-off itself.
  const handleCheckLink = React.useCallback(
    (url: string) => {
      const now = new Date();
      // Mirrors the hand-off's own "Oct 30, 2025  •  10:24 AM" format.
      const checkedAt = `${now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}  •  ${now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
      const query = new URLSearchParams({ url, checkedAt }).toString();
      // Trailing slash on purpose — see ScanProgressPreview for the
      // redirect loop rationale.
      router.push(`/link-scan-result/?${query}`);
    },
    [router],
  );

  return (
    <ScreenLoader
      load={loadScreen}
      screenProps={{ onBackHome: handleBackHome, onCheckLink: handleCheckLink }}
    />
  );
}

/**
 * Renders the React Native website-link screen in the browser via
 * react-native-web.
 *
 * The dashboard's "Check a link" card routes here, and this screen's
 * callbacks are wired at the glue level: `onBackHome` returns to the
 * dashboard and `onCheckLink` forwards the checked URL and timestamp to
 * the link-scan-result screen. The hand-off component itself is not
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
