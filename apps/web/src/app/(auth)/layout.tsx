"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@teachy/db";
import { SplashScreen } from "@/components/SplashScreen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !firebaseUser || !dbUser) return;

    // Redirect authenticated users to their dashboard
    if (dbUser.role === UserRole.TEACHER) {
      router.replace("/teacher/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [firebaseUser, dbUser, loading, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (firebaseUser && dbUser) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
