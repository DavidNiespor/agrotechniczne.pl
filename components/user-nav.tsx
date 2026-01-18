"use client";

import { signOut } from "next-auth/react";

export function UserNav({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-4 p-4 border-t bg-gray-50">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {user?.fullName || user?.email}
        </span>
        <span className="text-xs text-gray-500 truncate max-w-[150px]">
          {user?.email}
        </span>
      </div>
      
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="ml-auto text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
      >
        Wyloguj
      </button>
    </div>
  );
}