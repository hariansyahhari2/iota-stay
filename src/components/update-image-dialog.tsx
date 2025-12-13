'use client';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import type { RoomAvailability } from '@/lib/types';
import { useIota } from '@/lib/iota';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type UpdateImageDialogProps = {
  room: RoomAvailability;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function UpdateImageDialog({ room, isOpen, setIsOpen }: UpdateImageDialogProps) {
  const { updateImage } = useIota();
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState(room.image_url);

  const handleUpdate = () => {
    if (!newImageUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Image URL cannot be empty.' });
      return;
    }
    updateImage(room.id, newImageUrl, 'mock_hash_' + Date.now());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Update Promotional Image</DialogTitle>
          <DialogDescription>Change the image for your {room.room_type} room listing.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Current/New Image</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
               <Image src={newImageUrl} alt="Promotional image" layout="fill" objectFit="cover" data-ai-hint="hotel room" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Update Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
