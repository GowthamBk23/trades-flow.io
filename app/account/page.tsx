'use client';

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return null;
  if (!user) redirect("/sign-in");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account settings using the Clerk User Profile.
          </p>
          <button
            onClick={() => user.update({ unsafeMetadata: { showProfileSettings: true } })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Open Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
} 