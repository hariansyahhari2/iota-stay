import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { IotaProvider } from '@/lib/iota';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { WalletProvider } from '@iota/dapp-kit';
import { networkConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'IOTA Stay',
  description: 'A decentralized hotel booking application on IOTA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <WalletProvider networkConfig={networkConfig} defaultNetwork="testnet">
          <IotaProvider>
            <Header />
            <div className="flex-1 flex flex-col">{children}</div>
            <Toaster />
          </IotaProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
