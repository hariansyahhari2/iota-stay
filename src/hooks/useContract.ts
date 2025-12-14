'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
  useIotaClientQuery,
} from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import type { IotaObjectData, IOutputResponse } from '@iota/iota-sdk/client';
import { TESTNET_PACKAGE_ID } from '@/lib/config';
import type { RoomAvailability } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

const PACKAGE_ID = TESTNET_PACKAGE_ID;
export const CONTRACT_MODULE = 'booking';
export const CONTRACT_METHODS = {
  MINT_ROOM: 'mint_room',
  BOOK_ROOM: 'book_room',
} as const;

// ============================================================================
// MOCK DATA
// ============================================================================

const generateFutureDate = (daysInFuture: number) => {
    const futureDate = addDays(new Date(), daysInFuture);
    return parseInt(format(futureDate, 'yyyyMMdd'));
}

const getMockRooms = (ownerAddress: string): RoomAvailability[] => [
    {
        id: '0xmock1',
        hotel_name: 'IOTA Grand',
        date: generateFutureDate(3),
        room_type: 'Deluxe Suite',
        price: 250000000,
        capacity: 2,
        image_url: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzY1NTIxMTEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        owner: ownerAddress,
    },
    {
        id: '0xmock2',
        hotel_name: 'Tangle Tower',
        date: generateFutureDate(5),
        room_type: 'Standard King',
        price: 120000000,
        capacity: 2,
        image_url: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxtb2Rlcm4lMjByb29tfGVufDB8fHx8MTc2NTY0NDA4NXww&ixlib=rb-4.1.0&q=80&w=1080',
        owner: ownerAddress,
    },
    {
        id: '0xmock3',
        hotel_name: 'Shimmer Resort',
        date: generateFutureDate(7),
        room_type: 'Ocean View Penthouse',
        price: 480000000,
        capacity: 4,
        image_url: 'https://images.unsplash.com/photo-1568115286680-d203e08a8be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2V8ZW58MHx8fHwxNzY1NjQxOTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        owner: ownerAddress,
    },
    {
        id: '0xmock4',
        hotel_name: 'IOTA Grand',
        date: generateFutureDate(10),
        room_type: 'Family Room',
        price: 180000000,
        capacity: 4,
        image_url: 'https://images.unsplash.com/photo-1636220245011-e049b34081cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmYW1pbHklMjBob3RlbHxlbnwwfHx8fDE3NjU2NDQwODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        owner: ownerAddress,
    }
];

// ============================================================================
// DATA EXTRACTION
// ============================================================================

function getObjectFields(data: IotaObjectData): Omit<RoomAvailability, 'id'> | null {
  if (data.content?.dataType !== 'moveObject') {
    console.log('Data is not a moveObject:', data.content?.dataType);
    return null;
  }

  const fields = data.content.fields as any;
  if (!fields) {
    console.log('No fields found in object data');
    return null;
  }

  const owner =
    data.owner && typeof data.owner === 'object' && 'AddressOwner' in data.owner
      ? String(data.owner.AddressOwner)
      : '';
  

  return {
    hotel_name: fields.hotel_name,
    date: Number(fields.date),
    room_type: fields.room_type,
    price: Number(fields.price),
    capacity: Number(fields.capacity),
    image_url: fields.image_url,
    owner,
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface ContractState {
  isLoading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  hash: string | undefined;
  error: Error | null;
}

export interface ContractActions {
  mintRoom: (
    hotel_name: string,
    date: number,
    room_type: string,
    price: number,
    capacity: number,
    image_url: string
  ) => Promise<void>;
  bookRoom: (room: RoomAvailability) => Promise<void>;
  clearObject: () => void;
}

export const useContract = () => {
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address;
  const iotaClient = useIotaClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [transactionIsLoading, setTransactionIsLoading] = useState(false);
  const [hash, setHash] = useState<string | undefined>();
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const { toast } = useToast();
  const [newlyMintedId, setNewlyMintedId] = useState<string | null>(null);
  const [localMockNfts, setLocalMockNfts] = useState<RoomAvailability[]>([]);

  const {
    data: objectIdResponse,
    isPending: isFetchingObjectIds,
    error: queryError,
    refetch,
  } = useIotaClientQuery('getNftOutputs', [{ address: address as string }], {
    enabled: !!address,
  });

  const objectIds = useMemo(() => {
    return objectIdResponse?.items || [];
  }, [objectIdResponse]);

  const { data: objects, isPending: isFetchingObjects } = useIotaClientQuery('getOutputs', [objectIds], {
    enabled: objectIds.length > 0,
  });

  const objectExists = useMemo(() => !!objects && objects.outputs.length > 0, [objects]);

  const contractData: RoomAvailability[] | null = useMemo(() => {
    if (!objectExists && !isFetchingObjects && !isFetchingObjectIds) {
      return [...getMockRooms(address || ''), ...localMockNfts];
    }
    
    if (!objects?.outputs) {
      return [...localMockNfts];
    }

    const realNfts = objects.outputs
      .map((output: IOutputResponse) => {
        const iotaObjectData = output.output as unknown as IotaObjectData;
        const fields = getObjectFields(iotaObjectData);
        if (!fields) return null;
        return {
          id: output.metadata.outputId,
          ...fields,
        } as RoomAvailability;
      })
      .filter(Boolean) as RoomAvailability[];
      
      return [...realNfts, ...localMockNfts];
  }, [objects, objectExists, localMockNfts, address, isFetchingObjects, isFetchingObjectIds]);

  const mintRoom = async (
    hotel_name: string,
    date: number,
    room_type: string,
    price: number,
    capacity: number,
    image_url: string
  ) => {
    try {
      setTransactionIsLoading(true);
      setTransactionError(null);
      setHash(undefined);
      
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.MINT_ROOM}`,
        arguments: [
          tx.pure.string(hotel_name),
          tx.pure.u64(date),
          tx.pure.string(room_type),
          tx.pure.u64(price),
          tx.pure.u8(capacity),
          tx.pure.string(image_url),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              });
              const newObjectId = effects?.created?.[0]?.reference?.objectId;
              if (newObjectId) {
                setNewlyMintedId(newObjectId);
                refetch();
              }
            } catch (waitError) {
              console.error('Error waiting for transaction:', waitError);
              toast({ variant: 'destructive', title: 'Transaction Error', description: 'Could not confirm transaction on the network.' });
            } finally {
              setTransactionIsLoading(false);
            }
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            setTransactionError(error);
            console.error('Error:', err);
            toast({ variant: 'destructive', title: 'Minting Failed', description: error.message });
            setTransactionIsLoading(false);
          },
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setTransactionError(error);
      console.error('Error minting room:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while preparing the transaction.' });
      setTransactionIsLoading(false);
    }
  };

  const bookRoom = async (room: RoomAvailability) => {
    try {
      setTransactionIsLoading(true);
      setTransactionError(null);
      setHash(undefined);
      
      if (room.id.startsWith('0xmock')) {
          toast({ title: 'Booking Successful! (Mock)', description: `You have successfully booked the ${room.room_type} room.` });
          setLocalMockNfts(prev => prev.map(r => r.id === room.id && address ? { ...r, owner: address } : r));
          setTransactionIsLoading(false);
          return;
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.BOOK_ROOM}`,
        arguments: [tx.pure.object(room.id)],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            try {
              await iotaClient.waitForTransaction({ digest });
              toast({ title: 'Booking Successful!', description: `You have successfully booked the ${room.room_type} room.` });
              refetch();
            } catch (waitError) {
              console.error('Error waiting for transaction:', waitError);
               toast({ variant: 'destructive', title: 'Transaction Error', description: 'Could not confirm transaction on the network.' });
            }
            setTransactionIsLoading(false);
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            setTransactionError(error);
            console.error('Error:', err);
            toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
            setTransactionIsLoading(false);
          },
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setTransactionError(error);
      console.error('Error booking room:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while preparing the transaction.' });
      setTransactionIsLoading(false);
    }
  };

  const clearObject = () => {
    // This function might need rethinking in a multi-object world
    setTransactionError(null);
  };

  const clearNewlyMintedId = () => {
    setNewlyMintedId(null);
  }

  const actions: ContractActions = {
    mintRoom,
    bookRoom,
    clearObject,
  };

  const contractState: ContractState = {
    isLoading: isFetchingObjectIds,
    isPending,
    isConfirming: isPending,
    isConfirmed: !!hash && !isPending && !transactionIsLoading,
    hash,
    error: queryError || transactionError,
  };

  return {
    data: contractData,
    actions,
    state: contractState,
    objectExists,
    refetch,
    newlyMintedId,
    clearNewlyMintedId,
  };
};
