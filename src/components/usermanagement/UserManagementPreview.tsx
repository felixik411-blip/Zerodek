'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./UserManagementScreen');

/*
 * The user-management hand-off (upload/15.md) is fully self-contained: it
 * owns its state, works locally (search, status filter, disable/re-enable
 * with a confirmation dialog) and gives every control inline feedback via
 * its notice strip, per its own integration notes ("Register
 * UserManagementScreen in your app's navigation and point the Users
 * navigation item to it"). To connect it to the real app without touching
 * the byte-identical screen code, the preview wraps the screen in a
 * click-capture bridge:
 *
 * - Sidebar items route to the real screens (Dashboard, Scans, Quarantine,
 *   Settings, Help & Support) by suffix match — the Ionicons glyph prefixes
 *   each item's innerText. "Users" is this screen itself, so it keeps the
 *   hand-off's honest inline notice. Sidebar clicks are told apart from
 *   same-text page content (e.g. the "User Management" page title, user
 *   rows) by checking for the sidebar's navy background colour (#0D1D31)
 *   among the click target's ancestors.
 * - The menu / bell / admin-account buttons, the audit "View all logs" link
 *   and the Export CSV/JSON items keep the hand-off's inline notices — the
 *   app has no routes or export service behind them yet (the hand-off's
 *   integration notes leave export explicitly as a connect-later point).
 */

/** Sidebar navy from the hand-off palette (`#0D1D31`). */
const SIDEBAR_NAVY = 'rgb(13, 29, 49)';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function UserManagementPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      const target = event.target as HTMLElement | null;

      // Sidebar clicks: does any ancestor up to the root use the navy bg?
      let walker: HTMLElement | null = target;
      let insideSidebar = false;
      while (walker && walker !== root) {
        if (getComputedStyle(walker).backgroundColor === SIDEBAR_NAVY) {
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
        // The Ionicons glyph prefixes the nav item's innerText (e.g.
        // `" Dashboard`), so match by suffix. The length guard keeps the
        // walk-up from matching these suffixes against the whole nav list
        // or the sidebar footer. "Users" deliberately stays unbridged —
        // it is this screen.
        if (text.length < 60) {
          if (text.endsWith('Dashboard')) destination = '/dashboard/';
          else if (text.endsWith('Scans')) destination = '/scan-history/';
          else if (text.endsWith('Quarantine')) destination = '/quarantine/';
          else if (text.endsWith('Settings')) destination = '/settings/';
          else if (text.endsWith('Help & Support')) destination = '/help-about/';
        }
        node = node.parentElement;
      }

      if (destination) router.push(destination);
    },
    [router],
  );

  return (
    <div onClickCapture={handleBridgeClick} style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* Glue (the hand-off file stays byte-identical): the hand-off gives
          the tables' inner View `width: compact ? undefined : "100%"`, but
          react-native-web's horizontal ScrollView content container
          shrink-wraps its content, so "100%" resolves against the hug width
          instead of the card — at desktop the tables stop at ~968px inside a
          ~1200px card and every flex column is squeezed into wrapped lines.
          Stretching the content container to the card's real width (desktop
          only; below 900px — the hand-off's own `compact` breakpoint — the
          tables intentionally stay at their 930/900px minimum and scroll
          sideways). Both cards are matched via their direct ScrollView
          child; the toolbar and the dropdowns have no ScrollView and are
          untouched. */}
      <style>{`
        @media (min-width: 900px) {
          .r-borderRadius-1dedoh8:has(> .r-WebkitOverflowScrolling-150rngu)
            > .r-WebkitOverflowScrolling-150rngu > div {
            width: 100%;
          }
        }
        /* Glue (the hand-off file stays byte-identical): react-native-web
           gives every relatively-positioned view a default "z-index: 0", so
           each row and cell is its own stacking context. The hand-off's row
           dropdown (z-index 30, .r-zIndex-tmojj0) is therefore trapped inside
           its own row's context, and later rows paint right over it. Neutralising
           the z-index of every ancestor between the table card and an open
           dropdown lets the dropdown's z-index 30 win against the following
           rows. The selector only matches while a row menu is open, and the
           toolbar dropdowns (different zIndex classes) are unaffected. */
        .r-overflow-bztko3 div:has(.r-zIndex-tmojj0) {
          z-index: auto !important;
        }
      `}</style>
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native user-management screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is kept for consistency with the other previews; the
 * hand-off uses the core `SafeAreaView`, which is inert on web.
 */
export default function UserManagementPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F3F8FF',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <UserManagementPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
