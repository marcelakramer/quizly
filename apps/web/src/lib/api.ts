import { User, UserRole, ExerciseList, QuestionType } from "@teachy/db";

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
      getAll: async (
        idToken: string
      ): Promise<{
        lists: (ExerciseList & {
          questions: { id: string }[];
          submissions: { id: string }[];
        })[];
      }> => {
        return fetchWithAuth<{
          lists: (ExerciseList & {
            questions: { id: string }[];
            submissions: { id: string }[];
          })[];
        }>("/api/exercises/lists", idToken, {
          method: "GET",
        });
      },
      create: async (
        idToken: string,
        data: {
          title: string;
          description: string | null;
          questions: {
            title: string;
            type: QuestionType;
            options?: { label: string; isCorrect: boolean }[];
            order: number;
          }[];
        }
      ): Promise<{ list: ExerciseList }> => {
        return fetchWithAuth<{ list: ExerciseList }>(
          "/api/exercises/lists",
          idToken,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
      },
      getById: async (
        idToken: string,
        listId: string
      ): Promise<{
        list: ExerciseList & {
          questions: Array<{
            id: string;
            title: string;
            type: QuestionType;
            order: number;
            options: Array<{
              id: string;
              label: string;
              isCorrect: boolean;
            }>;
          }>;
          submissions: Array<{ id: string }>;
        };
      }> => {
        return fetchWithAuth<{
          list: ExerciseList & {
            questions: Array<{
              id: string;
              title: string;
              type: QuestionType;
              order: number;
              options: Array<{
                id: string;
                label: string;
                isCorrect: boolean;
              }>;
            }>;
            submissions: Array<{ id: string }>;
          };
        }>(`/api/exercises/lists/manage/${listId}`, idToken, {
          method: "GET",
        });
      },
      update: async (
        idToken: string,
        listId: string,
        data: {
          title: string;
          description: string | null;
          questions: {
            title: string;
            type: QuestionType;
            options?: { label: string; isCorrect: boolean }[];
            order: number;
          }[];
        }
      ): Promise<{ list: ExerciseList }> => {
        return fetchWithAuth<{ list: ExerciseList }>(
          `/api/exercises/lists/manage/${listId}`,
          idToken,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );
      },
      delete: async (
        idToken: string,
        listId: string
      ): Promise<{ success: boolean }> => {
        return fetchWithAuth<{ success: boolean }>(
          `/api/exercises/lists/manage/${listId}`,
          idToken,
          {
            method: "DELETE",
          }
        );
      },
      getSubmissions: async (
        idToken: string,
        listId: string
      ): Promise<{
        list: {
          id: string;
          title: string;
          description: string | null;
          shareCode: string;
          questions: Array<{ id: string }>;
        };
        submissions: Array<{
          id: string;
          studentName: string;
          studentEmail: string;
          score: number;
          totalQuestions: number;
          percentage: number;
          submittedAt: Date;
        }>;
      }> => {
        return fetchWithAuth<{
          list: {
            id: string;
            title: string;
            description: string | null;
            shareCode: string;
            questions: Array<{ id: string }>;
          };
          submissions: Array<{
            id: string;
            studentName: string;
            studentEmail: string;
            score: number;
            totalQuestions: number;
            percentage: number;
            submittedAt: Date;
          }>;
        }>(`/api/exercises/submissions/lists/${listId}`, idToken, {
          method: "GET",
        });
      },
    },
    submissions: {
      getById: async (
        idToken: string,
        submissionId: string
      ): Promise<{
        submission: {
          id: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          createdAt: Date;
          student: {
            id: string;
            name: string;
            email: string;
          };
          exerciseList: {
            id: string;
            title: string;
            description: string | null;
            shareCode: string;
            teacher: {
              id: string;
              name: string;
              email: string;
            };
            questions: Array<{
              id: string;
              title: string;
              type: QuestionType;
              order: number;
              options: Array<{
                id: string;
                label: string;
                isCorrect: boolean;
              }>;
            }>;
          };
          answers: Array<{
            questionId: string;
            question: {
              id: string;
              title: string;
              type: QuestionType;
              order: number;
              options: Array<{
                id: string;
                label: string;
                isCorrect: boolean;
              }>;
            };
            selectedOptionId?: string;
            selectedOption?: {
              id: string;
              label: string;
              isCorrect: boolean;
            };
            textAnswer?: string;
            isCorrect?: boolean;
            correctOptionId?: string;
          }>;
        };
      }> => {
        return fetchWithAuth<{
          submission: {
            id: string;
            score: number;
            totalQuestions: number;
            correctAnswers: number;
            createdAt: Date;
            student: {
              id: string;
              name: string;
              email: string;
            };
            exerciseList: {
              id: string;
              title: string;
              description: string | null;
              shareCode: string;
              teacher: {
                id: string;
                name: string;
                email: string;
              };
              questions: Array<{
                id: string;
                title: string;
                type: QuestionType;
                order: number;
                options: Array<{
                  id: string;
                  label: string;
                  isCorrect: boolean;
                }>;
              }>;
            };
            answers: Array<{
              questionId: string;
              question: {
                id: string;
                title: string;
                type: QuestionType;
                order: number;
                options: Array<{
                  id: string;
                  label: string;
                  isCorrect: boolean;
                }>;
              };
              selectedOptionId?: string;
              selectedOption?: {
                id: string;
                label: string;
                isCorrect: boolean;
              };
              textAnswer?: string;
              isCorrect?: boolean;
              correctOptionId?: string;
            }>;
          };
        }>(`/api/exercises/submissions/${submissionId}`, idToken, {
          method: "GET",
        });
      },
    },
    student: {
      getAll: async (
        idToken: string
      ): Promise<{
        submissions: Array<{
          id: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          createdAt: Date;
          exerciseList: {
            id: string;
            title: string;
            description: string | null;
            shareCode: string;
            teacher: {
              id: string;
              name: string;
              email: string;
            };
            questionCount: number;
          };
        }>;
      }> => {
        return fetchWithAuth<{
          submissions: Array<{
            id: string;
            score: number;
            totalQuestions: number;
            correctAnswers: number;
            createdAt: Date;
            exerciseList: {
              id: string;
              title: string;
              description: string | null;
              shareCode: string;
              teacher: {
                id: string;
                name: string;
                email: string;
              };
              questionCount: number;
            };
          }>;
        }>("/api/exercises/submissions/student", idToken, {
          method: "GET",
        });
      },
    },
  },
  quiz: {
    getByShareCode: async (
      shareCode: string
    ): Promise<{
      list: ExerciseList & {
        questions: Array<{
          id: string;
          title: string;
          type: QuestionType;
          order: number;
          options: Array<{
            id: string;
            label: string;
            isCorrect: boolean;
          }>;
        }>;
        teacher: {
          id: string;
          name: string;
          email: string;
        };
      };
    }> => {
      return fetchApi<{
        list: ExerciseList & {
          questions: Array<{
            id: string;
            title: string;
            type: QuestionType;
            order: number;
            options: Array<{
              id: string;
              label: string;
              isCorrect: boolean;
            }>;
          }>;
          teacher: {
            id: string;
            name: string;
            email: string;
          };
        };
      }>(`/api/exercises/lists/${shareCode}`, {
        method: "GET",
      });
    },
    submit: async (
      idToken: string,
      shareCode: string,
      answers: Array<{
        questionId: string;
        selectedOptionId?: string;
        textAnswer?: string;
      }>
    ): Promise<{
      submission: {
        id: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        answers: Array<{
          questionId: string;
          selectedOptionId?: string;
          textAnswer?: string;
          isCorrect?: boolean;
          correctOptionId?: string;
        }>;
      };
    }> => {
      return fetchApi<{
        submission: {
          id: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          answers: Array<{
            questionId: string;
            selectedOptionId?: string;
            textAnswer?: string;
            isCorrect?: boolean;
            correctOptionId?: string;
          }>;
        };
      }>("/api/exercises/submissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          shareCode,
          answers,
        }),
      });
    },
    checkSubmission: async (
      idToken: string,
      shareCode: string
    ): Promise<{
      hasSubmission: boolean;
      submission?: {
        id: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        createdAt: Date;
        answers: Array<{
          questionId: string;
          selectedOptionId: string;
          isCorrect: boolean;
          correctOptionId: string;
        }>;
      };
    }> => {
      return fetchWithAuth<{
        hasSubmission: boolean;
        submission?: {
          id: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          createdAt: Date;
          answers: Array<{
            questionId: string;
            selectedOptionId: string;
            isCorrect: boolean;
            correctOptionId: string;
          }>;
        };
      }>(`/api/exercises/submissions/check/${shareCode}`, idToken, {
        method: "GET",
      });
    },
  },
} as const;
