'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { RoomAvailability } from './types';
import { OWNER_ADDRESS, VISITOR_ADDRESS } from './constants';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Initial dummy data for NFTs
const initialNfts: RoomAvailability[] = [
  {
    id: 'nft-1',
    hotel_name: 'The Grand Iotan',
    date: 20240815,
    room_type: 'Deluxe',
    price: 150000000,
    capacity: 2,
    image_url: 'https://picsum.photos/seed/deluxe1/600/400',
    image_hash: 'hash1',
    owner: OWNER_ADDRESS,
  },
  {
    id: 'nft-2',
    hotel_name: 'The Grand Iotan',
    date: 20240816,
    room_type: 'Suite',
    price: 300000000,
    capacity: 4,
    image_url: 'https://picsum.photos/seed/suite1/600/400',
    image_hash: 'hash2',
    owner: OWNER_ADDRESS,
  },
  {
    id: 'nft-3',
    hotel_name: 'Seaside Shimmers',
    date: 20240901,
    room_type: 'Standard',
    price: 100000000,
    capacity: 2,
    image_url: 'https://picsum.photos/seed/standard1/600/400',
    image_hash: 'hash3',
    owner: OWNER_ADDRESS,
  },
  {
    id: 'nft-4',
    hotel_name: 'Seaside Shimmers',
    date: 20240901,
    room_type: 'Family',
    price: 220000000,
    capacity: 4,
    image_url: 'https://picsum.photos/seed/family1/600/400',
    image_hash: 'hash4',
    owner: OWNER_ADDRESS,
  },
];

type IotaContextType = {
  wallet: string | null;
  role: 'owner' | 'visitor' | null;
  nfts: RoomAvailability[];
  connect: (role: 'owner' | 'visitor') => void;
  disconnect: () => void;
  mintRoom: (room: Omit<RoomAvailability, 'id' | 'owner'>) => void;
  bookRoom: (nftId: string) => void;
  updateImage: (nftId: string, newImageUrl: string, newImageHash: string) => void;
};

const IotaContext = createContext<IotaContextType | undefined>(undefined);

export function IotaProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<string | null>(null);
  const [role, setRole] = useState<'owner' | 'visitor' | null>(null);
  const [nfts, setNfts] = useState<RoomAvailability[]>(initialNfts);

  const connect = useCallback((userRole: 'owner' | 'visitor') => {
    const address = userRole === 'owner' ? OWNER_ADDRESS : VISITOR_ADDRESS;
    setWallet(address);
    setRole(userRole);
    toast({
      title: 'Wallet Connected',
      description: `You are now connected as a ${userRole}.`,
    });
  }, [toast]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setRole(null);
    toast({ title: 'Wallet Disconnected' });
  }, [toast]);

  const mintRoom = useCallback(
    (room: Omit<RoomAvailability, 'id' | 'owner'>) => {
      if (role !== 'owner' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only owners can mint rooms.' });
        return;
      }
      const newNft: RoomAvailability = {
        ...room,
        id: `nft-${Date.now()}`,
        owner: wallet,
      };
      setNfts((prev) => [newNft, ...prev]);
      toast({
        title: 'NFT Minted!',
        description: `Room ${room.room_type} for date ${room.date} is now available.`,
      });
    },
    [role, wallet, toast]
  );

  const bookRoom = useCallback(
    (nftId: string) => {
      if (role !== 'visitor' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only visitors can book rooms.' });
        return;
      }

      const nftToBook = nfts.find(nft => nft.id === nftId);
      if (!nftToBook) {
        toast({ variant: 'destructive', title: 'Error', description: 'Room not found.' });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayNum = parseInt(format(today, 'yyyyMMdd'));

      if (nftToBook.date < todayNum) {
        toast({ variant: 'destructive', title: 'Booking Failed', description: 'This room is for a past date and can no longer be booked.' });
        // Optionally, refresh the list to remove the stale NFT
        setNfts(prev => prev.filter(nft => nft.id !== nftId));
        return;
      }
      
      setNfts((prev) =>
        prev.map((nft) => {
          if (nft.id === nftId) {
            toast({
              title: 'Booking Successful!',
              description: `You have booked a ${nft.room_type} room at ${nft.hotel_name}.`,
            });
            return { ...nft, owner: wallet };
          }
          return nft;
        })
      );
    },
    [role, wallet, toast, nfts]
  );

  const updateImage = useCallback(
    (nftId: string, newImageUrl: string, newImageHash: string) => {
      if (role !== 'owner' || !wallet) {
        toast({ variant: 'destructive', title: 'Error', description: 'Only owners can update images.' });
        return;
      }
      setNfts((prev) =>
        prev.map((nft) => {
          if (nft.id === nftId && nft.owner === wallet) {
            toast({ title: 'Image Updated', description: 'The promotional image has been changed.' });
            return { ...nft, image_url: newImageUrl, image_hash: newImageHash };
          }
          return nft;
        })
      );
    },
    [role, wallet, toast]
  );

  const value = useMemo(
    () => ({ wallet, role, nfts, connect, disconnect, mintRoom, bookRoom, updateImage }),
    [wallet, role, nfts, connect, disconnect, mintRoom, bookRoom, updateImage]
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
