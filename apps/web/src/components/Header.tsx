"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils/user";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const publicRoutes = ["/login", "/register"];
const publicRoutePrefixes = ["/quiz"];

export function Header() {
  const { firebaseUser, dbUser, status, signOutUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    signOutUser().then(() => {
      router.push("/login");
    });
  };

  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicPrefix = publicRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isPublicRoute || isPublicPrefix) {
    return null;
  }

  // Don't render header content during transitions
  if (status === "idle" || status === "loading" || status === "signing-out") {
    return (
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-xl"
          >
            <Logo width={32} height={32} />
            <span className="text-gray-900">Quizly</span>
          </Link>
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </header>
    );
  }

  const initials = dbUser?.name ? getInitials(dbUser.name) : null;

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl"
        >
          <Logo width={32} height={32} />
          <span className="text-gray-900">Quizly</span>
        </Link>

        {firebaseUser && dbUser && initials ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-4 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {dbUser.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {firebaseUser.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
