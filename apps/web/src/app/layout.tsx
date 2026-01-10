import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
