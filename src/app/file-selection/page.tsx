import type { Metadata } from 'next';
import FileSelectionPreview from '@/components/fileselection/FileSelectionPreview';

export const metadata: Metadata = {
  title: 'Security Scanner — File Selection',
  description: 'Choose a file from your device to scan. Files stay on your phone by default.',
};

export default function FileSelection() {
  return <FileSelectionPreview />;
}
