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
  const fileName = params.get('file') ?? undefined;
  const fileType = params.get('type') ?? undefined;
  const fileSize = params.get('size') ?? undefined;

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
    // A scan-result screen hasn't been handed off yet; when it arrives, this
    // is where the flow continues.
  }, []);

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
