'use client';
import { useState, useMemo, useEffect } from 'react';
import { useIota } from '@/lib/iota';
import RoomCard from '@/components/room-card';
import MintRoomForm from '@/components/mint-room-form';
import UpdateImageDialog from '@/components/update-image-dialog';
import type { RoomAvailability } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContract } from '@/hooks/useContract';

export default function OwnerDashboard() {
  const { wallet, refetchNfts } = useIota();
  const { data: contractNfts, state } = useContract();
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailability | null>(null);

  useEffect(() => {
    refetchNfts();
  }, [refetchNfts]);
  
  const nfts = contractNfts;

  const myNfts = useMemo(() => {
    if (!wallet || !nfts) return [];
    return nfts.filter(nft => nft.owner?.toLowerCase() === wallet.toLowerCase());
  }, [nfts, wallet]);

  const handleUpdateImage = (room: RoomAvailability) => {
    setSelectedRoom(room);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Owner Dashboard</h1>
        <p className="text-muted-foreground text-lg">Manage your room availability NFTs and mint new ones.</p>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="mint">Mint Room</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-6">
          {state.isLoading ? <p>Loading listings...</p> : myNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myNfts.map(room => (
                <RoomCard key={room.id} room={room} onUpdateImage={handleUpdateImage} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
              <h3 className="text-xl font-semibold">No Listings Found</h3>
              <p className="text-muted-foreground mt-2">You haven't minted any room availability NFTs yet.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="mint" className="mt-6">
          <MintRoomForm />
        </TabsContent>
      </Tabs>
      
      {selectedRoom && (
        <UpdateImageDialog
          room={selectedRoom}
          isOpen={!!selectedRoom}
          setIsOpen={(open) => {
            if (!open) setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}
