'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
// Glue (the hand-off file stays byte-identical): the hand-off names the
// Feather icon `shield-check` for the Service-Health metric, but the
// Feather glyphmap only ships `shield`/`shield-off`. The glyphmap JSON is a
// shared module instance and names resolve at render time, so aliasing the
// name to the intended shield glyph fixes the rendering without touching
// the hand-off code. (The Expo package applies the same alias in its
// glyphPatches.ts.)
import FeatherGlyphMapRaw from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json';
const FeatherGlyphMap = FeatherGlyphMapRaw as Record<string, number>;
if (!FeatherGlyphMap['shield-check']) {
  FeatherGlyphMap['shield-check'] = FeatherGlyphMap['shield'];
}
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./AdminDashboardScreen');

/*
 * The admin-dashboard hand-off (upload/14.md) is fully self-contained: it
 * owns its state and gives every control inline feedback via its notice
 * strip, per its own scope notes ("Navigation items and activity rows show
 * basic feedback. Connect them to your existing routes."). To connect it to
 * the real app without touching the byte-identical screen code, the preview
 * wraps the screen in a click-capture bridge:
 *
 * - Sidebar items route to the real screens (Dashboard, Scans, Quarantine,
 *   Users, Settings, Help & Support) by suffix match — the Feather icon
 *   glyph prefixes each item's innerText. "Users" routes to the
 *   user-management screen (upload/15.md, served at /user-management/).
 *   Sidebar clicks are told apart from same-text page content (e.g. the
 *   "Dashboard" page title) by checking for the sidebar's navy background
 *   colour (#10243B) among the click target's ancestors.
 * - Activity rows route to the scan history screen, matched either by the
 *   exact item name or by a row-level node whose text starts with the
 *   "Mon DD, YYYY" date and contains an item name (covers clicks on the row
 *   padding, icons and pills). Alert rows mention one URL inside a longer
 *   sentence and never start with a date, so they don't collide.
 * - The "View all" link in Recent Activity routes to the scan history too,
 *   matched by its panel header's unique subtitle text with a length guard
 *   so the Alerts panel's "View all" (no alerts screen exists) is untouched.
 * - The bell / menu / admin-account buttons and the Alerts "View all" keep
 *   the hand-off's inline notices — the app has no routes for them yet.
 */

/** Sidebar navy from the hand-off palette (`C.navy`, #10243B). */
const SIDEBAR_NAVY = 'rgb(16, 36, 59)';

/** Item names of the hand-off's ACTIVITY sample rows. */
const ACTIVITY_ITEMS = [
  'Project_Proposal.pdf',
  'Screenshot_20251030.png',
  'https://malicious-site.fake',
  'https://example.com',
  'photo_20251028.jpg',
  'https://bit.ly/abc123',
  'Notes_backup.docx',
];

/** Unique subtitle of the Recent Activity panel header. */
const ACTIVITY_PANEL_MARKER = 'Latest scans and system events';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function AdminDashboardPreviewInner() {
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

      let node = target;
      let destination: string | null = null;
      while (node && node !== root && !destination) {
        const text = normalize(node.innerText);
        if (insideSidebar) {
          // The Feather icon glyph prefixes the nav item's innerText (e.g.
          // `" Quarantine`), so match by suffix. The length guard keeps the
          // walk-up from matching these suffixes against the whole nav list.
          // "Users" routes to the user-management screen (/user-management/,
          // hand-off upload/15.md) that this sidebar was pointing at.
          if (text.length < 60) {
            if (text.endsWith('Dashboard')) destination = '/dashboard/';
            else if (text.endsWith('Scans')) destination = '/scan-history/';
            else if (text.endsWith('Quarantine')) destination = '/quarantine/';
            else if (text.endsWith('Users')) destination = '/user-management/';
            else if (text.endsWith('Settings')) destination = '/settings/';
            else if (text.endsWith('Help & Support')) destination = '/help-about/';
          }
        } else if (ACTIVITY_ITEMS.includes(text)) {
          destination = '/scan-history/';
        } else if (
          /^Oct \d{1,2}, \d{4} /.test(text) &&
          text.length < 150 &&
          ACTIVITY_ITEMS.some((name) => text.includes(name))
        ) {
          // Row-level click (padding, icon, pill, chevron): the row text
          // starts with the date and contains the item name.
          destination = '/scan-history/';
        } else if (
          text.length < 250 &&
          text.includes(ACTIVITY_PANEL_MARKER)
        ) {
          // "View all" in Recent Activity (its panel header is unique).
          destination = '/scan-history/';
        }
        node = node.parentElement;
      }

      if (destination) router.push(destination);
    },
    [router],
  );

  return (
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      {/* Glue (the hand-off file stays byte-identical): the hand-off's
          activity rows can't shrink below their content (numberOfLines={1}
          texts + fixed column minimums), so on a 390px viewport the panel
          widens past the screen and the Result column is silently clipped.
          Let the rows shrink (min-width 0) and the activity panel scroll
          sideways instead — `.r-flex-1kmbk02` is the atomic class for the
          panel's unique `flex: 1.45` style. The desktop layout (≥1100px, the
          hand-off's own breakpoint) is untouched. */}
      <style>{`
        @media (max-width: 1099.98px) {
          .r-flex-1kmbk02 {
            width: 100%;
            overflow-x: auto;
          }
          .r-flex-1kmbk02 > div {
            min-width: 0;
          }
        }
      `}</style>
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native admin dashboard screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native-safe-area-context in the screen.
 */
export default function AdminDashboardPreview() {
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
        <AdminDashboardPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
