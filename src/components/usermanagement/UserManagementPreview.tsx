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
 * owns its state and gives every control inline feedback via its notice
 * strip, per its own integration notes ("Search and status filtering work
 * locally. The row menu opens a user detail dialog or a disable/re-enable
 * confirmation. Export actions currently show a notice"). The search box,
 * status filter, export menu, per-row "View" / ⋮ menus, the detail dialog
 * and the disable/re-enable confirmation therefore all work as-is — those
 * interactions stay inside the screen and are NOT bridged.
 *
 * To connect the screen to the rest of the app without touching the
 * byte-identical screen code, the preview wraps it in a click-capture
 * bridge:
 *
 * - Sidebar items route to the real screens (Dashboard, Scans, Quarantine,
 *   Settings, Help & Support) by suffix match — the Ionicons glyph
 *   prefixes each item's innerText. "Users" is this screen itself (the
 *   hand-off marks it active), so it keeps the hand-off's inline notice
 *   and is deliberately not bridged. Sidebar clicks are told apart from
 *   same-text page content (e.g. the "User Management" page title) by
 *   checking for the sidebar's navy background colour (#0D1D31) among the
 *   click target's ancestors.
 * - The "View all logs" link in the Audit Trail card has no audit-log
 *   screen to route to, so it keeps the hand-off's inline notice, as do
 *   the topbar menu / bell / admin-account buttons. (The admin dashboard's
 *   own "Users" item routes HERE — see AdminDashboardPreview.)
 */

/** Sidebar navy from the hand-off palette (`C.navy` in upload/15.md, #0D1D31). */
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
        // walk-up from matching these suffixes against the whole nav list.
        if (text.length < 60) {
          if (text.endsWith('Dashboard')) destination = '/dashboard/';
          else if (text.endsWith('Scans')) destination = '/scan-history/';
          else if (text.endsWith('Quarantine')) destination = '/quarantine/';
          // "Users" is the current screen — no bridge.
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
    // The capture-phase bridge must sit ABOVE the rendered screen: the
    // hand-off's sidebar rows only fire their own inline notice on the web
    // preview, and it must win over that (capture beats the bubble-phase
    // Pressable handlers).
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      {/* Glue-only fixes (the hand-off file stays byte-identical).

          1. Table width (desktop). The hand-off gives the tables' inner
             View `width: compact ? undefined : "100%"`, but react-native-
             web's horizontal ScrollView content container shrink-wraps its
             content, so "100%" resolves against the hug width instead of
             the card — at desktop the tables stop at ~968px inside a
             ~1200px card and every flex column is squeezed into wrapped
             lines. Stretching the content container to the card's real
             width (desktop only; below 900px — the hand-off's own `compact`
             breakpoint — the tables intentionally stay at their 930/900px
             minimum and scroll sideways). Both cards are matched via their
             direct ScrollView child; the toolbar and the dropdowns have no
             ScrollView and are untouched.

          2. Dropdown stacking. react-native-web's view reset gives every
             View `position: relative; z-index: 0`, so siblings become
             equal-height stacking contexts painted in DOM order. Three
             menus in this screen therefore lose to later siblings that
             overlap them (verified with elementsFromPoint — items render
             but never receive the click):

             a. The toolbar's dropdown menus (status filter + export) open
                DOWNWARD over the table card. The toolbar sits BEFORE the
                card in the DOM, so the card — and its horizontal ScrollView
                (`overflow: auto` + a transform) — paints over the menu
                items wherever they overlap.
                → Raise the toolbar above the card. `r-gap-1i71y14` is the
                toolbar's unique `gap: 14` atomic class (s.toolbar is the
                only node in the hand-off with a 14px gap).

             b. A row's ⋮ menu (`rowDropdown`, absolute, z-index 30) opens
                over the rows BELOW it — later rows are also z-0 contexts,
                DOM order wins, and the menu is covered.
                → Raise the open row above its siblings.

             c. The last row's ⋮ menu also spills past the card's bottom
                edge into the Audit Trail card (later sibling, z-0).
                → Raise the card that contains an open row menu above the
                audit card. The white+radius combo matches both cards, but
                only the table card can contain a `rowDropdown`.

             `r-minHeight-jlh1mq` (minHeight 67) identifies user rows;
             `r-zIndex-tmojj0` (z-index 30) identifies the open
             `rowDropdown`; `:has()` is supported in all current browsers. */}
      <style>{`
        @media (min-width: 900px) {
          .r-borderRadius-1dedoh8:has(> .r-WebkitOverflowScrolling-150rngu)
            > .r-WebkitOverflowScrolling-150rngu > div {
            width: 100%;
          }
        }
        .r-gap-1i71y14 {
          z-index: 30 !important;
        }
        .r-minHeight-jlh1mq:has(.r-zIndex-tmojj0) {
          z-index: 40 !important;
        }
        .r-backgroundColor-14lw9ot.r-borderRadius-1dedoh8:has(.r-zIndex-tmojj0) {
          z-index: 20 !important;
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
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View.
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
