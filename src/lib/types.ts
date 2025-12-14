export interface RoomAvailability {
  id: string; // UID from IOTA object
  hotel_name: string;
  date: number; // YYYYMMDD or unix day
  room_type: string; // Deluxe, Suite, etc
  price: number; // Price in smallest IOTA unit
  capacity: number; // number of guests
  image_url: string; // IPFS / HTTPS
  owner: string; // owner address
}
