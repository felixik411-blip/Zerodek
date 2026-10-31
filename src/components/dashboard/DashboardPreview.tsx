'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerDashboard');

/**
 * Renders the React Native dashboard screen in the browser via
 * react-native-web.
 *
 * The dashboard hand-off is intentionally self-contained (no navigation
 * props), so the flow is bridged at the glue level: a capture-phase DOM
 * listener detects clicks on the element whose text is exactly "Scan file"
 * and routes to the file-selection screen. The hand-off component itself is
 * not modified.
 */
export default function DashboardPreview() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let hit = false;
      while (node && node !== root) {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
        if (text === 'Scan file') hit = true;
        node = node.parentElement;
      }
      if (hit) router.push('/file-selection/');
    },
    [router],
  );

  return (
    <div
      onClickCapture={handleBridgeClick}
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F7FAFE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <ScreenLoader load={loadScreen} />
      </SafeAreaProvider>
    </div>
  );
}
