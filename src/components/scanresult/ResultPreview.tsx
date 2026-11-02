'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and patches `Alert.alert` so the
// hand-off's delete confirmation actually opens a browser dialog.
import '@/rn-web/native-globals';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerResultScreen');

function ResultPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Flow bridge: the scan-progress screen forwards the scanned file's
  // metadata via query params when it completes. Without params, the
  // hand-off's own defaults render.
  const fileName = params.get('file') ?? undefined;
  const fileType = params.get('type') ?? undefined;
  const fileSize = params.get('size') ?? undefined;
  const scanDate = params.get('scanDate') ?? undefined;
  const scanTime = params.get('scanTime') ?? undefined;

  const handleBackHome = React.useCallback(() => {
    // Trailing slash on purpose — see ScanProgressPreview for the redirect
    // loop rationale.
    router.push('/dashboard/');
  }, [router]);

  const handleViewQuarantine = React.useCallback(() => {
    // Deep-link into the dashboard hand-off's internal Quarantine view;
    // DashboardPreview performs the switch once the screen has rendered.
    router.push('/dashboard/?view=Quarantine');
  }, [router]);

  const handleDeletePermanently = React.useCallback(() => {
    // The hand-off already shows its own "File deleted" state; when real
    // file storage exists, the actual removal goes here.
  }, []);

  const handleScanAnother = React.useCallback(() => {
    router.push('/file-selection/');
  }, [router]);

  const screenProps = React.useMemo(
    () => ({
      fileName,
      fileType,
      fileSize,
      scanDate,
      scanTime,
      onBackHome: handleBackHome,
      onViewQuarantine: handleViewQuarantine,
      onDeletePermanently: handleDeletePermanently,
      onScanAnother: handleScanAnother,
    }),
    [
      fileName,
      fileType,
      fileSize,
      scanDate,
      scanTime,
      handleBackHome,
      handleViewQuarantine,
      handleDeletePermanently,
      handleScanAnother,
    ],
  );

  return <ScreenLoader load={loadScreen} screenProps={screenProps} />;
}

/**
 * Renders the React Native scan-result screen in the browser via
 * react-native-web.
 *
 * - `useSearchParams` needs a Suspense boundary during static prerender.
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
export default function ResultPreview() {
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
          <ResultPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
