import type { Metadata } from 'next';
import UserManagementPreview from '@/components/usermanagement/UserManagementPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — User Management',
  description:
    'Admin user management: search users, filter by status, inspect accounts, disable or re-enable access, and review the audit trail.',
};

export default function UserManagement() {
  return <UserManagementPreview />;
}
