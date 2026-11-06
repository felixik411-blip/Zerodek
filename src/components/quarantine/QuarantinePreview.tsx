'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates, and patches `Alert.alert` so the
// hand-off's restore/delete confirmations actually open browser dialogs.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./QuarantineScreen');

/** Shape of a row in the hand-off's sample list (subset used for nav). */
type QuarantineFile = {
  id: string;
  name: string;
  description: string;
  type: string;
  date: string;
  time: string;
  status: 'Threat found' | 'Suspicious';
  reason: string;
  icon: 'file-pdf-box' | 'file-image';
  iconColor: string;
  /// Present on live rows from GET /api/quarantine (e.g. "2.4 MB").
  sizeLabel?: string;
};

function QuarantinePreviewInner() {
  const router = useRouter();

  const handleBackHome = React.useCallback(() => {
    // Trailing slash on purpose — see ScanProgressPreview for the redirect
    // loop rationale.
    router.push('/dashboard/');
  }, [router]);

  const handleScanFile = React.useCallback(() => {
    // The hand-off comment says "Navigate to your Choose a File screen" —
    // that's the file-selection screen (screen 3).
    router.push('/file-selection/');
  }, [router]);

  // Live quarantined rows from GET /api/quarantine, mapped into the
  // hand-off's row shape. Null keeps the hand-off's sample list when the
  // API is unreachable, so the preview never dead-ends.
  const [liveFiles, setLiveFiles] = React.useState<QuarantineFile[] | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const response = await fetch('/api/quarantine/', { credentials: 'same-origin' });
      if (!response.ok) return;
      const data = (await response.json()) as {
        items?: Array<{
          id?: string; name?: string; kind?: string; reason?: string;
          status?: string; sizeLabel?: string; createdAt?: string;
        }>;
      };
      const items = data.items ?? [];
      if (items.length === 0) return;
      setLiveFiles(items.map(item => {
        const created = new Date(item.createdAt ?? Date.now());
        const isImage = /\.(png|jpe?g|gif|webp|heic)$/i.test(item.name ?? '');
        return {
          id: item.id ?? item.name ?? '',
          name: item.name ?? 'Unknown item',
          description: item.kind === 'link' ? 'Link' : isImage ? 'Image' : 'File',
          type: item.kind === 'link' ? 'Link' : isImage ? 'Image' : 'File',
          date: created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: created.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          status: (item.status === 'Suspicious' ? 'Suspicious' : 'Threat found') as QuarantineFile['status'],
          reason: item.reason ?? item.status ?? 'Quarantined by the scanner.',
          icon: isImage ? 'file-image' : 'file-pdf-box',
          iconColor: item.status === 'Suspicious' ? '#0878F9' : '#F04444',
          ...(item.sizeLabel ? { sizeLabel: item.sizeLabel } : {}),
        } as QuarantineFile;
      }));
    } catch {
      // Hand-off keeps its sample list; nothing to do.
    }
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  const handleViewDetails = React.useCallback(
    (file: QuarantineFile) => {
      // The quarantined-file details screen (screen 9) is the details page
      // for these rows. The row's real fields travel via query params so
      // the details hand-off renders the selected item, not its sample.
      const query = new URLSearchParams({
        id: file.id,
        name: file.name,
        type: file.type === 'Link' ? 'Link' : file.description,
        ...(file.sizeLabel ? { size: file.sizeLabel } : {}),
        reason: file.reason,
        date: `${file.date}  •  ${file.time}`,
      }).toString();
      router.push(`/quarantine-details/?${query}`);
    },
    [router],
  );

  const handleRemove = React.useCallback(
    (file: QuarantineFile, action: 'delete' | 'restore') => {
      // "Delete permanently" really removes the item through
      // DELETE /api/quarantine/:id, then refreshes the live list.
      // "Restore" stays a UI-level action until a restore service exists.
      if (action !== 'delete' || !file.id) return;
      void (async () => {
        try {
          const response = await fetch(`/api/quarantine/${file.id}/`, {
            method: 'DELETE',
            credentials: 'same-origin',
          });
          if (response.ok) await refresh();
        } catch {
          // Row already left the local list; the refresh will reconcile.
        }
      })();
    },
    [refresh],
  );

  const screenProps = React.useMemo(
    () => ({
      onBackHome: handleBackHome,
      onScanFile: handleScanFile,
      onViewDetails: handleViewDetails,
      files: liveFiles ?? undefined,
      onRemove: handleRemove,
    }),
    [handleBackHome, handleScanFile, handleViewDetails, liveFiles, handleRemove],
  );

  return <ScreenLoader load={loadScreen} screenProps={screenProps} />;
}

/**
 * Renders the React Native quarantined-files screen in the browser via
 * react-native-web.
 *
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
export default function QuarantinePreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F6FAFF',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/*
        Glue-only web paint-order fix (the hand-off file stays untouched).
        react-native-web's base view reset gives every view
        `position: relative; z-index: 0`, so each table row becomes its own
        stacking context. The hand-off's action menu (zIndex: 10) overhangs
        below its row, and later siblings — the next row or the empty-state
        panel — paint over it, which makes "Restore file" / "Delete
        permanently" unclickable on web for real users. This rule removes the
        stacking context of any view that directly contains the open menu
        (the only zIndex-styled element in this hand-off), so the menu's own
        z-index applies at the list level and stays clickable. The action
        menu is a direct child of its row, and no other element in this
        screen uses zIndex. Native rendering is unaffected by CSS.
      */}
      <style>{'div:has(> div[class*="r-zIndex-"]) { z-index: auto !important; }'}</style>
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <QuarantinePreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
