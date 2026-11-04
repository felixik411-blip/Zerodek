import type { Metadata } from 'next';
import ResultPreview from '@/components/scanresult/ResultPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Scan Result',
  description:
    'What the scan found in your file. Threat found, quarantined, with quarantine, delete and scan-again actions.',
};

export default function ScanResult() {
  return <ResultPreview />;
}
