"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { User, UserRole } from "@teachy/db";

/**
 * Auth status represents the current phase of authentication
 * - idle: Initial state, auth not yet checked
 * - loading: Checking auth state or fetching user data
 * - authenticated: User is fully authenticated with both Firebase and DB user
 * - unauthenticated: No user is signed in
 * - signing-out: User initiated sign out, waiting for completion
 */
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "signing-out";

export interface AuthState {
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

export function useAuthState(): AuthState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const isAuthenticatingRef = useRef(false);
  const isSigningOutRef = useRef(false);

  const signIn = useCallback(async (email: string, password: string) => {
    isAuthenticatingRef.current = true;

    try {
      const auth = getAuthInstance();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      const { user: fetchedDbUser } = await api.auth.me(idToken);

      setFirebaseUser(userCredential.user);
      setDbUser(fetchedDbUser);
      setStatus("authenticated");
    } catch (error) {
      throw error;
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, role: UserRole, name: string) => {
      isAuthenticatingRef.current = true;

      try {
        const auth = getAuthInstance();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();

        await api.auth.sync(idToken, role, name);
        const { user: fetchedDbUser } = await api.auth.me(idToken);

        setFirebaseUser(userCredential.user);
        setDbUser(fetchedDbUser);
        setStatus("authenticated");
      } catch (error) {
        throw error;
      } finally {
        isAuthenticatingRef.current = false;
      }
    },
    []
  );

  const signOutUser = useCallback(async () => {
    isSigningOutRef.current = true;
    setStatus("signing-out");
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      setFirebaseUser(null);
      setDbUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setStatus("authenticated");
      isSigningOutRef.current = false;
    }
  }, []);

  const completeSignOut = useCallback(() => {
    if (isSigningOutRef.current) {
      isSigningOutRef.current = false;
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    setStatus("loading");

    try {
      const auth = getAuthInstance();
      unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (!isMounted) return;

          if (isAuthenticatingRef.current || isSigningOutRef.current) return;

          if (fetchAbortControllerRef.current) {
            fetchAbortControllerRef.current.abort();
          }

          if (user) {
            setFirebaseUser(user);
            setStatus("loading");

            const abortController = new AbortController();
            fetchAbortControllerRef.current = abortController;

            try {
              const idToken = await user.getIdToken(false);

              if (!abortController.signal.aborted) {
                const { user: fetchedDbUser } = await api.auth.me(idToken);
                if (!abortController.signal.aborted && isMounted) {
                  setDbUser(fetchedDbUser);
                  setStatus("authenticated");
                }
              }
            } catch (error) {
              if (!abortController.signal.aborted && isMounted) {
                console.error("Error fetching user data:", error);
                setDbUser(null);
                setStatus("unauthenticated");
              }
            }
          } else {
            setFirebaseUser(null);
            setDbUser(null);
            setStatus("unauthenticated");
          }
        },
        (err) => {
          if (!isMounted) return;
          console.error("Auth state error:", err);
          setFirebaseUser(null);
          setDbUser(null);
          setStatus("unauthenticated");
        }
      );
    } catch (err) {
      if (isMounted) {
        console.error("Failed to initialize auth:", err);
        setFirebaseUser(null);
        setDbUser(null);
        setStatus("unauthenticated");
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

  const loading =
    status === "idle" || status === "loading" || status === "signing-out";

  return {
    firebaseUser,
    dbUser,
    status,
    loading,
    signIn,
    register,
    signOutUser,
    completeSignOut,
  };
}
