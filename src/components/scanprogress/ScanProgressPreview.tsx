'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerScanProgressScreen');

function ScanProgressPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Optional glue bridge: the file-selection screen forwards the chosen file
  // via query params. Without params, the hand-off's own defaults render.
  // It now also forwards the live verdict from POST /api/scan/file
  // (verdict / severity / threat / reasons / scanId), which this glue passes
  // on to the scan-result screen when the progress animation completes.
  const fileName = params.get('file') ?? undefined;
  const fileType = params.get('type') ?? undefined;
  const fileSize = params.get('size') ?? undefined;
  const verdict = params.get('verdict');
  const severity = params.get('severity');
  const threat = params.get('threat');
  const reasons = params.get('reasons');
  const scanId = params.get('scanId');

  const handleBackHome = React.useCallback(() => {
    // Trailing slash on purpose: the preview proxy 301-redirects /dashboard to
    // /dashboard/, and a redirect on the router's RSC payload fetch makes the
    // soft navigation fall back to a full page load. Pushing the exact URL
    // keeps the client-side transition seamless.
    router.push('/dashboard/');
  }, [router]);

  const handleCancel = React.useCallback(() => {
    // The hand-off screen flips its own UI to the cancelled state; the glue
    // layer has nothing to add yet.
  }, []);

  const handleScanComplete = React.useCallback(() => {
    // The scan reached 100%. Give the hand-off's own "Scan complete" state a
    // beat so it is actually visible, then continue the flow to the
    // scan-result screen (screen 5), carrying the scanned file's metadata,
    // the scan's date/time and the live verdict recorded by POST
    // /api/scan/file. Params are only sent when present so a direct visit to
    // /scan-progress/ keeps the hand-offs' own defaults on both screens.
    const query = new URLSearchParams();
    if (fileName) query.set('file', fileName);
    if (fileType) query.set('type', fileType);
    if (fileSize) query.set('size', fileSize);
    if (verdict) query.set('verdict', verdict);
    if (severity) query.set('severity', severity);
    if (threat) query.set('threat', threat);
    if (reasons) query.set('reasons', reasons);
    if (scanId) query.set('scanId', scanId);
    const now = new Date();
    query.set(
      'scanDate',
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    );
    query.set(
      'scanTime',
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    );
    window.setTimeout(
      () => router.push(`/scan-result/?${query.toString()}`),
      1200,
    );
  }, [fileName, fileType, fileSize, verdict, severity, threat, reasons, scanId, router]);

  const screenProps = React.useMemo(
    () => ({
      fileName,
      fileType,
      fileSize,
      onBackHome: handleBackHome,
      onCancel: handleCancel,
      onScanComplete: handleScanComplete,
    }),
    [fileName, fileType, fileSize, handleBackHome, handleCancel, handleScanComplete],
  );

  return <ScreenLoader load={loadScreen} screenProps={screenProps} />;
}

/**
 * Renders the React Native scan-progress screen in the browser via
 * react-native-web.
 *
 * - `useSearchParams` needs a Suspense boundary during static prerender.
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
export default function ScanProgressPreview() {
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
          <ScanProgressPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
