'use client';

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return null;
  if (!user) redirect("/sign-in");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p>Welcome, {user.emailAddresses[0].emailAddress}</p>
        </div>
      </div>
    </div>
  );
} 