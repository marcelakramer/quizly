"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";

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

            const response = await fetch("/api/auth/me", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });

            if (response.ok) {
              const { user: dbUser } = await response.json();
              if (dbUser.role === "TEACHER") {
                router.push("/teacher/dashboard");
              } else {
                router.push("/student/dashboard");
              }
            } else {
              router.push("/login");
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

  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
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
