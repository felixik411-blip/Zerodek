'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and patches `Alert.alert` so the
// hand-off's "Copied" / "Caution" dialogs actually open in the browser.
import '@/rn-web/native-globals';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./LinkScanResultScreen');

function LinkResultPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Flow bridge: the website-link screen forwards the checked URL, the
  // check timestamp AND the real engine verdict (POST /api/scan/link runs
  // before navigation) via query params. Without params, the hand-off's own
  // danger-demo defaults render.
  const url = params.get('url') ?? undefined;
  const checkedAt = params.get('checkedAt') ?? undefined;
  const verdictParam = params.get('verdict');
  const VERDICTS = ['clean', 'suspicious', 'malicious'] as const;
  const verdict = VERDICTS.find((v) => v === verdictParam);
  const severity = params.get('severity') ?? undefined;
  const reasons = React.useMemo<string[] | undefined>(() => {
    const raw = params.get('reasons');
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === 'string') : undefined;
    } catch {
      return undefined;
    }
  }, [params]);

  const handleBackHome = React.useCallback(() => {
    // Trailing slash on purpose — see ScanProgressPreview for the redirect
    // loop rationale.
    router.push('/dashboard/');
  }, [router]);

  const handleCheckAnotherLink = React.useCallback(() => {
    // Back to the link-check input screen (screen 6) so a new URL can be
    // entered.
    router.push('/website-link/');
  }, [router]);

  const screenProps = React.useMemo(
    () => ({
      url,
      checkedAt,
      verdict,
      severity,
      reasons,
      onBackHome: handleBackHome,
      onCheckAnotherLink: handleCheckAnotherLink,
    }),
    [url, checkedAt, verdict, severity, reasons, handleBackHome, handleCheckAnotherLink],
  );

  return <ScreenLoader load={loadScreen} screenProps={screenProps} />;
}

/**
 * Renders the React Native link-scan-result screen in the browser via
 * react-native-web.
 *
 * - `useSearchParams` needs a Suspense boundary during static prerender.
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
export default function LinkResultPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F6FAFF',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <React.Suspense fallback={null}>
          <LinkResultPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
