"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Submission, ExerciseListSummary } from "@/types";

export function useListResults(listId: string) {
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [list, setList] = useState<ExerciseListSummary | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!firebaseUser || !listId) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          toast.error("You must be logged in.");
          router.push("/login");
          return;
        }

        const { list: fetchedList, submissions: fetchedSubmissions } =
          await api.exercises.lists.getSubmissions(idToken, listId);

        setList(fetchedList);
        setSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error(
          error instanceof Error
            ? error.message.endsWith(".")
              ? error.message
              : `${error.message}.`
            : "Failed to load results."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firebaseUser, listId, router]);

  const shareUrl = useMemo(() => {
    if (!list) return "";
    return `${typeof window !== "undefined" ? window.location.origin : ""}/quiz/${list.shareCode}`;
  }, [list]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", {
        description: "Share this link with your students",
      });
    } catch {
      toast.error("Failed to copy link.");
    }
  }, [shareUrl]);

  const averageScore = useMemo(() => {
    return submissions.length > 0
      ? submissions.reduce((acc, sub) => acc + sub.percentage, 0) /
          submissions.length
      : 0;
  }, [submissions]);

  return {
    list,
    submissions,
    loading,
    shareUrl,
    averageScore,
    handleShare,
  };
}
