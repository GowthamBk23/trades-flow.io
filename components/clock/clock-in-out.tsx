'use client';

import { useState } from 'react';
import { useClockStore } from '@/lib/stores/clock-store';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/hooks/use-toast';

export function ClockInOut() {
  const { user } = useUser();
  const { isClocked, clockIn, clockOut } = useClockStore();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleClockAction = async () => {
    setIsLoading(true);

    try {
      // Request location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const timestamp = new Date().toISOString();

      // Format location as PostGIS point
      const point = {
        type: 'Point',
        coordinates: [longitude, latitude],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
      };

      if (!isClocked) {
        // Clock in
        const { error } = await supabase.from('shifts').insert({
          user_id: user?.id,
          start_time: timestamp,
          location: point,
          status: 'scheduled',
        });

        if (error) throw error;
        await clockIn({ latitude, longitude });
        toast({
          title: 'Clocked In',
          description: `Successfully clocked in at ${new Date().toLocaleTimeString()}`,
        });
      } else {
        // Clock out
        const { data: shifts, error: fetchError } = await supabase
          .from('shifts')
          .select()
          .eq('user_id', user?.id)
          .is('end_time', null)
          .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
          .from('shifts')
          .update({
            end_time: timestamp,
            status: 'completed',
          })
          .eq('id', shifts.id);

        if (updateError) throw updateError;
        await clockOut({ latitude, longitude });
        toast({
          title: 'Clocked Out',
          description: `Successfully clocked out at ${new Date().toLocaleTimeString()}`,
        });
      }
    } catch (error) {
      console.error('Clock action error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process clock action. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Time Clock</h2>
        <div className="text-sm text-gray-500">
          {isClocked ? (
            <p>You are currently clocked in</p>
          ) : (
            <p>You are not clocked in</p>
          )}
        </div>
        <Button
          onClick={handleClockAction}
          disabled={isLoading}
          className={isClocked ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {isLoading
            ? 'Processing...'
            : isClocked
            ? 'Clock Out'
            : 'Clock In'}
        </Button>
      </div>
    </Card>
  );
} 