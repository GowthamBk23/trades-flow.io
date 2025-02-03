import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClockState {
  isClocked: boolean;
  lastClockIn: string | null;
  lastLocation: { latitude: number; longitude: number } | null;
  clockIn: (location: { latitude: number; longitude: number }) => Promise<void>;
  clockOut: (location: { latitude: number; longitude: number }) => Promise<void>;
}

export const useClockStore = create<ClockState>()(
  persist(
    (set) => ({
      isClocked: false,
      lastClockIn: null,
      lastLocation: null,
      clockIn: async (location) => {
        set({ isClocked: true, lastClockIn: new Date().toISOString(), lastLocation: location });
      },
      clockOut: async (location) => {
        set({ isClocked: false, lastClockIn: null, lastLocation: null });
      },
    }),
    {
      name: 'clock-store',
    }
  )
); 