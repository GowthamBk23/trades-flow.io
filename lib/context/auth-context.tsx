'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'staff';

interface AuthContextType {
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  isAdmin: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    if (isSignedIn && user) {
      // Get role from Clerk public metadata
      const userRole = user.publicMetadata.role as UserRole;
      setRole(userRole || null);
    }

    setIsLoading(false);
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin: role === 'admin',
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext); 