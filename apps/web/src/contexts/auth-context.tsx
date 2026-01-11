"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole } from "@teachy/db";
import { useAuthState, AuthState, AuthStatus } from "@/hooks/use-auth-state";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  status: AuthStatus;
  /** @deprecated Use status instead */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    name: string
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
  completeSignOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState: AuthState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
