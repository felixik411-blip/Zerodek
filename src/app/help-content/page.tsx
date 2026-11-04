import type { Metadata } from 'next';
import HelpContentPreview from '@/components/helpcontent/HelpContentPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Help Content Management',
  description:
    'Admin help content management: switch content tabs, search articles, edit title and body in the rich-text panel, preview and publish changes, and manage each article’s status from the row actions menu.',
};

export default function HelpContent() {
  return <HelpContentPreview />;
}
