"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getDashboardPathForRole } from "@/lib/utils/role";
import { SplashScreen } from "@/components/SplashScreen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dbUser, status, completeSignOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  useEffect(() => {
    if (status === "signing-out") {
      completeSignOut();
    }
  }, [status, completeSignOut]);

  useEffect(() => {
    if (status !== "authenticated" || !dbUser) return;

    if (redirectTo && redirectTo.startsWith("/")) {
      router.replace(redirectTo);
    } else {
      router.replace(getDashboardPathForRole(dbUser.role));
    }
  }, [status, dbUser, router, redirectTo]);

  if (status === "idle" || status === "loading") {
    return <SplashScreen />;
  }

  if (status === "authenticated") {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
