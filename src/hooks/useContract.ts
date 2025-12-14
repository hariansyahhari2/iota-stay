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
  
  const imageHashBytes = fields.image_hash;
  const imageHash = imageHashBytes ? Buffer.from(imageHashBytes).toString('hex') : '';


  return {
    hotel_name: fields.hotel_name,
    date: Number(fields.date),
    room_type: fields.room_type,
    price: Number(fields.price),
    capacity: Number(fields.capacity),
    image_url: fields.image_url,
    image_hash: imageHash,
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
    image_url: string,
    image_hash: string
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

  const contractData: RoomAvailability[] | null = useMemo(() => {
    if (!objects?.outputs) return [];

    return objects.outputs
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
  }, [objects]);

  const objectExists = useMemo(() => contractData && contractData.length > 0, [contractData]);

  const mintRoom = async (
    hotel_name: string,
    date: number,
    room_type: string,
    price: number,
    capacity: number,
    image_url: string,
    image_hash: string
  ) => {
    try {
      setTransactionIsLoading(true);
      setTransactionError(null);
      setHash(undefined);
      const tx = new Transaction();

      // Convert hex string to a byte array (number[])
      const imageHashBytes = Array.from(Buffer.from(image_hash, 'hex'));

      tx.moveCall({
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.MINT_ROOM}`,
        arguments: [
          tx.pure.string(hotel_name),
          tx.pure.u64(date),
          tx.pure.string(room_type),
          tx.pure.u64(price),
          tx.pure.u8(capacity),
          tx.pure.string(image_url),
          tx.pure.vector(imageHashBytes),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            try {
              await iotaClient.awaitTransaction(digest);
              refetch();
            } catch (waitError) {
              console.error('Error waiting for transaction:', waitError);
            } finally {
              setTransactionIsLoading(false);
            }
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            setTransactionError(error);
            console.error('Error:', err);
            setTransactionIsLoading(false);
          },
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setTransactionError(error);
      console.error('Error minting room:', err);
      setTransactionIsLoading(false);
    }
  };

  const bookRoom = async (room: RoomAvailability) => {
    try {
      setTransactionIsLoading(true);
      setTransactionError(null);
      setHash(undefined);
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
              await iotaClient.awaitTransaction(digest);
              refetch();
            } catch (waitError) {
              console.error('Error waiting for transaction:', waitError);
            }
            setTransactionIsLoading(false);
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            setTransactionError(error);
            console.error('Error:', err);
            setTransactionIsLoading(false);
          },
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setTransactionError(error);
      console.error('Error booking room:', err);
      setTransactionIsLoading(false);
    }
  };

  const clearObject = () => {
    // This function might need rethinking in a multi-object world
    setTransactionError(null);
  };

  const actions: ContractActions = {
    mintRoom,
    bookRoom,
    clearObject,
  };

  const contractState: ContractState = {
    isLoading: transactionIsLoading || isPending || isFetchingObjectIds || isFetchingObjects,
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
  };
};
