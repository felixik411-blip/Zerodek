'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SettingsScreen');

/**
 * The hand-off is self-contained (no navigation props): its sidebar
 * `NavItem`s are rendered without `onPress`, and its own note says the
 * quarantine-management action is a placeholder to "connect to your app's
 * actual screens". Those routes all exist now, so this bridge routes the
 * obvious taps at the glue level, exactly like the scan-history screen's
 * bridge. The hand-off component itself is not modified.
 *
 * Matching rules (deliberately conservative — the page body also contains
 * the strings "Quarantine retention" and "Settings", which must NOT
 * navigate):
 *  - "Home"        → dashboard
 *  - "History"     → scan history
 *  - "Quarantine"  → quarantined files (sidebar badge "2" makes the row
 *                    text "Quarantine2", so both exact forms are mapped)
 *  - "Delete quarantined files" → quarantined files, where deletion
 *                    actually lives. The hand-off's own retention toggle
 *                    still fires, but the screen unmounts on navigation.
 * "Settings" in the sidebar is the current screen (active) — no bridge.
 */
const normalize = (text: unknown) => String(text ?? '').replace(/\s+/g, ' ').trim();

function SettingsPreviewInner() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let destination: string | null = null;

      while (node && node !== root && !destination) {
        const text = normalize(node.innerText);

        // Sidebar navigation (exact label match).
        if (text === 'Home') destination = '/dashboard/';
        else if (text === 'History') destination = '/scan-history/';
        else if (text === 'Quarantine' || text === 'Quarantine2') destination = '/quarantine/';
        // Quarantine management action inside the retention card.
        else if (text.startsWith('Delete quarantined files')) destination = '/quarantine/';

        node = node.parentElement;
      }

      if (destination) router.push(destination);
    },
    [router],
  );

  return (
    // The capture-phase bridge must sit ABOVE the rendered screen: the
    // hand-off's sidebar rows have no onPress on the web preview.
    <div onClickCapture={handleBridgeClick} style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/*
        Glue-only layout compensation (hand-off file untouched).

        The hand-off keeps its `app` container in `flexDirection: "row"` on
        every width, so below its own `isWide` breakpoint (900) the
        `mobileTopbar` renders as a left rail beside the content instead of
        the "compact top navigation" its comment describes. These rules
        target the topbar by its react-native-web atomic classes (minHeight
        62px + background #14263b, unique on narrow screens because the
        desktop sidebar is not rendered there) and stack it above `main`,
        matching the hand-off's stated intent.

        Same approach as the quarantined-files screen's stacking-context fix.
      */}
      <style>{`
        @media (max-width: 899.98px) {
          div:has(> .r-minHeight-u4tkfy.r-backgroundColor-1wq6laf) {
            flex-direction: column !important;
          }
          .r-minHeight-u4tkfy.r-backgroundColor-1wq6laf {
            width: 100% !important;
          }

          /* The hand-off indents card bodies by a fixed 74/76px (aligned
             under the desktop section icons) and lays the privacy banner +
             learn-more link and the retention summary + manage action out
             side by side. On a 390px phone that leaves ~50px per column, so
             drop the indents and stack those pairs instead. */
          .r-marginLeft-ljbjhw,
          .r-marginLeft-lpxesh {
            margin-left: 0 !important;
          }
          /* Privacy: banner above the learn-more link. */
          .r-marginLeft-ljbjhw.r-gap-840iz4 {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          /* Notifications: label left, switch right, without the 115px gap. */
          .r-marginLeft-ljbjhw:not(.r-gap-840iz4) {
            justify-content: space-between !important;
            gap: 12px !important;
          }
          /* Retention: summary above the manage action; divider on top
             instead of the desktop left border. */
          .r-marginLeft-lpxesh.r-gap-1u2zzbn {
            flex-direction: column !important;
            gap: 14px !important;
          }
          .r-marginLeft-lpxesh.r-gap-1u2zzbn > div:last-child {
            border-left-width: 0 !important;
            border-top-width: 1px !important;
            padding-left: 0 !important;
            padding-top: 14px !important;
          }
        }
      `}</style>
      <ScreenLoader load={loadScreen} />
    </div>
  );
}

/**
 * Renders the React Native settings screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View.
 */
export default function SettingsPreview() {
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
        <SettingsPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
