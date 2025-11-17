import type { Metadata } from 'next';
import './globals.css';
import { MobileLayout } from '@/components/layout/mobile-layout';

export const metadata: Metadata = {
  title: 'LLM Native SFA CRM App',
  description: 'A modern SFA/CRM application powered by LLM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
