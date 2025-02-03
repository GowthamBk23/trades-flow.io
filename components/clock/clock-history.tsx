'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface ShiftRecord {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  location: {
    type: string;
    coordinates: [number, number];
    crs: { type: string; properties: { name: string } };
  };
  status: 'scheduled' | 'completed' | 'missed';
  user: {
    email: string;
  };
}

export function ClockHistory() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );

  useEffect(() => {
    async function loadShifts() {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          user:users(email)
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      if (!error && data) {
        setShifts(data);
      }
      setIsLoading(false);
    }

    loadShifts();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Clock History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => {
            const duration = shift.end_time
              ? new Date(shift.end_time).getTime() -
                new Date(shift.start_time).getTime()
              : 0;
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <TableRow key={shift.id}>
                <TableCell>{shift.user.email}</TableCell>
                <TableCell>
                  {format(new Date(shift.start_time), 'MMM d, h:mm a')}
                </TableCell>
                <TableCell>
                  {shift.end_time
                    ? format(new Date(shift.end_time), 'MMM d, h:mm a')
                    : '-'}
                </TableCell>
                <TableCell>
                  {shift.end_time ? `${hours}h ${minutes}m` : '-'}
                </TableCell>
                <TableCell>
                  <a
                    href={`https://www.google.com/maps?q=${shift.location.coordinates[1]},${shift.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Map
                  </a>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      shift.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : shift.status === 'missed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {shift.status}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 