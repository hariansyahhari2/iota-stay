'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIota } from '@/lib/iota';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import PlaceHolderImagesData from '@/lib/placeholder-images.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  hotel_name: z.string().min(2, 'Hotel name must be at least 2 characters.'),
  date: z.date({ required_error: 'A date is required.' }),
  room_type: z.string().min(1, 'Room type is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  image_url: z.string().url('Must be a valid URL.'),
});

export default function MintRoomForm() {
  const { mintRoom } = useIota();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotel_name: '',
      room_type: '',
      price: 100,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mintRoom({
      ...values,
      date: parseInt(format(values.date, 'yyyyMMdd')),
      price: values.price * 1_000_000, // Convert to smallest unit
      image_hash: 'mock_hash_' + Date.now(), // Mock hash generation
    });
    form.reset();
  }
  
  const handleImageSelect = (url: string) => {
    form.setValue('image_url', url, { shouldValidate: true });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Mint New Room NFT</CardTitle>
        <CardDescription>Fill in the details below to create a new room availability NFT.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hotel_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Grand Iotan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Availability Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Deluxe, Suite" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (in M-IOTA)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                  </FormControl>
                  <FormDescription>Price in MegaIOTA (1 M-IOTA = 1,000,000 IOTA).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Mint Room NFT
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
