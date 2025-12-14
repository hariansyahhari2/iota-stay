'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { ConnectModal, useConnectWallet } from '@iota/dapp-kit';
import { useToast } from '@/hooks/use-toast';

export default function ConnectWallet() {
  const { error, connect } = useConnectWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message,
      });
    }
  }, [error, toast]);

  return (
    <div className="flex-1 flex items-center justify-center bg-grid-slate-50 dark:bg-grid-slate-900 p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent h-1/2"></div>
      <Card className="w-full max-w-md shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Connect Your Wallet</CardTitle>
          <CardDescription>To get started with IOTA Stay, please connect your IOTA wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-base bg-primary hover:bg-primary/90"
            onClick={() => connect()}
          >
            Connect Wallet
          </Button>
          <ConnectModal />
        </CardContent>
      </Card>
    </div>
  );
}
