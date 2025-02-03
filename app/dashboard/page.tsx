'use client';

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return null;
  if (!user) redirect("/sign-in");

  const displayName = user.firstName || user.username || 'User';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome, {displayName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your tasks and schedule efficiently.
          </p>
        </div>
      </div>
    </div>
  );
} 