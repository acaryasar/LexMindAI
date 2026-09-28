import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AlertProvider } from '@/components/ui/alert-dialog';
import { I18nProvider } from '@/i18n/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'iyiAvukat - Enterprise Development Kit for Law Firms',
    template: '%s | iyiAvukat'
  },
  description: 'Enterprise Development Kit for Law Firms - Comprehensive SaaS platform for case management, client management, document management, AI-powered document generation, legal research, finance management, and team management.',
  keywords: ['law firm', 'legal management', 'case management', 'document management', 'AI legal assistant', 'legal research', 'finance management'],
  authors: [{ name: 'iyiAvukat Team' }],
  creator: 'iyiAvukat',
  publisher: 'iyiAvukat',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
