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
import { suggestPromotionalImages } from '@/ai/flows/suggest-promotional-images';
import { Loader2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from './ui/skeleton';

type UpdateImageDialogProps = {
  room: RoomAvailability;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type AISuggestion = {
  imageUrl: string;
  imageHash: string;
  reasoning: string;
};

export default function UpdateImageDialog({ room, isOpen, setIsOpen }: UpdateImageDialogProps) {
  const { updateImage } = useIota();
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState(room.image_url);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  const handleUpdate = () => {
    if (!newImageUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Image URL cannot be empty.' });
      return;
    }
    updateImage(room.id, newImageUrl, 'mock_hash_' + Date.now());
    setIsOpen(false);
  };

  const handleSuggestion = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    try {
      // Mock data for the AI flow
      const mockBookingData = JSON.stringify({ recent_bookings: 25, top_demographic: 'couples' });
      const mockMarketTrends = JSON.stringify({ current_trend: 'wellness_retreats', popular_amenity: 'spa' });

      const result = await suggestPromotionalImages({
        hotelName: room.hotel_name,
        roomType: room.room_type,
        bookingData: mockBookingData,
        marketTrends: mockMarketTrends,
      });
      setSuggestion({
        imageUrl: result.suggestedImageUrl,
        imageHash: result.suggestedImageHash,
        reasoning: result.reasoning,
      });
      setNewImageUrl(result.suggestedImageUrl);
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: 'Could not generate an image suggestion at this time.',
      });
    } finally {
      setIsSuggesting(false);
    }
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
          
          <Button variant="outline" onClick={handleSuggestion} disabled={isSuggesting}>
            {isSuggesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
            )}
            Suggest with AI
          </Button>

          {isSuggesting && (
             <Alert>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-16 w-full" />
             </Alert>
          )}

          {suggestion && (
            <Alert className="bg-primary/5 border-primary/20">
              <Sparkles className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-primary">AI Suggestion</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">Reasoning:</p>
                <Textarea readOnly value={suggestion.reasoning} className="bg-transparent border-none p-0 focus-visible:ring-0" />
              </AlertDescription>
            </Alert>
          )}
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
