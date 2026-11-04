import type { Metadata } from 'next';
import LinkResultPreview from '@/components/linkscanresult/LinkResultPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — Link scan result',
  description:
    "Result of a website link check: what we found, what we checked and what you should do next.",
};

export default function LinkScanResult() {
  return <LinkResultPreview />;
}
