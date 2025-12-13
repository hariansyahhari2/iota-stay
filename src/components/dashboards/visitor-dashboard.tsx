'use client';

import { useState, useMemo, useEffect } from 'react';
import { useIota } from '@/lib/iota';
import RoomCard from '@/components/room-card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { useContract } from '@/hooks/useContract';

export default function VisitorDashboard() {
  const { nfts: contextNfts, wallet, refetchNfts } = useIota();
  const { data: contractNfts, state } = useContract();

  useEffect(() => {
    refetchNfts();
  }, [refetchNfts]);
  
  const nfts = contractNfts || contextNfts;

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [roomType, setRoomType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number]>([500000000]);

  // Dummy functions as they are not used. RoomCard expects them.
  const handleUpdateImage = () => {};

  const availableNfts = useMemo(() => {
    if (!nfts) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNum = parseInt(format(today, 'yyyyMMdd'));
    return nfts.filter(nft => nft.owner?.toLowerCase() !== wallet?.toLowerCase() && nft.date >= todayNum);
  }, [nfts, wallet]);
  
  const myBookings = useMemo(() => {
    if (!nfts || !wallet) return [];
    return nfts.filter(nft => nft.owner?.toLowerCase() === wallet.toLowerCase());
  }, [nfts, wallet]);

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNum = parseInt(format(today, 'yyyyMMdd'));
    
    const upcoming = myBookings.filter(booking => booking.date >= todayNum);
    const past = myBookings.filter(booking => booking.date < todayNum);

    return { upcomingBookings: upcoming, pastBookings: past };
  }, [myBookings]);

  const roomTypes = useMemo(() => ['all', ...Array.from(new Set(availableNfts.map(nft => nft.room_type)))], [availableNfts]);

  const filteredNfts = useMemo(() => {
    return availableNfts.filter(nft => {
      const dateFilter = date?.from
        ? nft.date >= parseInt(format(date.from, 'yyyyMMdd'), 10) &&
          (date.to ? nft.date <= parseInt(format(date.to, 'yyyyMMdd'), 10) : true)
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
        <p className="text-muted-foreground text-lg">Browse available rooms and manage your bookings on the IOTA network.</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="available">Available Rooms</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-lg bg-card">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className="w-full md:w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() -1))}
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
          {state.isLoading ? <p>Loading rooms...</p> : filteredNfts.length > 0 ? (
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
        </TabsContent>
        <TabsContent value="bookings" className="mt-6 space-y-8">
           <div>
            <h2 className="text-2xl font-headline font-bold mb-4">Upcoming Bookings</h2>
            {state.isLoading ? <p>Loading bookings...</p> : upcomingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {upcomingBookings.map(room => (
                  <RoomCard key={room.id} room={room} onUpdateImage={handleUpdateImage} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
                <h3 className="text-xl font-semibold">No Upcoming Bookings Found</h3>
                <p className="text-muted-foreground mt-2">You haven't booked any rooms for the future.</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold mb-4">Past Bookings</h2>
             {state.isLoading ? <p>Loading bookings...</p> : pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pastBookings.map(room => (
                  <RoomCard key={room.id} room={room} onUpdateImage={handleUpdateImage} />
                ))}
              </div>
            ) : (
               <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
                <h3 className="text-xl font-semibold">No Past Bookings Found</h3>
                <p className="text-muted-foreground mt-2">You don't have any past bookings.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
