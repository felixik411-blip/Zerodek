import type { Metadata } from 'next';
import AdminDashboardPreview from '@/components/admindashboard/AdminDashboardPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Admin Dashboard',
  description:
    'Admin overview of security scanner activity: metrics, recent scans, service status and alerts.',
};

export default function AdminDashboard() {
  return <AdminDashboardPreview />;
}
