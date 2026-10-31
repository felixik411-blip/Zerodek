'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Renders the React Native welcome screen in the browser via react-native-web.
 *
 * - `ssr: false` avoids hydration mismatches from `useWindowDimensions()`
 *   (server has no real window width, so the responsive layout must be
 *   computed on the client).
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
const SecurityScannerWelcomeScreen = dynamic(
  () => import('./SecurityScannerWelcomeScreen'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#607493',
          fontSize: 14,
        }}
      >
        Loading screen…
      </div>
    ),
  }
);

export default function WelcomePreview() {
  const router = useRouter();

  // "Get started" now navigates to the real next screen (the dashboard).
  // Passed as an optional prop so the React Native component itself stays
  // portable — in the Expo app (no navigator wired yet) it keeps the honest
  // loading + confirmation states.
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
      <SafeAreaProvider style={{ flex: 1 }}>
        <SecurityScannerWelcomeScreen onGetStarted={handleGetStarted} />
      </SafeAreaProvider>
    </div>
  );
}
