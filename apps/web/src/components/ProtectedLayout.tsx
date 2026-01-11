"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SplashScreen } from "@/components/SplashScreen";
import { UserRole } from "@teachy/db";
import { toast } from "sonner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

/**
 * ProtectedLayout component that:
 * - Shows loading state while auth is loading
 * - Redirects to /login only when loading is false AND user is null
 * - Optionally restricts access to a specific role
 * - Uses router.replace to avoid adding to history
 */
export function ProtectedLayout({
  children,
  allowedRole,
}: ProtectedLayoutProps) {
  const { firebaseUser, dbUser, loading } = useAuth();
  const router = useRouter();
  const roleErrorShownRef = useRef(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/login");
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    if (!loading && dbUser && allowedRole && dbUser.role !== allowedRole) {
      if (!roleErrorShownRef.current) {
        roleErrorShownRef.current = true;

        if (dbUser.role === UserRole.TEACHER) {
          toast.error("This page is only accessible to students.");
          router.replace("/teacher/dashboard");
        } else {
          toast.error("This page is only accessible to teachers.");
          router.replace("/student/dashboard");
        }
      }
    }
  }, [dbUser, loading, allowedRole, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!firebaseUser) {
    return null;
  }

  if (allowedRole && dbUser && dbUser.role !== allowedRole) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
