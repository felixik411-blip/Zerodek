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
 * Route map for the security-overview dashboard band's onNavigate targets.
 * Trailing slashes on purpose: the preview proxy 301-redirects extension-less
 * paths, and a redirect on the router's RSC payload fetch makes the soft
 * navigation fall back to a full page load. Pushing the exact URL keeps the
 * client-side transition seamless.
 */
const ROUTES: Record<string, string> = {
  'scan-history': '/scan-history/',
  'threat-information': '/threat-information/',
  'website-link': '/website-link/',
  'file-selection': '/file-selection/',
  quarantine: '/quarantine/',
  settings: '/settings/',
  'real-time-protection': '/real-time-protection/',
  'privacy-audit': '/privacy-audit/',
  dashboard: '/dashboard/',
  'system-health': '/system-health/',
  'admin-dashboard': '/admin-dashboard/',
};

/**
 * Renders the React Native welcome screen in the browser via
 * react-native-web.
 *
 * "Get started" navigates to the real next screen (the dashboard), and the
 * security-overview band's stat cards / quick actions / protection rows
 * navigate through the optional onNavigate prop — so the React Native
 * component itself stays portable: in the Expo app (no navigator wired yet)
 * both fall back to the honest loading / confirmation / inline-notice states.
 */
export default function WelcomePreview() {
  const router = useRouter();

  const handleGetStarted = React.useCallback(() => {
    router.push('/dashboard/');
  }, [router]);

  const handleNavigate = React.useCallback(
    (target: string) => {
      const route = ROUTES[target];
      if (route) {
        router.push(route);
      }
    },
    [router],
  );

  // Live-data source for the security-overview band: GET /api/stats/overview
  // returns the DB-backed figures (scan counts, quota, gauges, alert tiles).
  // Returning null on failure lets the screen fall back to its demo snapshot.
  const fetchOverview = React.useCallback(
    async (period: 'today' | 'week' | 'all') => {
      const response = await fetch(`/api/stats/overview/?period=${period}`, {
        credentials: 'same-origin',
      });
      if (!response.ok) return null;
      return (await response.json()) as import('./SecurityScannerWelcomeScreen').LiveOverview;
    },
    [],
  );

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
          screenProps={{
            onGetStarted: handleGetStarted,
            onNavigate: handleNavigate,
            fetchOverview,
          }}
        />
      </SafeAreaProvider>
    </div>
  );
}
