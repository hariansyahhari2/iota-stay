'use client';

import { useState, useMemo } from 'react';
import { useIota } from '@/lib/iota';
import RoomCard from '@/components/room-card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarIcon, SlidersHorizontal } from 'lucide-react';
import { format, parse } from 'date-fns';

export default function VisitorDashboard() {
  const { nfts, wallet } = useIota();
  const [date, setDate] = useState<Date | undefined>();
  const [roomType, setRoomType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number]>([500000000]);

  // Dummy functions as they are not used. RoomCard expects them.
  const handleUpdateImage = () => {};

  const availableNfts = useMemo(() => {
    return nfts.filter(nft => nft.owner !== wallet);
  }, [nfts, wallet]);

  const roomTypes = useMemo(() => ['all', ...Array.from(new Set(availableNfts.map(nft => nft.room_type)))], [availableNfts]);

  const filteredNfts = useMemo(() => {
    return availableNfts.filter(nft => {
      const dateFilter = date
        ? nft.date === parseInt(format(date, 'yyyyMMdd'), 10)
        : true;
      const roomTypeFilter = roomType !== 'all' ? nft.room_type === roomType : true;
      const priceFilter = nft.price <= priceRange[0];
      return dateFilter && roomTypeFilter && priceFilter;
    });
  }, [availableNfts, date, roomType, priceRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-muted-foreground text-lg">Browse available rooms and book your next trip on the IOTA network.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-lg bg-card">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className="w-full md:w-auto justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Room type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium">Max Price: ${Math.round(priceRange[0] / 1000000)}</label>
           <Slider
            value={priceRange}
            onValueChange={(value: number[]) => setPriceRange([value[0]])}
            max={500000000}
            step={10000000}
            className="mt-2"
          />
        </div>
      </div>

      {filteredNfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map(room => (
            <RoomCard key={room.id} room={room} onUpdateImage={handleUpdateImage} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Rooms Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters to find available rooms.</p>
        </div>
      )}
    </div>
  );
}
