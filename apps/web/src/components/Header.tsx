"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User } from "@teachy/db";
import { getInitials } from "@/lib/utils/user";
import { Logo } from "./Logo";

const publicRoutes = ["/login", "/register"];
const publicRoutePrefixes = ["/quiz"];

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoadingUser(true);
        try {
          const auth = getAuthInstance();
          // Force token refresh to get latest user data
          const idToken = await auth.currentUser?.getIdToken(true);
          if (idToken) {
            const { user: userData } = await api.auth.me(idToken);
            setDbUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoadingUser(false);
        }
      } else {
        setDbUser(null);
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [user, pathname]);

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

  const handleLogout = async () => {
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      setMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicPrefix = publicRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (loading || isPublicRoute || isPublicPrefix) {
    return null;
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

        {user && !loadingUser && initials ? (
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
                    {dbUser?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
        ) : null}
      </div>
    </header>
  );
}
