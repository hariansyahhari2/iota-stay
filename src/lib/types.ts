export interface RoomAvailability {
  id: string; // UID from IOTA object
  hotel_name: string;
  date: number; // YYYYMMDD or unix day
  room_type: string; // Deluxe, Suite, etc
  price: number; // Price in smallest IOTA unit
  image_url: string; // IPFS / HTTPS
  image_hash: string; // SHA-256 hash as a hex string
  owner: string; // owner address
}
