import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/shell/app-shell';
import { AppProvider } from '@/context/app-context';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Voltra',
  description:
    'Voltra membantu UMKM memahami biaya listrik dan menemukan cara pemakaian yang lebih efisien.',
  applicationName: 'Voltra',
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
  appleWebApp: { capable: true, title: 'Voltra', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a2945',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={sans.variable}>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
