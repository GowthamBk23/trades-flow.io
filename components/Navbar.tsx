'use client';

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  
  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/dashboard/tasks' },
    { label: 'Schedule', href: '/dashboard/schedule' },
    { label: 'Clock In/Out', href: '/dashboard/clock' },
    { label: 'Chat', href: '/dashboard/chat' },
    { label: 'Invoices', href: '/dashboard/invoices' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/dashboard" className="text-xl font-bold flex items-center lg:ml-2.5">
              <span className="self-center whitespace-nowrap dark:text-white">TradesFlow</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="ml-4">
              {user && (
                <span className="text-gray-900 dark:text-gray-300 text-sm font-medium">
                  {user.firstName || user.emailAddresses[0].emailAddress}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 