"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SplashScreen } from "@/components/SplashScreen";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * ProtectedLayout component that:
 * - Shows loading state while auth is loading
 * - Redirects to /login only when loading is false AND user is null
 * - Uses router.replace to avoid adding to history
 */
export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
