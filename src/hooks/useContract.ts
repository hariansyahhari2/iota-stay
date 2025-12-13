"use client"

import { useState, useEffect } from "react"
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
  useIotaClientQuery,
} from "@iota/dapp-kit"
import { Transaction } from "@iota/iota-sdk/transactions"
import type { IotaObjectData } from "@iota/iota-sdk/client"
import { TESTNET_PACKAGE_ID } from "@/lib/config"
import type { RoomAvailability } from "@/lib/types"

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

const PACKAGE_ID = TESTNET_PACKAGE_ID
export const CONTRACT_MODULE = "booking"
export const CONTRACT_METHODS = {
  MINT_ROOM: "mint_room",
  BOOK_ROOM: "book_room",
} as const

// ============================================================================
// DATA EXTRACTION
// ============================================================================

function getObjectFields(data: IotaObjectData): Omit<RoomAvailability, 'id'> | null {
  if (data.content?.dataType !== "moveObject") {
    console.log("Data is not a moveObject:", data.content?.dataType)
    return null
  }

  const fields = data.content.fields as any
  if (!fields) {
    console.log("No fields found in object data")
    return null
  }

  const owner = data.owner && typeof data.owner === "object" && "AddressOwner" in data.owner
    ? String(data.owner.AddressOwner)
    : ""

  return {
    hotel_name: fields.hotel_name,
    date: Number(fields.date),
    room_type: fields.room_type,
    price: Number(fields.price),
    capacity: Number(fields.capacity),
    image_url: fields.image_url,
    image_hash: fields.image_hash,
    owner,
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: string | undefined
  error: Error | null
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
  ) => Promise<void>
  bookRoom: (room: RoomAvailability) => Promise<void>
  clearObject: () => void
}

export const useContract = () => {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const iotaClient = useIotaClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [objectId, setObjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [transactionError, setTransactionError] = useState<Error | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1)
      if (hash) setObjectId(hash)
    }
  }, [])

  const { data, isPending: isFetching, error: queryError, refetch } = useIotaClientQuery(
    "getObject",
    {
      id: objectId!,
      options: { showContent: true, showOwner: true },
    },
    {
      enabled: !!objectId,
    }
  )

  const fields = data?.data ? getObjectFields(data.data) : null
  const isOwner = fields?.owner.toLowerCase() === address?.toLowerCase()

  const objectExists = !!data?.data
  const hasValidData = !!fields

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
      setIsLoading(true)
      setTransactionError(null)
      setHash(undefined)
      const tx = new Transaction()
      tx.moveCall({
        arguments: [
          tx.pure.string(hotel_name),
          tx.pure.u64(date),
          tx.pure.string(room_type),
          tx.pure.u64(price),
          tx.pure.u8(capacity),
          tx.pure.string(image_url),
          tx.pure.string(image_hash), // Assuming image_hash is a string for simplicity
        ],
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.MINT_ROOM}`,
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              })
              const newObjectId = effects?.created?.[0]?.reference?.objectId
              if (newObjectId) {
                setObjectId(newObjectId)
                if (typeof window !== "undefined") {
                  window.location.hash = newObjectId
                }
              }
              setIsLoading(false)
            } catch (waitError) {
              console.error("Error waiting for transaction:", waitError)
              setIsLoading(false)
            }
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("Error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error minting room:", err)
      setIsLoading(false)
    }
  }

  const bookRoom = async (room: RoomAvailability) => {
    try {
      setIsLoading(true)
      setTransactionError(null)
      setHash(undefined)
      const tx = new Transaction()
      tx.moveCall({
        arguments: [
            tx.pure.object(room.id)
        ],
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.BOOK_ROOM}`,
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
             try {
                await iotaClient.waitForTransaction({ digest });
                refetch();
            } catch (waitError) {
                console.error("Error waiting for transaction:", waitError);
            }
            setIsLoading(false);
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("Error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error booking room:", err)
      setIsLoading(false)
    }
  }


  const contractData: RoomAvailability | null = fields && objectId
    ? {
      id: objectId,
      ...fields,
    }
    : null

  const clearObject = () => {
    setObjectId(null)
    setTransactionError(null)
    if (typeof window !== "undefined") {
      window.location.hash = ""
    }
  }

  const actions: ContractActions = {
    mintRoom,
    bookRoom,
    clearObject,
  }

  const contractState: ContractState = {
    isLoading: (isLoading && !objectId) || isPending || isFetching,
    isPending,
    isConfirming: false, // This needs more logic to implement properly
    isConfirmed: !!hash && !isLoading && !isPending,
    hash,
    error: queryError || transactionError,
  }

  return {
    data: contractData,
    actions,
    state: contractState,
    objectId,
    isOwner,
    objectExists,
    hasValidData,
    refetch
  }
}
