import type { Metadata } from 'next';
import SettingsPreview from '@/components/settings/SettingsPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Settings',
  description: 'Privacy, notifications, quarantine retention and app information.',
};

export default function Settings() {
  return <SettingsPreview />;
}
