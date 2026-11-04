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

  const handleViewDetails = React.useCallback(
    (_file: QuarantineFile) => {
      // The quarantined-file details screen (screen 9) is the details page
      // for these rows — its hand-off shows the same sample file
      // (Project_Proposal.pdf) and wires onOpenQuarantine back to this
      // list. The details hand-off takes only navigation callbacks (the
      // file name, size and dates it displays are its own sample data), so
      // there is nothing to forward here.
      router.push('/quarantine-details/');
    },
    [router],
  );

  const screenProps = React.useMemo(
    () => ({
      onBackHome: handleBackHome,
      onScanFile: handleScanFile,
      onViewDetails: handleViewDetails,
    }),
    [handleBackHome, handleScanFile, handleViewDetails],
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
