import type { Metadata } from 'next';
import ScanProgressPreview from '@/components/scanprogress/ScanProgressPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Scan Progress',
  description: 'Live progress while the selected file is checked for threats.',
};

export default function ScanProgress() {
  return <ScanProgressPreview />;
}
