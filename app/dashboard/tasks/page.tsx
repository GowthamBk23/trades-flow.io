import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Tasks</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your tasks efficiently.</p>
          {/* Task list will go here */}
        </div>
      </div>
    </div>
  );
} 