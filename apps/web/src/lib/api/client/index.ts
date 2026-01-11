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
    sync: async (
      idToken: string,
      role: UserRole,
      name?: string
    ): Promise<{ user: User }> => {
      return fetchWithAuth<{ user: User }>("/api/auth/sync", idToken, {
        method: "POST",
        body: JSON.stringify({ role, name }),
      });
    },
    me: async (idToken: string): Promise<{ user: User }> => {
      return fetchWithAuth<{ user: User }>("/api/auth/me", idToken, {
        method: "GET",
      });
    },
  },
  user: {},
  exercises: {
    lists: {
      getAll: async (idToken: string) => {
        return fetchWithAuth<any>("/api/exercises/lists", idToken, {
          method: "GET",
        });
      },
      create: async (idToken: string, data: any) => {
        return fetchWithAuth<any>("/api/exercises/lists", idToken, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      getById: async (idToken: string, listId: string) => {
        return fetchWithAuth<any>(
          `/api/exercises/lists/manage/${listId}`,
          idToken,
          { method: "GET" }
        );
      },
      update: async (idToken: string, listId: string, data: any) => {
        return fetchWithAuth<any>(
          `/api/exercises/lists/manage/${listId}`,
          idToken,
          { method: "PUT", body: JSON.stringify(data) }
        );
      },
      delete: async (idToken: string, listId: string) => {
        return fetchWithAuth<any>(
          `/api/exercises/lists/manage/${listId}`,
          idToken,
          { method: "DELETE" }
        );
      },
      getSubmissions: async (idToken: string, listId: string) => {
        return fetchWithAuth<any>(
          `/api/exercises/submissions/lists/${listId}`,
          idToken,
          { method: "GET" }
        );
      },
    },
    submissions: {
      getById: async (idToken: string, submissionId: string) => {
        return fetchWithAuth<any>(
          `/api/exercises/submissions/${submissionId}`,
          idToken,
          { method: "GET" }
        );
      },
    },
    student: {
      getAll: async (idToken: string) => {
        return fetchWithAuth<any>(
          "/api/exercises/submissions/student",
          idToken,
          { method: "GET" }
        );
      },
    },
  },
  quiz: {
    getByShareCode: async (shareCode: string) => {
      return fetchApi<any>(`/api/exercises/lists/${shareCode}`, {
        method: "GET",
      });
    },
    submit: async (idToken: string, shareCode: string, answers: any[]) => {
      return fetchApi<any>("/api/exercises/submissions", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ shareCode, answers }),
      });
    },
    checkSubmission: async (idToken: string, shareCode: string) => {
      return fetchWithAuth<any>(
        `/api/exercises/submissions/check/${shareCode}`,
        idToken,
        { method: "GET" }
      );
    },
  },
} as const;
