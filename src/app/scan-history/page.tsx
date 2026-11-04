import type { Metadata } from 'next';
import ScanHistoryPreview from '@/components/scanhistory/ScanHistoryPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Scan history',
  description:
    'Recent file scans and link checks with filters, search and per-record results.',
};

export default function ScanHistory() {
  return <ScanHistoryPreview />;
}
