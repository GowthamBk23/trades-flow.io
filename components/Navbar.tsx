import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/dashboard" className="text-xl font-bold flex items-center lg:ml-2.5">
              <span className="self-center whitespace-nowrap">TradesFlow</span>
            </Link>
          </div>
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    </nav>
  );
} 