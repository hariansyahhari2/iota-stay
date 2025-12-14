'use client';

import { IotaProvider } from '@/lib/iota';
import { IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { networkConfig } from '@/lib/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <IotaProvider>{children}</IotaProvider>
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}
