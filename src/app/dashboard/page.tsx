import type { Metadata } from 'next';
import DashboardPreview from '@/components/dashboard/DashboardPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Dashboard',
  description: 'Scan files and links to stay safer online.',
};

export default function Dashboard() {
  return <DashboardPreview />;
}
