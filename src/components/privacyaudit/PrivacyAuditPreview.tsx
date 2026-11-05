'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./PrivacyAuditScreen');

/*
 * The privacy-audit screen (20) was authored to the app's design system
 * (screen-18 shell, lucide icons) and is fully interactive on its own:
 * "Re-run full audit" animates a progress bar and then lifts the privacy
 * score, every device-permission switch grants/revokes a group live
 * (score and Granted/Revoked states follow), each app-access row's
 * "Revoke" button removes the row and raises the score, the
 * recommendation buttons revoke the matching app (or dismiss), and the
 * sidebar items highlight on tap — those interactions stay inside the
 * screen and are NOT bridged.
 *
 * The click-capture bridge only handles cross-screen navigation:
 * - Sidebar items route to the real admin screens by suffix match (same
 *   shape as screens 14–18's bridges), told apart from same-text page
 *   content by the sidebar's dark background colour (#101E30).
 * - The top-bar menu button (accessibility label "Open menu") routes to
 *   the admin dashboard screen (14), the same integration point as
 *   screens 14–18. The bell and admin-account buttons keep the screen's
 *   own inline notices (no notifications or account screen exists).
 */

/** Sidebar dark from the screen palette (`styles.sidebar`, #101E30). */
const SIDEBAR_DARK = 'rgb(16, 30, 48)';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function PrivacyAuditPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[aria-label="Open menu"]')) {
        event.preventDefault();
        event.stopPropagation();
        router.push('/admin-dashboard/');
        return;
      }

      let walker: HTMLElement | null = target;
      let insideSidebar = false;
      while (walker && walker !== root) {
        if (getComputedStyle(walker).backgroundColor === SIDEBAR_DARK) {
          insideSidebar = true;
          break;
        }
        walker = walker.parentElement;
      }

      if (!insideSidebar) return;

      let node = target;
      let destination: string | null = null;
      while (node && node !== root && !destination) {
        const text = normalize(node.innerText);
        if (text.length < 60) {
          if (text.endsWith('Dashboard')) destination = '/dashboard/';
          else if (text.endsWith('Scans')) destination = '/scan-history/';
          else if (text.endsWith('Quarantine')) destination = '/quarantine/';
          else if (text.endsWith('Users')) destination = '/user-management/';
          else if (text.endsWith('Settings')) destination = '/settings/';
          else if (text.endsWith('Threat Intelligence')) destination = '/threat-information/';
          else if (text.endsWith('Help Content')) destination = '/help-content/';
          else if (text.endsWith('System Health')) destination = '/system-health/';
          else if (text.endsWith('Audit Logs')) destination = '/system-health/';
          else if (text.endsWith('Real-Time Protection')) destination = '/real-time-protection/';
          else if (text.endsWith('Privacy Audit')) destination = null;
          // "Privacy Audit" is the current screen — no bridge.
        }
        node = node.parentElement;
      }

      if (destination) {
        event.preventDefault();
        event.stopPropagation();
        router.push(destination);
      }
    },
    [router],
  );

  return (
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native privacy-audit screen in the browser via
 * react-native-web. The page background matches `styles.safeArea`
 * (#F4F8FF); `SafeAreaProvider` backs the screen's `SafeAreaView`.
 */
export default function PrivacyAuditPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F4F8FF',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <PrivacyAuditPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
