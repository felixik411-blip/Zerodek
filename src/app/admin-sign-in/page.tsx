import type { Metadata } from 'next';
import AdminSignInPreview from '@/components/adminsignin/AdminSignInPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Admin Sign In',
  description:
    'Admin Portal sign-in for Security Scanner: manage security, monitor activity and review quarantined threats.',
};

export default function AdminSignIn() {
  return <AdminSignInPreview />;
}
