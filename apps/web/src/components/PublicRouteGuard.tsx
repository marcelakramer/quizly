"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { UserRole } from "@teachy/db";
import { SplashScreen } from "@/components/SplashScreen";

interface PublicRouteGuardProps {
  children: React.ReactNode;
  publicRoutes?: string[];
}

export function PublicRouteGuard({
  children,
  publicRoutes = ["/"],
}: PublicRouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isPublicRoute) {
      setCheckingAuth(false);
      return;
    }

    if (loading) return;

    if (!user) {
      setCheckingAuth(false);
      return;
    }

    const redirectToDashboard = async () => {
      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken(true);

        if (!idToken) {
          setCheckingAuth(false);
          return;
        }

        const { user: dbUser } = await api.auth.me(idToken);
        if (dbUser.role === UserRole.TEACHER) {
          router.replace("/teacher/dashboard");
        } else {
          router.replace("/student/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setCheckingAuth(false);
      }
    };

    redirectToDashboard();
  }, [user, loading, router, isPublicRoute]);

  if (isPublicRoute && (loading || (user && checkingAuth))) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
