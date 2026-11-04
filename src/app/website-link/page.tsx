import type { Metadata } from 'next';
import WebsiteLinkPreview from '@/components/websitelink/WebsiteLinkPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Check a website link',
  description:
    'Paste a website link to check for known signs of danger. This cannot guarantee a website is safe.',
};

export default function WebsiteLink() {
  return <WebsiteLinkPreview />;
}
