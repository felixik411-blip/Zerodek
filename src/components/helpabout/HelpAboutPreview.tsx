'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';
import type { HelpNavDestination } from './HelpAboutScreen';

const loadScreen = () => import('./HelpAboutScreen');

const ROUTES: Record<HelpNavDestination, string> = {
  home: '/dashboard/',
  history: '/scan-history/',
  quarantine: '/quarantine/',
  settings: '/settings/',
};

/**
 * Screen 12 accepts navigation as props by design (the brief says to use
 * the app's existing routes via callbacks), so the preview simply wires
 * `onNavigate` to the real routes — no DOM bridging needed.
 */
function HelpAboutPreviewInner() {
  const router = useRouter();

  const handleNavigate = React.useCallback(
    (destination: HelpNavDestination) => {
      router.push(ROUTES[destination]);
    },
    [router],
  );

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <ScreenLoader
        load={loadScreen}
        screenProps={{ onNavigate: handleNavigate }}
      />
    </div>
  );
}

/**
 * Renders the React Native help & about screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native-safe-area-context in the screen.
 */
export default function HelpAboutPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F5F9FE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <HelpAboutPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
