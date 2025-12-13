'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User } from 'lucide-react';

type RoleSelectorProps = {
  onSelectRole: (role: 'owner' | 'visitor') => void;
};

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-grid-slate-50 dark:bg-grid-slate-900 p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent h-1/2"></div>
      <Card className="w-full max-w-md shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <CardHeader className="text-center">
           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
             <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Select Your Role</CardTitle>
          <CardDescription>
            Are you here to manage your hotel listings or to find a place to stay?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-base bg-primary hover:bg-primary/90"
            onClick={() => onSelectRole('owner')}
          >
            <Building className="mr-2 h-5 w-5" />
            I'm a Hotel Owner
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12 text-base"
            onClick={() => onSelectRole('visitor')}
          >
            <User className="mr-2 h-5 w-5" />
            I'm a Visitor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
