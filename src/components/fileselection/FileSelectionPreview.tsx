'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./SecurityScannerFileSelectionScreen');

// Demo metadata mirrored from the hand-off's file list, so the scan-progress
// screen can show the real type/size of a chosen demo file. Unknown files
// (e.g. picked via "Browse device") fall back to an extension-based type.
const KNOWN_FILES: Record<string, [string, string]> = {
  'Project_Proposal.pdf': ['PDF document', '2.4 MB'],
  'Screenshot_20251030.png': ['Image', '1.8 MB'],
  'Resume.docx': ['Word document', '856 KB'],
  'Budget_Sheet.xlsx': ['Excel spreadsheet', '1.2 MB'],
  'Source_Code.zip': ['ZIP archive', '4.6 MB'],
  'Meeting_Notes.docx': ['Word document', '420 KB'],
  'Project_Plan.pdf': ['PDF document', '1.6 MB'],
  'Screenshot.png': ['Image', '1.8 MB'],
  'Photo.jpg': ['Image', '3.1 MB'],
  'Download.zip': ['ZIP archive', '4.6 MB'],
};

function guessType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF document';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext)) return 'Image';
  if (ext === 'doc' || ext === 'docx') return 'Word document';
  if (ext === 'xls' || ext === 'xlsx') return 'Excel spreadsheet';
  if (ext === 'zip') return 'ZIP archive';
  return 'File';
}

/**
 * Renders the React Native file-selection screen in the browser via
 * react-native-web.
 *
 * The file-selection hand-off is intentionally self-contained (no navigation
 * props), so the flow is bridged at the glue level: a capture-phase DOM
 * listener detects clicks on the element whose text is exactly "Scan selected
 * file", reads the "Selected: …" chip the hand-off renders for the chosen
 * file, and routes to the scan-progress screen with the file's metadata. With
 * nothing chosen, the hand-off's own guidance message stays in charge. The
 * hand-off component itself is not modified.
 */
export default function FileSelectionPreview() {
  const router = useRouter();

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let hit = false;
      while (node && node !== root) {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
        if (text === 'Scan selected file') hit = true;
        node = node.parentElement;
      }
      if (!hit) return;

      const match = (root.innerText || '')
        .replace(/[ \t]+/g, ' ')
        .match(/Selected: (.+)/);
      if (!match) return;

      const name = match[1].trim();
      const [type, size] = KNOWN_FILES[name] ?? [guessType(name), 'Unknown size'];
      const query = new URLSearchParams({ file: name, type, size });
      router.push(`/scan-progress/?${query.toString()}`);
    },
    [router],
  );

  return (
    <div
      onClickCapture={handleBridgeClick}
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F7FAFE',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <ScreenLoader load={loadScreen} />
      </SafeAreaProvider>
    </div>
  );
}
