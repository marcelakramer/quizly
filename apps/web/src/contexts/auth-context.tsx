"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@teachy/db";
import { useAuthState } from "@/hooks/use-auth-state";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state
 * @returns {AuthContextType} Object containing firebaseUser, dbUser, and loading state
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
