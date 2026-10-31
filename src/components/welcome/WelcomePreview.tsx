'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerWelcomeScreen');

/**
 * Renders the React Native welcome screen in the browser via
 * react-native-web.
 *
 * "Get started" navigates to the real next screen (the dashboard). It is
 * passed as the optional prop the hand-off exposes, so the React Native
 * component itself stays portable — in the Expo app (no navigator wired yet)
 * it keeps the honest loading + confirmation states.
 */
export default function WelcomePreview() {
  const router = useRouter();

  const handleGetStarted = React.useCallback(() => {
    // Trailing slash on purpose: the preview proxy 301-redirects /dashboard to
    // /dashboard/, and a redirect on the router's RSC payload fetch makes the
    // soft navigation fall back to a full page load. Pushing the exact URL
    // keeps the client-side transition seamless.
    router.push('/dashboard/');
  }, [router]);

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F8FAFD',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <ScreenLoader
          load={loadScreen}
          screenProps={{ onGetStarted: handleGetStarted }}
        />
      </SafeAreaProvider>
    </div>
  );
}
