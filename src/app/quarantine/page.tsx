import type { Metadata } from 'next';
import QuarantinePreview from '@/components/quarantine/QuarantinePreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Quarantined files',
  description:
    'Files that were isolated because they may be harmful, with search, details, restore and delete actions.',
};

export default function Quarantine() {
  return <QuarantinePreview />;
}
