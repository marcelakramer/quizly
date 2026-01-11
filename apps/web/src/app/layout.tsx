"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/contexts/auth-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const authRoutes = ["/login", "/register"];
const publicRoutes = ["/"];
const publicPrefixes = ["/quiz"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();

  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicPrefix = publicPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isProtectedRoute = !isAuthRoute && !isPublicRoute && !isPublicPrefix;

  const isInitializing = status === "idle" || status === "loading";
  const isUnauthenticatedOnProtected =
    status === "unauthenticated" && isProtectedRoute;
  const isSigningOutOnNonAuth = status === "signing-out" && !isAuthRoute;

  if (isInitializing || isUnauthenticatedOnProtected || isSigningOutOnNonAuth) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <title>Quizly</title>
        <meta
          name="description"
          content="Create engaging assessments for your students"
        />
      </head>
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
