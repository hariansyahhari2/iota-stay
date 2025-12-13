'use client';

import { useIota } from '@/lib/iota';
import ConnectWallet from '@/components/connect-wallet';
import OwnerDashboard from '@/components/dashboards/owner-dashboard';
import VisitorDashboard from '@/components/dashboards/visitor-dashboard';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import RoleSelector from '@/components/role-selector';

export default function Home() {
  const { wallet, role, isConnected, setRole } = useIota();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (!role) {
    return <RoleSelector onSelectRole={setRole} />;
  }

  return (
    <main className="flex-1">
      {role === 'owner' ? <OwnerDashboard /> : <VisitorDashboard />}
    </main>
  );
}
