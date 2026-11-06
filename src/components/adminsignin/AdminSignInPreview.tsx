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
 * so the preview wires those props to the real backend:
 *
 * - `onSignIn` POSTs the credentials to /api/auth/login, which validates
 *   them against the seeded `User` table (scrypt digests) and sets a signed
 *   httpOnly session cookie. Success lands on the admin dashboard; the
 *   screen's own inline error state shows the API's message on failure.
 * - `onForgotPassword` routes to the existing Help & About screen — the
 *   app's support surface (no password-recovery screen exists by brief).
 */
function AdminSignInPreviewInner() {
  const router = useRouter();

  const handleSignIn = React.useCallback(
    async (credentials: { emailOrUsername: string; password: string }) => {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: credentials.emailOrUsername,
          password: credentials.password,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; user?: { role: string } }
        | null;

      if (!response.ok || !data?.user) {
        // Rejecting makes the screen show its own inline error — it never
        // reports a fake success.
        throw new Error(data?.error ?? 'Sign-in failed. Please try again.');
      }
      // Trailing slash on purpose — the preview proxy 301-redirects
      // extension-less paths and a redirect here would fall back to a full
      // page load.
      router.push('/admin-dashboard/');
    },
    [router],
  );

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
