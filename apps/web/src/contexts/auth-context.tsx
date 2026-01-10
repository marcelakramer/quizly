"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getAuthInstance();
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!isMounted) return;
          setUser(firebaseUser);
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          setError(err);
          setLoading(false);
          setUser(null);
        }
      );
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize auth")
        );
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state
 * @returns {AuthContextType} Object containing user, loading, and error state
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
