"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { UserRole } from "@teachy/db";
import { SplashScreen } from "@/components/SplashScreen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    const redirectToDashboard = async () => {
      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken(true);

        if (!idToken) return;

        const { user: dbUser } = await api.auth.me(idToken);
        if (dbUser.role === UserRole.TEACHER) {
          router.replace("/teacher/dashboard");
        } else {
          router.replace("/student/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    redirectToDashboard();
  }, [user, loading, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (user) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
