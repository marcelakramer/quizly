"use client";

import { useEffect, useState, useRef } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { User } from "@teachy/db";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
}

/**
 * Hook that manages authentication state
 * Handles Firebase auth state and fetches user data from backend
 */
export function useAuthState(): AuthState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getAuthInstance();
      unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (!isMounted) return;

          if (fetchAbortControllerRef.current) {
            fetchAbortControllerRef.current.abort();
          }

          if (user) {
            setFirebaseUser(user);
            setLoading(true);

            const abortController = new AbortController();
            fetchAbortControllerRef.current = abortController;

            try {
              const idToken = await user.getIdToken(false);

              if (!abortController.signal.aborted) {
                const { user: fetchedDbUser } = await api.auth.me(idToken);
                if (!abortController.signal.aborted && isMounted) {
                  setDbUser(fetchedDbUser);
                  setLoading(false);
                }
              } else if (isMounted) {
                setLoading(false);
              }
            } catch (error) {
              if (!abortController.signal.aborted && isMounted) {
                console.error("Error fetching user data:", error);
                setDbUser(null);
                setLoading(false);
              } else if (isMounted) {
                setLoading(false);
              }
            }
          } else {
            setFirebaseUser(null);
            setDbUser(null);
            setLoading(false);
          }
        },
        (err) => {
          if (!isMounted) return;
          console.error("Auth state error:", err);
          setFirebaseUser(null);
          setDbUser(null);
          setLoading(false);
        }
      );
    } catch (err) {
      if (isMounted) {
        console.error("Failed to initialize auth:", err);
        setFirebaseUser(null);
        setDbUser(null);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return { firebaseUser, dbUser, loading };
}
