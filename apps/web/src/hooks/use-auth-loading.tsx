"use client";

import { useAuth } from "@/contexts/auth-context";

/**
 * Hook that returns auth loading state
 * @returns loading state from auth context
 */
export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}
