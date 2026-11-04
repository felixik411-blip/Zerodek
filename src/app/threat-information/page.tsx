import type { Metadata } from 'next';
import ThreatInformationPreview from '@/components/threatinformation/ThreatInformationPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Threat Information Management',
  description:
    'Admin threat indicator management: search indicators, filter by type and status, add new domain/IP/hash indicators, change statuses, remove entries, and review recent activity.',
};

export default function ThreatInformation() {
  return <ThreatInformationPreview />;
}
