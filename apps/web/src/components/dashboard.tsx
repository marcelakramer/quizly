"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";
import { ReactNode } from "react";

interface DashboardProps {
  title: string;
  welcomeMessage: string;
  description?: string;
  children?: ReactNode;
}

export function Dashboard({
  title,
  welcomeMessage,
  description,
  children,
}: DashboardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children || (
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {welcomeMessage}
                </h2>
                {description && <p className="text-gray-600">{description}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
