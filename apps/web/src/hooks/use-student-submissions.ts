"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { StudentSubmission } from "@/types";

interface SubmissionStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  totalCorrect: number;
  bestScore: number;
}

export function useStudentSubmissions() {
  const { firebaseUser, status } = useAuth();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const authLoading = status === "idle" || status === "loading";

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!firebaseUser || authLoading) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          return;
        }

        const { submissions: fetchedSubmissions } =
          await api.exercises.student.getAll(idToken);
        setSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [firebaseUser, authLoading]);

  const stats = useMemo<SubmissionStats>(() => {
    const totalQuizzes = submissions.length;
    const averageScore =
      totalQuizzes > 0
        ? submissions.reduce((acc, sub) => acc + sub.score, 0) / totalQuizzes
        : 0;
    const totalQuestions = submissions.reduce(
      (acc, sub) => acc + sub.totalQuestions,
      0
    );
    const totalCorrect = submissions.reduce(
      (acc, sub) => acc + sub.correctAnswers,
      0
    );
    const bestScore =
      totalQuizzes > 0 ? Math.max(...submissions.map((sub) => sub.score)) : 0;

    return {
      totalQuizzes,
      averageScore,
      totalQuestions,
      totalCorrect,
      bestScore,
    };
  }, [submissions]);

  return {
    submissions,
    loading: authLoading || loading,
    stats,
  };
}
