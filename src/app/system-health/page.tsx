import type { Metadata } from 'next';
import SystemHealthPreview from '@/components/systemhealth/SystemHealthPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — System Health / Audit Logs',
  description:
    'Admin system health and audit log monitoring: availability, error and admin-action metrics, a searchable audit table with event/result filters and pagination, recent errors, and live system status.',
};

export default function SystemHealth() {
  return <SystemHealthPreview />;
}
