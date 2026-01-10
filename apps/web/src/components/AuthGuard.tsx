"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { UserRole } from "@teachy/db";
import { SplashScreen } from "@/components/SplashScreen";

const publicRoutes = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading || redirecting) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    const isHomePage = pathname === "/";

    if (!user && !isPublicRoute && !isHomePage) {
      router.push("/login");
      return;
    }

    if (user) {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/"
      ) {
        setRedirecting(true);
        const redirectToDashboard = async () => {
          try {
            const auth = getAuthInstance();
            const idToken = await auth.currentUser?.getIdToken();

            if (!idToken) {
              router.push("/login");
              return;
            }

            const { user: dbUser } = await api.auth.me(idToken);
            if (dbUser.role === UserRole.TEACHER) {
              router.push("/teacher/dashboard");
            } else {
              router.push("/student/dashboard");
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            router.push("/login");
          } finally {
            setRedirecting(false);
          }
        };

        redirectToDashboard();
      }
    }
  }, [user, loading, pathname, router, redirecting]);

  if (loading || (redirecting && !user)) {
    return <SplashScreen />;
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isHomePage = pathname === "/";

  if (!user && !isPublicRoute && !isHomePage) {
    return null;
  }

  if (user && pathname === "/") {
    return null;
  }

  return <>{children}</>;
}
