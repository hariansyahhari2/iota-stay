'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy } from 'lucide-react';

type MintSuccessDialogProps = {
  objectId: string | null;
  onClose: () => void;
};

export default function MintSuccessDialog({ objectId, onClose }: MintSuccessDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!objectId) return;
    navigator.clipboard.writeText(objectId);
    toast({
      title: 'Copied!',
      description: 'Object ID has been copied to your clipboard.',
    });
  };

  return (
    <AlertDialog open={!!objectId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <AlertDialogTitle className="text-center font-headline text-2xl">Minting Successful!</AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            Your new Room NFT has been created on the IOTA network. You can find its Object ID below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 p-4 bg-muted rounded-md text-sm break-all font-mono relative">
          {objectId}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleCopy}
            aria-label="Copy Object ID"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="w-full">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
