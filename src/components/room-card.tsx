'use client';
import Image from 'next/image';
import type { RoomAvailability } from '@/lib/types';
import { useIota } from '@/lib/iota';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, BedDouble, DollarSign, Edit, Image as ImageIcon, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Dispatch, SetStateAction } from 'react';

type RoomCardProps = {
  room: RoomAvailability;
  onUpdateImage: (room: RoomAvailability) => void;
};

export default function RoomCard({ room, onUpdateImage }: RoomCardProps) {
  const { wallet, role, bookRoom } = useIota();
  const isOwner = wallet === room.owner;
  const isVisitor = role === 'visitor';

  const formattedDate = new Date(
    String(room.date).slice(0, 4),
    Number(String(room.date).slice(4, 6)) - 1,
    String(room.date).slice(6, 8)
  ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Placeholder, as IOTA doesn't have a standard symbol
    maximumFractionDigits: 0,
  }).format(room.price / 1_000_000);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={room.image_url}
            alt={`Image of ${room.room_type} at ${room.hotel_name}`}
            fill
            className="object-cover"
            data-ai-hint="hotel room"
          />
          <Badge className="absolute top-3 right-3 bg-accent/90 text-accent-foreground">{room.hotel_name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2">{room.room_type}</CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4" />
            <span>{room.room_type} Room</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>{formattedPrice} / night</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
        {isOwner && role === 'owner' && (
          <div className="w-full flex justify-between items-center">
            <Badge variant="outline">You are the owner</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Manage
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onUpdateImage(room)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Update Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {isVisitor && (
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            onClick={() => bookRoom(room.id)}
          >
            Book Now
          </Button>
        )}
        {role === 'visitor' && isOwner && (
            <Badge variant="destructive" className="w-full text-center justify-center">Owned by someone else</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
