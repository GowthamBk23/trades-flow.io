import { ClockInOut } from '@/components/clock/clock-in-out';
import { ClockHistory } from '@/components/clock/clock-history';
import { useUser } from '@clerk/nextjs';

export default function ClockPage() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata.role === 'admin';

  return (
    <div className="p-6 space-y-8">
      <ClockInOut />
      {isAdmin && <ClockHistory />}
    </div>
  );
} 