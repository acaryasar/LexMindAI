import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AlertProvider } from '@/components/ui/alert-dialog';
import { I18nProvider } from '@/i18n/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LexMind AI',
  description: 'Enterprise Development Kit for Law Firms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
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
