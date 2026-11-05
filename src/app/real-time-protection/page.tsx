import type { Metadata } from 'next';
import RealTimeProtectionPreview from '@/components/realtimeprotection/RealTimeProtectionPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Real-Time Download / Link Protection',
  description:
    'Real-time protection control room: master switch and pause chips, four protection layers (downloads, links, email attachments, removable drives), live scan feed with simulate button, and today\'s protection stats.',
};

export default function RealTimeProtection() {
  return <RealTimeProtectionPreview />;
}
