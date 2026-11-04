'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and bridges `Alert.alert` to a
// browser dialog so the hand-off's validation notice, the row-actions
// "Article actions" menus (Publish/Unpublish/Delete) and the
// "Missing information" dialog actually open on the web.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./HelpContentScreen');

/*
 * The help-content hand-off (upload/17.md) is fully self-contained and
 * interactive by design, per its own notes ("Data is local demo state;
 * connect the handlers to your API/CMS when ready"): the four content
 * tabs switch, the search box filters the article list live, clicking a
 * row (or its edit button) loads it into the editor, the editor keeps
 * title/content state, "New Article" empties the form into new-article
 * mode, "Publish Changes" validates and writes back (add or update) with
 * a published confirmation, every row's ⋮ menu publishes/unpublishes or
 * deletes behind a confirmation, the rich-text toolbar opens the preview
 * modal (other formatting buttons are honest placeholders), and the
 * preview modal closes from ✕ / "Close preview" — those interactions
 * stay inside the screen and are NOT bridged.
 *
 * To connect the screen to the rest of the app without touching the
 * byte-identical screen code, the preview wraps it in a click-capture
 * bridge:
 *
 * - The sidebar is the hand-off's own navigation surface. Its items route
 *   to the real admin screens (Dashboard, Scans, Quarantine, Users,
 *   Settings, Threat Intelligence) by suffix match — the Ionicons glyph
 *   prefixes each item's innerText. "Help Content" is this screen itself
 *   (the hand-off marks it active), so it keeps the hand-off's inline
 *   alert and is deliberately not bridged. Sidebar clicks are told apart
 *   from same-text page content (e.g. the page title) by checking for the
 *   sidebar's dark background colour (#101D2D) among the click target's
 *   ancestors. Bridged items suppress the hand-off's "not wired in this
 *   screen" placeholder alert (capture-phase stopPropagation — the same
 *   rationale as screen 16's "Add Indicator" bridge), because unlike
 *   screens 14-16 the placeholder here is a BLOCKING web confirm dialog
 *   that would otherwise appear on every sidebar navigation.
 * - The top-bar menu button is the same integration point as screens
 *   14-16 — its alert says "Connect this menu to your app navigation." —
 *   so it routes to the admin dashboard screen (14), suppressing its own
 *   placeholder alert for the same reason. The button renders only the
 *   Ionicons `menu` glyph (no text), so the bridge matches its code point
 *   instead of innerText (see MENU_GLYPH below).
 * - The bell ("No new notifications") and the Admin account button
 *   ("Connect this menu to your account actions.") keep the hand-off's
 *   alerts: there is no notifications or account screen to route to (same
 *   policy as screens 14-16).
 */

/** Ionicons code point for the `menu` glyph (from the installed glyphmap). */
const MENU_GLYPH = 0xf451;
/** Sidebar dark from the hand-off palette (`COLORS.sidebar` in upload/17.md, #101D2D). */
const SIDEBAR_DARK = 'rgb(16, 29, 45)';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function HelpContentPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Top-bar menu button: the click lands on the icon's <span>, whose
      // textContent is the single private-use-area glyph. The bridge
      // replaces the button's "Connect this menu to your app navigation."
      // placeholder with the real thing, so the now-stale placeholder alert
      // is suppressed (same rationale as screen 16's "Add Indicator"
      // bridge: stopPropagation in the capture phase keeps the bubble-phase
      // Pressable handler from firing its dead-end alert).
      const glyph = target.textContent?.trim().codePointAt(0);
      if (glyph === MENU_GLYPH) {
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
        // The Ionicons glyph prefixes the nav item's innerText (e.g.
        // `" Dashboard`), so match by suffix. The length guard keeps the
        // walk-up from matching these suffixes against the whole nav list.
        if (text.length < 60) {
          if (text.endsWith('Dashboard')) destination = '/dashboard/';
          else if (text.endsWith('Scans')) destination = '/scan-history/';
          else if (text.endsWith('Quarantine')) destination = '/quarantine/';
          else if (text.endsWith('Users')) destination = '/user-management/';
          else if (text.endsWith('Settings')) destination = '/settings/';
          else if (text.endsWith('Threat Intelligence')) destination = '/threat-information/';
          else if (text.endsWith('Real-Time Protection')) destination = '/real-time-protection/';
          else if (text.endsWith('Privacy Audit')) destination = '/privacy-audit/';
          // "Help Content" is the current screen — no bridge.
        }
        node = node.parentElement;
      }

      // Bridged sidebar items route for real, so the hand-off's
      // "${label} navigation is not wired in this screen." placeholder
      // alert is suppressed for them (capture-phase stopPropagation, as
      // above). The active "Help Content" item is not bridged and keeps
      // its alert, as do the bell and admin-account buttons.
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
    // the bubble-phase Pressable handlers (as in screens 14-16).
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      {/* Glue-only compact fix (the hand-off file stays byte-identical).

          react-native-web compiles the hand-off's `flex: 0` (styles
          `panelCompact`) to `flex: 0 1 0%` — a definite zero flex-basis.
          In the compact workspace (flexDirection switches to column) the
          two panels' basis resolves to 0 instead of their content, and
          both collapse to their 2px borders (verified in the browser at
          900px). Native Yoga cannot resolve the 0% basis against the
          workspace's auto height, so on a device the panels keep their
          natural content height — the hand-off's intended behaviour.

          → Give the compact panels `flex-basis: auto`, restoring that
          natural height. The rule self-scopes to compact mode: the
          `panelCompact` style (flex 0 + width "100%" + alignSelf
          "stretch") only exists below the hand-off's own 1050px
          breakpoint, so no media query is needed. The three atomic
          classes in combination are unique to the two panels.

          No stacking glue needed: unlike screens 15/16 this hand-off
          opens no inline absolute menus — row actions are Alert dialogs
          (bridged by native-globals) and the article preview is a
          react-native-web Modal, both of which render above the page.
          Verified with elementsFromPoint during review. */}
      <style>{`
        .r-flex-1d9yedq.r-width-13qz1uu.r-alignSelf-1pz39u2 {
          flex-basis: auto !important;
        }
      `}</style>
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native help-content screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View. The page
 * background matches the hand-off's `COLORS.background` (#F4F8FE).
 */
export default function HelpContentPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F4F8FE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <HelpContentPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
