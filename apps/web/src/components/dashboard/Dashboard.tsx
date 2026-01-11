"use client";
import { ReactNode } from "react";

interface DashboardProps {
  welcomeMessage: string;
  description?: string;
  children?: ReactNode;
}

export function Dashboard({
  welcomeMessage,
  description,
  children,
}: DashboardProps) {
  return (
    <div className="min-h-full bg-gray-50">
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
