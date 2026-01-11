"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SplashScreen } from "@/components/common";
import { UserRole } from "@teachy/db";
import { toast } from "sonner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

/**
 * ProtectedLayout component that:
 * - Shows splash screen during auth transitions (loading, signing-out)
 * - Redirects to /login when status is unauthenticated
 * - Optionally restricts access to a specific role
 */
export function ProtectedLayout({
  children,
  allowedRole,
}: ProtectedLayoutProps) {
  const { firebaseUser, dbUser, status } = useAuth();
  const router = useRouter();
  const roleErrorShownRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      dbUser &&
      allowedRole &&
      dbUser.role !== allowedRole
    ) {
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
  }, [dbUser, status, allowedRole, router]);

  // Show splash during any transition state
  if (status === "idle" || status === "loading" || status === "signing-out") {
    return <SplashScreen />;
  }

  if (status === "unauthenticated" || !firebaseUser) {
    return <SplashScreen />;
  }

  if (allowedRole && dbUser && dbUser.role !== allowedRole) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
