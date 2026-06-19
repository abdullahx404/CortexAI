import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'CortexAI — Business Memory Dashboard',
  description:
    'Turn scattered SME files into searchable records, payment alerts, supplier comparisons, and daily follow-ups — all in one dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
