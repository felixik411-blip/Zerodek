import type { Metadata } from 'next';
import HelpAboutPreview from '@/components/helpabout/HelpAboutPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Help & About',
  description:
    'Searchable help topics, answers, and app information for Security Scanner.',
};

export default function HelpAbout() {
  return <HelpAboutPreview />;
}
