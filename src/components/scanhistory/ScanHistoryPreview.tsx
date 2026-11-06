'use client';

// Must be the first import: defines the `__DEV__` global before any
// React Native library module evaluates.
import '@/rn-web/native-globals';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenLoader from '@/rn-web/ScreenLoader';
import { webInitialMetrics } from '@/rn-web/webSafeAreaMetrics';

const loadScreen = () => import('./ScanHistoryScreen');

/**
 * The hand-off is self-contained (no navigation props): its sidebar
 * `navigate()` and row `openRecord()` are console.log stubs. This bridge now
 * feeds the screen its REAL history from GET /api/scans (the same records
 * the scanner writes), mapped into the hand-off's ScanRecord shape, and
 * routes row clicks into the matching result screens. If the API is
 * unreachable the screen keeps its own demo snapshot, so the preview never
 * dead-ends.
 */
type BridgedRecord = {
  item: string;
  subtitle?: string;
  type: 'File' | 'Link';
  date: string;
  time: string;
};

type ApiScan = {
  id?: string;
  kind?: string;
  target?: string;
  size?: number | null;
  verdict?: string;
  severity?: string | null;
  reasons?: string[];
  checkedAt?: string;
};

/** Mirrors the hand-off's ScanResult union for the rows the glue injects. */
type ScanResultValue =
  | 'Threat found'
  | 'No known threat'
  | 'Likely dangerous'
  | 'Needs your review'
  | 'Could not decide';

/** Structural match of the hand-off's ScanRecord, fed via the records prop. */
type LiveRecord = {
  id: string;
  date: string;
  time: string;
  item: string;
  subtitle?: string;
  type: 'File' | 'Link';
  result: ScanResultValue;
  detail: string;
  icon: 'document' | 'image' | 'link';
};

// Demo metadata mirrored from the hand-off's sample records, so row clicks
// still route when the API is unreachable.
const BRIDGED_RECORDS: BridgedRecord[] = [
  { item: 'Project_Proposal.pdf', subtitle: '2.4 MB', type: 'File', date: 'Oct 30, 2025', time: '10:24 AM' },
  { item: 'Screenshot_20251030.png', subtitle: '1.2 MB', type: 'File', date: 'Oct 30, 2025', time: '09:17 AM' },
  { item: 'https://malicious-site.fake', type: 'Link', date: 'Oct 29, 2025', time: '06:42 PM' },
  { item: 'https://example.com', type: 'Link', date: 'Oct 29, 2025', time: '02:13 PM' },
  { item: 'photo_20251028.jpg', subtitle: '3.6 MB', type: 'File', date: 'Oct 28, 2025', time: '11:07 AM' },
  { item: 'https://bit.ly/abc123', type: 'Link', date: 'Oct 27, 2025', time: '08:32 PM' },
  { item: 'Notes_backup.docx', subtitle: '1.1 MB', type: 'File', date: 'Oct 27, 2025', time: '01:15 PM' },
  { item: 'https://safe-site.com', type: 'Link', date: 'Oct 26, 2025', time: '09:03 AM' },
];

/** Rough content-type label for the scan-result screen, from the extension. */
function describeFile(item: string): string {
  const ext = item.slice(item.lastIndexOf('.') + 1).toLowerCase();
  if (ext === 'pdf') return 'PDF document';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return 'Image';
  if (ext === 'docx' || ext === 'doc') return 'Word document';
  return 'File';
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

const normalize = (text: string) => (text || '').replace(/\s+/g, ' ').trim();

function ScanHistoryPreviewInner() {
  const router = useRouter();

  // Live history: GET /api/scans mapped into the hand-off's record shape.
  // Null keeps the hand-off's own demo snapshot on API failure.
  const [bridged, setBridged] = React.useState<BridgedRecord[]>(BRIDGED_RECORDS);
  const [liveRecords, setLiveRecords] = React.useState<LiveRecord[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/scans/?limit=60', {
          credentials: 'same-origin',
        });
        if (!response.ok) return;
        const data = (await response.json()) as { scans?: ApiScan[] };
        const scans = data.scans ?? [];
        if (cancelled || scans.length === 0) return;

        const records: LiveRecord[] = scans.map(scan => {
          const checked = new Date(scan.checkedAt ?? Date.now());
          const date = checked.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });
          const time = checked.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit',
          });
          const isFile = scan.kind !== 'link';
          const target = scan.target ?? 'Unknown item';
          const ext = target.slice(target.lastIndexOf('.') + 1).toLowerCase();
          const result: ScanResultValue =
            scan.verdict === 'malicious'
              ? isFile ? 'Threat found' : 'Likely dangerous'
              : scan.verdict === 'suspicious'
                ? 'Needs your review'
                : scan.verdict === 'error'
                  ? 'Could not decide'
                  : 'No known threat';
          return {
            id: scan.id ?? target,
            date,
            time,
            item: target,
            subtitle: isFile && scan.size ? formatSize(scan.size) : undefined,
            type: isFile ? 'File' : 'Link',
            result,
            detail: scan.reasons?.[0] ?? 'No known threat found.',
            icon: isFile
              ? ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext) ? 'image' : 'document'
              : 'link',
          };
        });

        setLiveRecords(records);
        setBridged(records.map(({ item, subtitle, type, date, time }) => ({
          item, subtitle, type: type as 'File' | 'Link', date, time,
        })));
      } catch {
        // Hand-off keeps its demo snapshot; nothing to do.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleBridgeClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const root = event.currentTarget;
      let node = event.target as HTMLElement | null;
      let destination: string | null = null;

      while (node && node !== root && !destination) {
        const text = normalize(node.innerText);

        // Sidebar navigation (exact label match; History is this screen).
        if (text === 'Home') destination = '/dashboard/';
        else if (text === 'Quarantine') destination = '/quarantine/';
        else if (text === 'Settings') destination = '/dashboard/?view=Settings';

        // Row identification: the innermost node whose text is exactly the
        // record's item, or a row-sized node containing it plus a time.
        if (!destination) {
          for (const record of bridged) {
            const isItem = text === record.item;
            const isRow =
              text.includes(record.item) &&
              (text.includes('AM') || text.includes('PM')) &&
              text.length < 400;
            if (!isItem && !isRow) continue;
            if (record.type === 'File') {
              const query = new URLSearchParams({
                file: record.item,
                type: describeFile(record.item),
                ...(record.subtitle ? { size: record.subtitle } : {}),
                scanDate: record.date,
                scanTime: record.time,
              }).toString();
              destination = `/scan-result/?${query}`;
            } else {
              // Mirrors the hand-off's "Oct 30, 2025  •  10:24 AM" format.
              const query = new URLSearchParams({
                url: record.item,
                checkedAt: `${record.date}  •  ${record.time}`,
              }).toString();
              destination = `/link-scan-result/?${query}`;
            }
            break;
          }
        }

        node = node.parentElement;
      }

      if (destination) router.push(destination);
    },
    [bridged, router],
  );

  return (
    // The capture-phase bridge must sit ABOVE the rendered screen: the
    // hand-off's sidebar and rows are console.log stubs on the web preview.
    <div onClickCapture={handleBridgeClick} style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <ScreenLoader load={loadScreen} screenProps={{ records: liveRecords ?? undefined }} />
    </div>
  );
}

/**
 * Renders the React Native scan-history screen in the browser via
 * react-native-web.
 *
 * `SafeAreaProvider` is required by the `SafeAreaView` imported from
 * react-native in the hand-off; on web it maps to a plain View.
 */
export default function ScanHistoryPreview() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        backgroundColor: '#F4F8FD',
        fontFamily:
          'system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <SafeAreaProvider initialMetrics={webInitialMetrics} style={{ flex: 1 }}>
        <ScanHistoryPreviewInner />
      </SafeAreaProvider>
    </div>
  );
}
