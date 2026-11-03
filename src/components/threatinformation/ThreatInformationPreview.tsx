'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and bridges `Alert.alert` to a
// browser confirm dialog so the hand-off's validation, "Remove indicator?"
// and "Indicator details" dialogs actually open on the web.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./ThreatInformationScreen');

/*
 * The threat-information hand-off (upload/16.md) is fully self-contained
 * and interactive by design, per its own notes ("Search, type/status
 * filters, adding, changing status, and removing indicators work
 * locally"): the search box and both filter pickers filter the 12 sample
 * indicators live, the Add Threat Indicator form validates (missing
 * fields, duplicates) and prepends rows, every row's ⋮ menu changes the
 * status, opens the details dialog or removes with confirmation, and the
 * table paginates five rows at a time — those interactions stay inside
 * the screen and are NOT bridged.
 *
 * To connect the screen to the rest of the app without touching the
 * byte-identical screen code, the preview wraps it in a click-capture
 * bridge:
 *
 * - The top-bar menu button is the hand-off's own integration point — its
 *   alert literally says "Connect your admin drawer here." The existing
 *   admin navigation in this app is the admin dashboard screen (14), so
 *   the button routes there. The button renders only the Ionicons `menu`
 *   glyph (no text), so the bridge matches its code point instead of
 *   innerText (see MENU_GLYPH below).
 * - The filter bar's "Add Indicator" button alerts "Use the form on the
 *   right to add an indicator." — the form is on the page, so the bridge
 *   scrolls to and focuses the form's Indicator Value input instead of
 *   leaving a dead-end alert (the placeholder alert is suppressed).
 * - The bell / admin-account / "View all activity" controls keep the
 *   hand-off's alerts: there is no notifications or audit screen to route
 *   to (same policy as screens 14 and 15).
 */

/** Ionicons code point for the `menu` glyph (from the installed glyphmap). */
const MENU_GLYPH = 0xf451;
/** Placeholder of the add-form's first input ("Indicator Value *"). */
const VALUE_INPUT_PLACEHOLDER = 'Enter domain, IP, or hash...';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function ThreatInformationPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Top-bar menu button: the click lands on the icon's <span>, whose
      // textContent is the single private-use-area glyph.
      const glyph = target.textContent?.trim().codePointAt(0);
      if (glyph === MENU_GLYPH) {
        router.push('/admin-dashboard/');
        return;
      }

      // Filter-bar "Add Indicator": focus the form's value input. The form's
      // own submit reads the same — tell them apart by document order (the
      // filter bar precedes the value input; the form submit follows it),
      // so the real submit passes through untouched.
      let node: HTMLElement | null = target;
      while (node) {
        const text = normalize(node.innerText);
        if (text.endsWith('Add Indicator') && text.length < 40) {
          const valueInput = document.querySelector(
            `input[placeholder="${VALUE_INPUT_PLACEHOLDER}"]`,
          );
          if (!(valueInput instanceof HTMLElement)) return;
          const targetPrecedesInput = !!(
            valueInput.compareDocumentPosition(target) &
            Node.DOCUMENT_POSITION_PRECEDING
          );
          if (!targetPrecedesInput) return;
          event.preventDefault();
          event.stopPropagation();
          valueInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          valueInput.focus({ preventScroll: true });
          return;
        }
        node = node.parentElement;
      }
    },
    [router],
  );

  return (
    // Capture-phase bridge: sits ABOVE the rendered screen so it wins over
    // the bubble-phase Pressable/TouchableOpacity handlers (as in screens
    // 14 and 15).
    <div
      onClickCapture={handleBridgeClick}
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      {/* Glue-only stacking fixes (the hand-off file stays byte-identical).
          react-native-web's view reset gives every View `position: relative;
          z-index: 0`, so siblings become stacking contexts painted in DOM
          order and absolutely-positioned menus are trapped inside their own
          ancestor's stacking context (verified with elementsFromPoint):

          1. A row's ⋮ menu (`rowMenu`, absolute, z-index 50) opens over the
             rows BELOW it — later rows are also z-0 contexts, DOM order
             wins, and the menu is covered ("Oct 29, 2025" bled through it).
             → Raise the open menu's row above its sibling rows.
             `r-minHeight-b7yqai` (minHeight 57) identifies table rows;
             `r-zIndex-1ym3atv` (z-index 50) identifies the open `rowMenu`.

          2. Menus can also spill past their card's bottom edge into the
             Recent Activity card (a later sibling of the `mainRow` that
             holds both the table card and the add card). Raising the cards
             alone cannot fix this: their z-index is trapped inside
             `mainRow`'s own z-0 stacking context, and `mainRow` (z-0) loses
             to the later `activityCard` (z-0) on DOM order — the "Recent
             Activity" heading box painted over the add form's options menu.
             → Raise `mainRow` itself (unique `flex-start` + row + 10px gap
             combo) above `activityCard` while a row menu (z-index 50) or a
             form options menu (z-index 40) is open inside it. `mainRow` and
             `activityCard` only overlap where a menu spills, so the raised
             row is invisible otherwise.

          3. Every add-form picker wrap (`pickerWrap`, z-index 4) opens its
             options (absolute, z-index 40) DOWNWARD over the pickers below
             it — later wraps are equal z-4 contexts, DOM order wins, and
             the "Select source" / "Active" wraps painted over the open
             menu.
             → Raise the wrap that contains the open options menu.
             `r-zIndex-8fdsdq` (z-index 4) identifies picker wraps;
             `r-zIndex-1lts25c` (z-index 40) identifies the open options.

          The filter bar's own pickers need one extra rule: the bar carries
          the hand-off's z-index 10, which already paints above the cards
          while the cards are at their default z-0 — but rule 2 raises
          `mainRow` to 20 while a row menu is open (the hand-off keeps both
          menus open at once — there is no outside-click closing), which
          would paint the table OVER the open filter dropdown.

          4. → While the filter bar contains an open options menu, raise the
             bar itself (its 11px radius is unique to it) above `mainRow`,
             restoring the hand-off's native stacking (on device, zIndex 10
             beats the table's z 0 regardless of other menus).
             `r-borderRadius-1mxhqmb` identifies the filter bar.

          5. Vertical clipping. react-native-web computes a horizontal
             ScrollView's overflow-y to `hidden`, so a ⋮ menu opened on the
             BOTTOM row is cut at the card's bottom edge ("Remove" fell
             inside the hidden scrollable region — elementsFromPoint found
             only the page background). Wide viewports (≥1240px) never need
             the horizontal scroll — the table's fixed 824px of columns fit
             the card — so the clip is released there. Below 1240px the
             menu clips exactly as it does inside a native horizontal
             ScrollView (iOS/Android clip vertically too), so the hand-off's
             own behaviour is preserved. The rule targets the table card's
             ScrollView only (its parent carries the card's `minWidth: 0` +
             `overflow: visible` reset classes), leaving the Recent
             Activity table's ScrollView untouched.
             `r-minWidth-bcqeeo` + `r-overflow-bztko3` identify the table
             card; `r-overflowX-lltvgl` identifies its horizontal
             ScrollView.
          `:has()` is supported in all current browsers. */}
      <style>{`
        .r-minHeight-b7yqai:has(.r-zIndex-1ym3atv) {
          z-index: 40 !important;
        }
        .r-alignItems-1habvwh.r-flexDirection-18u37iz.r-gap-uaa2di:has(.r-zIndex-1ym3atv),
        .r-alignItems-1habvwh.r-flexDirection-18u37iz.r-gap-uaa2di:has(.r-zIndex-1lts25c) {
          z-index: 20 !important;
        }
        .r-zIndex-8fdsdq:has(.r-zIndex-1lts25c) {
          z-index: 10 !important;
        }
        .r-borderRadius-1mxhqmb:has(.r-zIndex-1lts25c) {
          z-index: 30 !important;
        }
        @media (min-width: 1240px) {
          .r-minWidth-bcqeeo.r-overflow-bztko3 > .r-overflowX-lltvgl {
            overflow: visible !important;
          }
        }
      `}</style>
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native threat-information screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View. The page
 * background matches the hand-off's `C.page` (#F4F8FF).
 */
export default function ThreatInformationPreview() {
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
        <ThreatInformationPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
