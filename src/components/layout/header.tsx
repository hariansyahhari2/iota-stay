'use client';
import { useIota } from '@/lib/iota';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Wallet } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export default function Header() {
  const { wallet, disconnect, role } = useIota();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Logo className="h-6 w-auto" />
          </a>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {wallet ? (
            <>
              <Badge variant="outline" className="hidden sm:flex items-center space-x-2 text-sm py-1.5 px-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">
                  {wallet.substring(0, 10)}...{wallet.substring(wallet.length - 4)}
                </span>
              </Badge>
              <Badge variant={role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                {role}
              </Badge>
              <Button variant="ghost" size="icon" onClick={disconnect} aria-label="Disconnect wallet">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
             <Badge variant="outline" className="text-sm py-1.5 px-3">
                Not Connected
              </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
