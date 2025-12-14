# IOTA Stay - Decentralized Hotel Booking DApp

IOTA Stay is a decentralized application (DApp) that demonstrates a hotel room booking system built on the IOTA network. It leverages IOTA's Layer 2 solution with smart contracts written in Move to manage room availability as Non-Fungible Tokens (NFTs).

## Key Features

- **Decentralized Identity:** Connect with your IOTA wallet to interact with the application.
- **Dual-Role System:** Participate as a Hotel Owner or a Visitor.
- **NFT-Based Availability:** Each available room for a specific night is represented as a unique NFT on the blockchain.
- **On-Chain Operations:** Minting new room NFTs and booking rooms are handled through smart contract interactions.
- **Real-Time UI:** The interface provides instant feedback for on-chain actions.

## User Roles

### 1. Hotel Owner
As an owner, you can manage your hotel's room inventory.
- **Mint Room NFTs:** Create new room availability NFTs for specific dates, setting details like hotel name, room type, price, and capacity.
- **Manage Listings:** View all the room NFTs you currently own.

### 2. Visitor
As a visitor, you can browse and book available hotel rooms.
- **Browse Listings:** View all available rooms that are not owned by you.
- **Filter and Search:** Find the perfect room by filtering based on date range, room type, and price.
- **Book a Room:** Secure your stay by executing a transaction to book an available room NFT, which transfers its ownership to you.
- **View Bookings:** See your upcoming and past bookings.

## Smart Contract

The application is powered by a Move smart contract deployed on the IOTA testnet.

### Contract ID (Package ID)
The current Testnet Package ID for the smart contract is:
**`0x0bd789e4392dd4e8829b6cb317356e695a4954e57bdc78c834e6d5b28722a695`**

### Contract on IOTASCAN
You can view the deployed package on the IOTASCAN Testnet Explorer:

[https://iotascan.com/testnet/object/0x0bd789e4392dd4e8829b6cb317356e695a4954e57bdc78c834e6d5b28722a695/contracts](https://iotascan.com/testnet/object/0x0bd789e4392dd4e8829b6cb317356e695a4954e57bdc78c834e6d5b28722a695/contracts)

### Core Functions

- **`mint_room`**:
  - **Purpose:** Allows a hotel owner to create (mint) a new `RoomAvailability` NFT.
  - **Arguments:** `hotel_name`, `date`, `room_type`, `price`, `capacity`, `image_url`.
  - **Action:** Creates a new NFT with the specified details and transfers it to the owner's wallet.

- **`book_room`**:
  - **Purpose:** Allows a visitor to book a room.
  - **Arguments:** The `objectId` of the `RoomAvailability` NFT to be booked.
  - **Action:** Transfers ownership of the specified NFT from the hotel owner to the visitor.

## Getting Started

1.  Connect your IOTA wallet.
2.  Select your role (Owner or Visitor).
3.  - If you are an owner, navigate to the "Mint Room" tab to create your first listing.
    - If you are a visitor, browse the available rooms on the main dashboard.
