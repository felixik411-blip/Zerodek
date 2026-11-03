'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and bridges `Alert.alert` to a
// browser dialog (no-op for this screen — the hand-off raises no alerts —
// but imported for parity with every other screen preview).
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SystemHealthScreen');

/*
 * The system-health hand-off (upload/18.md) is fully self-contained and
 * interactive by design, per its own notes ("Search filters the visible
 * audit rows. The event and result filter controls toggle between a
 * default filter and one sample filter. Pagination buttons update the
 * selected page visually"): the search box filters the audit rows live
 * across time/event/actor/details, the event and result selects toggle to
 * sample filters with a "No audit logs match your filters." empty state,
 * the pagination buttons move the selected page (1…9, prev/next), and the
 * sidebar items highlight on tap — those interactions stay inside the
 * screen and are NOT bridged.
 *
 * To connect the screen to the rest of the app without touching the
 * byte-identical screen code, the preview wraps it in a click-capture
 * bridge:
 *
 * - The sidebar is the hand-off's own navigation surface. Its items route
 *   to the real admin screens (Dashboard, Scans, Quarantine, Users,
 *   Settings, Threat Intelligence, Help Content) by suffix match on each
 *   item's innerText. "System Health" is this screen itself (the hand-off
 *   marks it active), and "Audit Logs" is this screen's own table (there
 *   is no dedicated audit-logs screen), so both are deliberately not
 *   bridged and keep the hand-off's highlight-only behaviour. Sidebar
 *   clicks are told apart from same-text page content by checking for the
 *   sidebar's dark background colour (#101E30) among the click target's
 *   ancestors. Unlike screen 17 this hand-off raises no placeholder
 *   alerts, so there is nothing to suppress — the bridge only stops the
 *   click from also mutating the hand-off's local `active` state right
 *   before the route change unmounts the screen.
 * - The top-bar menu button is the same integration point as screens
 *   14–17, so it routes to the admin dashboard screen (14). The button
 *   renders a lucide `List` SVG (no text glyph), so the bridge matches
 *   the button's own "Open menu" accessibility label instead of
 *   innerText or a glyph code point.
 * - The bell ("Notifications") and the Admin account button keep the
 *   hand-off's behaviour: both are silent no-ops there and there is no
 *   notifications or account screen to route to (same policy as screens
 *   14–17). The "Last 30 days" selector, "View all errors" and "View
 *   details" links are sample-data placeholders per the hand-off's own
 *   notes and likewise stay unbridged.
 */

/** Sidebar dark from the hand-off palette (`styles.sidebar`, #101E30). */
const SIDEBAR_DARK = 'rgb(16, 30, 48)';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function SystemHealthPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Top-bar menu button: matched by its accessibility label (the
      // lucide icon is an SVG with no text content to match on). The
      // hand-off gives the button no onPress, so there is no stale
      // placeholder to suppress — only route.
      if (target.closest('[aria-label="Open menu"]')) {
        event.preventDefault();
        event.stopPropagation();
        router.push('/admin-dashboard/');
        return;
      }

      // Sidebar clicks: does any ancestor up to the root use the dark bg?
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
        // Match by suffix — harmless here (labels are plain text), but it
        // keeps the shape of the screens 15–17 bridges and the length
        // guard keeps the walk-up from matching against the whole nav
        // list or the "System Healthy" footer card.
        if (text.length < 60) {
          if (text.endsWith('Dashboard')) destination = '/dashboard/';
          else if (text.endsWith('Scans')) destination = '/scan-history/';
          else if (text.endsWith('Quarantine')) destination = '/quarantine/';
          else if (text.endsWith('Users')) destination = '/user-management/';
          else if (text.endsWith('Settings')) destination = '/settings/';
          else if (text.endsWith('Threat Intelligence')) destination = '/threat-information/';
          else if (text.endsWith('Help Content')) destination = '/help-content/';
          // "System Health" is the current screen and "Audit Logs" its
          // own table — no bridge for either.
        }
        node = node.parentElement;
      }

      // Bridged sidebar items route for real; stopPropagation keeps the
      // hand-off's onPress from also flipping its local `active` state
      // right before the route change unmounts the screen.
      if (destination) {
        event.preventDefault();
        event.stopPropagation();
        router.push(destination);
      }
    },
    [router],
  );

  return (
    // Capture-phase bridge: sits ABOVE the rendered screen so it wins over
    // the bubble-phase Pressable handlers (as in screens 14–17).
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      {/* Glue-only viewport fix (the hand-off file stays byte-identical).

          react-native-web renders the hand-off's decorative sparklines as
          absolutely-positioned flex rows inside the metric cards
          (`overflow: hidden`), which is fine — but the audit table's
          horizontal ScrollView plus the two bottom panels rely on the
          hand-off's own breakpoints (compact < 1100, narrow < 760) via
          useWindowDimensions, which react-native-web wires to the visual
          viewport and updates live, so no media-query glue is needed.

          No stacking glue either: unlike screens 15–17 this hand-off
          opens no inline absolute menus — the filters toggle in place,
          pagination is inline, and there are no modals or alerts — so
          nothing can layer out of order. Verified with elementsFromPoint
          and a console sweep during review; this block intentionally
          stays empty of rules unless a browser-specific defect shows up. */}
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native system-health screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View. The page
 * background matches the hand-off's `styles.safeArea` (#F4F8FF).
 */
export default function SystemHealthPreview() {
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
        <SystemHealthPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
