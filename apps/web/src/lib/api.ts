import { User, UserRole } from "@teachy/db";

interface ApiError {
  error: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error || "Request failed");
  }

  return response.json();
}

async function fetchWithAuth<T>(
  endpoint: string,
  idToken: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  });
}

export const api = {
  auth: {
    sync: async (idToken: string, role: UserRole): Promise<{ user: User }> => {
      return fetchWithAuth<{ user: User }>("/api/auth/sync", idToken, {
        method: "POST",
        body: JSON.stringify({ role }),
      });
    },
    me: async (idToken: string): Promise<{ user: User }> => {
      return fetchWithAuth<{ user: User }>("/api/auth/me", idToken, {
        method: "GET",
      });
    },
  },
  user: {},
  exercises: {},
} as const;
