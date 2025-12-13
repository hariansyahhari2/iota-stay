'use client';

import { IotaProvider } from '@/lib/iota';
import { IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { networkConfig } from '@/lib/config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <IotaClientProvider networkConfig={networkConfig} defaultNetwork="testnet">
      <WalletProvider>
        <IotaProvider>{children}</IotaProvider>
      </WalletProvider>
    </IotaClientProvider>
  );
}
