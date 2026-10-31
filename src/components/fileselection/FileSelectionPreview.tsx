'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import dynamic from 'next/dynamic';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Renders the React Native file-selection screen in the browser via
 * react-native-web.
 *
 * - `ssr: false` avoids hydration mismatches from `useWindowDimensions()`
 *   (server has no real window width, so the responsive layout must be
 *   computed on the client).
 * - `SafeAreaProvider` is required by `SafeAreaView` from
 *   react-native-safe-area-context; on web it maps to the CSS
 *   `env(safe-area-inset-*)` values.
 */
const SecurityScannerFileSelectionScreen = dynamic(
  () => import('./SecurityScannerFileSelectionScreen'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#60779A',
          fontSize: 14,
        }}
      >
        Loading screen…
      </div>
    ),
  }
);

export default function FileSelectionPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F7FAFE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider style={{ flex: 1 }}>
        <SecurityScannerFileSelectionScreen />
      </SafeAreaProvider>
    </div>
  );
}
