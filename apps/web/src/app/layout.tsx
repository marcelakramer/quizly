"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuthLoading } from "@/hooks/use-auth-loading";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const loading = useAuthLoading();

  if (loading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
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
          <LayoutContent>
            <Header />
            {children}
          </LayoutContent>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
