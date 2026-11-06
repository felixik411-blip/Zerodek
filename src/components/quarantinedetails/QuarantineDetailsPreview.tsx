'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and patches `Alert.alert` so the
// hand-off's scan/delete dialogs actually open browser dialogs.
import '@/rn-web/native-globals';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./QuarantineDetailsScreen');

function QuarantineDetailsPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Live quarantined item forwarded by the quarantine list (screen 8) via
  // query params. Without params the hand-off keeps its designed sample.
  const itemId = params.get('id') ?? undefined;
  const itemName = params.get('name') ?? undefined;
  const itemType = params.get('type') ?? undefined;
  const itemSize = params.get('size') ?? undefined;
  const itemReason = params.get('reason') ?? undefined;
  const itemDate = params.get('date') ?? undefined;

  // Back to the quarantined-files list (screen 8). The hand-off's back link
  // and the help bar's "Back to list" both fall back to onOpenQuarantine,
  // which is wired to the same destination.
  const handleBack = React.useCallback(() => {
    // Trailing slash on purpose — see ScanProgressPreview for the redirect
    // loop rationale.
    router.push('/quarantine/');
  }, [router]);

  const handleHome = React.useCallback(() => {
    router.push('/dashboard/');
  }, [router]);

  // The real scan-history screen (screen 10) now exists, so the sidebar
  // History item goes there. (The dashboard's `?view=History` deep-link
  // bridge remains available for anything that still uses it.)
  const handleHistory = React.useCallback(() => {
    router.push('/scan-history/');
  }, [router]);

  const handleSettings = React.useCallback(() => {
    router.push('/dashboard/?view=Settings');
  }, [router]);

  // "Delete permanently" on a live row really removes it through
  // DELETE /api/quarantine/:id, so the list refreshes without it.
  const handleDelete = React.useCallback(
    (id: string) => {
      void (async () => {
        try {
          await fetch(`/api/quarantine/${id}/`, {
            method: 'DELETE',
            credentials: 'same-origin',
          });
        } catch {
          // The hand-off already showed its "File deleted" state; a failed
          // request just means the item stays until the next refresh.
        }
      })();
    },
    [],
  );

  const screenProps = React.useMemo(
    () => ({
      onBack: handleBack,
      onHome: handleHome,
      onHistory: handleHistory,
      onSettings: handleSettings,
      onOpenQuarantine: handleBack,
      itemId,
      itemName,
      itemType,
      itemSize,
      itemReason,
      itemDate,
      onDelete: itemId ? handleDelete : undefined,
    }),
    [handleBack, handleHome, handleHistory, handleSettings, itemId, itemName, itemType, itemSize, itemReason, itemDate, handleDelete],
  );

  return (
    <div
      className="qd-root"
      style={{ flex: 1, display: 'flex', minHeight: 0 }}
    >
      <style>{`
        /* Glue-only mobile fix (the hand-off file stays untouched).
           This hand-off renders its 280px sidebar at every width (its
           'compact' flag only stacks the content grids) and uses desktop
           min-widths (300px+), which leaves ~110px for the content on a
           phone and forces horizontal overflow — the hand-off itself notes
           it is "optimized for a desktop-width React Native Web view".
           Every other screen's hand-off hides its sidebar below ~900px, so
           below 900px this glue rule matches that behaviour: hide the
           sidebar (the app row's first of exactly two children — the
           :nth-last-child(2) guard keeps it away from the loader's
           loading/error cards) and let the stacked content use the full
           width. Desktop (≥ 900px) is unchanged. */
        @media (max-width: 899px) {
          .qd-root > div > div:first-child:nth-last-child(2) {
            display: none !important;
          }
          .qd-root div {
            min-width: 0 !important;
          }
        }
      `}</style>
      <ScreenLoader load={loadScreen} screenProps={screenProps} />
    </div>
  );
}

/**
 * Renders the React Native quarantined-file-details screen in the browser
 * via react-native-web.
 *
 * `SafeAreaProvider` is provided for consistency with the other previews;
 * this hand-off renders a plain `View` shell, so it simply goes unused.
 */
export default function QuarantineDetailsPreview() {
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
        {/* `useSearchParams` needs a Suspense boundary during static prerender. */}
        <React.Suspense fallback={null}>
          <QuarantineDetailsPreviewInner />
        </React.Suspense>
      </SafeAreaProvider>
    </div>
  );
}
