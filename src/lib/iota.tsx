'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { RoomAvailability } from './types';
import { useToast } from '@/hooks/use-toast';
import { useContract } from '@/hooks/useContract';
import { useConnectWallet, useDisconnectWallet, useCurrentAccount } from '@iota/dapp-kit';

type IotaContextType = {
  wallet: string | null;
  role: 'owner' | 'visitor' | null;
  nfts: RoomAvailability[];
  connect: (role: 'owner' | 'visitor') => void;
  disconnect: () => void;
  mintRoom: (room: Omit<RoomAvailability, 'id' | 'owner'>) => Promise<void>;
  bookRoom: (nftId: string) => Promise<void>;
  updateImage: (nftId: string, newImageUrl: string, newImageHash: string) => void;
  refetchNfts: () => void;
  isConnected: boolean;
  setRole: (role: 'owner' | 'visitor' | null) => void;
};

const IotaContext = createContext<IotaContextType | undefined>(undefined);

export function IotaProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { actions: contractActions, data: contractNfts, refetch, objectExists } = useContract();
  const { connect: connectWallet, isConnecting, error: connectError } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const account = useCurrentAccount();
  
  const [role, setRole] = useState<'owner' | 'visitor' | null>(null);
  const [nfts, setNfts] = useState<RoomAvailability[]>([]);

  const isConnected = useMemo(() => !!account, [account]);
  const wallet = useMemo(() => account?.address || null, [account]);

  useEffect(() => {
    if (connectError) {
      toast({ variant: 'destructive', title: 'Connection Failed', description: connectError.message });
    }
  }, [connectError, toast]);
  
  useEffect(() => {
    if (isConnected && role) {
      toast({
        title: 'Wallet Connected',
        description: `You are now connected as a ${role}.`,
      });
    }
  }, [isConnected, role, toast]);

  useEffect(() => {
    if (contractNfts && Array.isArray(contractNfts)) {
      setNfts(contractNfts);
    }
  }, [contractNfts]);

  // This connect function is now a placeholder, as ConnectModal handles the wallet connection.
  // We keep the structure in case we want to add pre-connection logic later.
  const connect = useCallback(async (userRole: 'owner' | 'visitor') => {
    if (!isConnected) {
      await connectWallet();
    }
    setRole(userRole);
  }, [connectWallet, isConnected]);

  const disconnect = useCallback(async () => {
    disconnectWallet();
    setRole(null);
    toast({ title: 'Wallet Disconnected' });
  }, [disconnectWallet, toast]);

  const mintRoom = useCallback(
    async (room: Omit<RoomAvailability, 'id' | 'owner'>) => {
      if (role !== 'owner' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only owners can mint rooms.' });
        return;
      }
      await contractActions.mintRoom(
        room.hotel_name,
        room.date,
        room.room_type,
        room.price,
        room.capacity,
        room.image_url,
        room.image_hash
      );
      toast({
        title: 'Minting in Progress',
        description: 'Your room NFT is being created on the network.',
      });
    },
    [role, wallet, contractActions, toast]
  );

  const bookRoom = useCallback(
    async (nftId: string) => {
      if (role !== 'visitor' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only visitors can book rooms.' });
        return;
      }
      const nftToBook = nfts.find(nft => nft.id === nftId);
      if (!nftToBook) {
        toast({ variant: 'destructive', title: 'Error', description: 'Room not found.' });
        return;
      }
       await contractActions.bookRoom(nftToBook);

       toast({
        title: 'Booking in Progress',
        description: `Your booking for a ${nftToBook.room_type} room is being processed.`,
      });

    },
    [role, wallet, toast, nfts, contractActions]
  );

  const updateImage = useCallback(
    (nftId: string, newImageUrl: string, newImageHash: string) => {
      if (role !== 'owner' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only owners can update images.' });
        return;
      }
      console.log('Update image called, but contract method is not implemented yet.');
      toast({ title: 'Image Updated (Locally)', description: 'This is a local update for now.' });
      setNfts((prev) =>
        prev.map((nft) => {
          if (nft.id === nftId && nft.owner === wallet) {
            return { ...nft, image_url: newImageUrl, image_hash: newImageHash };
          }
          return nft;
        })
      );
    },
    [role, wallet, toast]
  );
  
  const refetchNfts = useCallback(() => {
    if (objectExists) {
        refetch();
    }
  }, [refetch, objectExists]);

  const value = useMemo(
    () => ({ wallet, role, nfts, connect, disconnect, mintRoom, bookRoom, updateImage, refetchNfts, isConnected, setRole }),
    [wallet, role, nfts, connect, disconnect, mintRoom, bookRoom, updateImage, refetchNfts, isConnected]
  );

  return <IotaContext.Provider value={value}>{children}</IotaContext.Provider>;
}

export function useIota() {
  const context = useContext(IotaContext);
  if (context === undefined) {
    throw new Error('useIota must be used within an IotaProvider');
  }
  return context;
}
