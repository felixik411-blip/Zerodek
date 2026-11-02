import type { Metadata } from 'next';
import QuarantineDetailsPreview from '@/components/quarantinedetails/QuarantineDetailsPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Quarantined file details',
  description:
    'Details of a quarantined file: status, metadata, scan-before-restoring, permanent delete and scan history.',
};

export default function QuarantineDetails() {
  return <QuarantineDetailsPreview />;
}
