import type { Metadata } from 'next';
import PrivacyAuditPreview from '@/components/privacyaudit/PrivacyAuditPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Privacy & Permission Audit',
  description:
    'Privacy and permission audit: live privacy score with re-run audit progress, device-permission groups with grant/revoke switches, an app-access table with one-tap revoke, and actionable recommendations.',
};

export default function PrivacyAudit() {
  return <PrivacyAuditPreview />;
}
