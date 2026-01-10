import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Teachy Assignment Platform",
  description: "Create and share exercise lists with students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>
        <AuthProvider>
          <Header />
          <AuthGuard>{children}</AuthGuard>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
