'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./AdminSignInScreen');

/**
 * Screen 13 exposes its integrations as props by design (the brief says
 * authentication and password recovery are injected callbacks, not routes),
 * so the preview simply wires those props — no DOM bridging needed.
 */
function AdminSignInPreviewInner() {
  const router = useRouter();

  const handleSignIn = React.useCallback(async () => {
    // Integration point only: no real authentication service exists in this
    // preview. A short artificial delay lets the loading / disabled state be
    // exercised, then the callback rejects and the screen shows its inline
    // error — it never reports a fake success.
    await new Promise((resolve) => setTimeout(resolve, 900));
    throw new Error('admin authentication is not connected in this preview.');
  }, []);

  const handleForgotPassword = React.useCallback(() => {
    // No password-recovery screen exists yet (the brief says not to invent
    // one), so the callback routes to the existing Help & About screen —
    // the app's support surface.
    router.push('/help-about/');
  }, [router]);

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <ScreenLoader
        load={loadScreen}
        screenProps={{
          onSignIn: handleSignIn,
          onForgotPassword: handleForgotPassword,
        }}
      />
    </div>
  );
}

/**
 * Renders the React Native admin sign-in screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native-safe-area-context in the screen.
 */
export default function AdminSignInPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#FFFFFF',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <AdminSignInPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
