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

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

type FileVerdict = {
  id?: string;
  verdict?: string;
  severity?: string | null;
  reasons?: string[];
  threat?: { name?: string } | null;
  error?: string;
};

/**
 * Scans a file through POST /api/scan/file (server-side SHA-256 signature
 * match + heuristics, persisted in the Scan table) and returns the verdict
 * payload, or null when the service is unreachable.
 */
async function scanFile(file: File): Promise<FileVerdict | null> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/scan/file/', {
    method: 'POST',
    body,
    credentials: 'same-origin',
  });
  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as FileVerdict | null;
}

/**
 * Renders the React Native file-selection screen in the browser via
 * react-native-web.
 *
 * The file-selection hand-off is intentionally self-contained (no navigation
 * props), so the flow is bridged at the glue level:
 *
 * - "Scan selected file" now performs a real scan: the chosen demo file is
 *   materialized as a small sample blob and uploaded to POST /api/scan/file;
 *   the verdict travels with the flow via query params, so the result screen
 *   (screen 5) shows the genuine outcome instead of a fixed sample.
 * - "Browse device" opens a real file picker; the picked file is uploaded
 *   byte-for-byte, so dropping the EICAR test file (or any file whose
 *   SHA-256 is in the signature table) is detected for real.
 * - If the API is unreachable the glue shows an honest notice and stays on
 *   the selection screen rather than fabricating a verdict.
 */
export default function FileSelectionPreview() {
  const router = useRouter();

  const runScan = React.useCallback(
    async (name: string, file: File) => {
      const [type, fallbackSize] = KNOWN_FILES[name] ?? [guessType(name), 'Unknown size'];
      const size = formatSize(file.size);
      const data = await scanFile(file);
      if (!data?.verdict) {
        window.alert(
          'The scan service is unreachable right now. Please try again in a moment.',
        );
        return;
      }
      const query = new URLSearchParams({
        file: name,
        type,
        size,
        verdict: data.verdict,
        ...(data.severity ? { severity: data.severity } : {}),
        ...(data.threat?.name ? { threat: data.threat.name } : {}),
        reasons: JSON.stringify(data.reasons ?? []),
        ...(data.id ? { scanId: data.id } : {}),
      });
      router.push(`/scan-progress/?${query.toString()}`);
      void fallbackSize;
    },
    [router],
  );

  const scanDemoFile = React.useCallback(
    (name: string) => {
      // Materialize the demo entry as a real sample blob so the server can
      // hash it and run the same pipeline as a device upload.
      const content =
        `Zerodek Security Scanner — demo sample\n` +
        `file: ${name}\n` +
        `generated: ${new Date().toISOString()}\n`;
      const blob = new Blob([content], { type: 'application/octet-stream' });
      void runScan(name, new File([blob], name));
    },
    [runScan],
  );

  const browseDevice = React.useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const picked = input.files?.[0];
      input.remove();
      if (picked) void runScan(picked.name, picked);
    });
    document.body.appendChild(input);
    input.click();
  }, [runScan]);

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let hitScan: string | null = null;
      let hitBrowse = false;
      while (node && node !== root) {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
        if (text === 'Scan selected file') hitScan = 'scan';
        if (text === 'Browse device') hitBrowse = true;
        node = node.parentElement;
      }
      if (hitBrowse) {
        event.preventDefault();
        event.stopPropagation();
        browseDevice();
        return;
      }
      if (!hitScan) return;
      const match = (root.innerText || '')
        .replace(/[ \t]+/g, ' ')
        .match(/Selected: (.+)/);
      if (!match) return;
      event.preventDefault();
      event.stopPropagation();
      scanDemoFile(match[1].trim());
    },
    [browseDevice, scanDemoFile],
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
