"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api/client";
import { SubmissionDetailsSkeleton } from "@/components/submission";
import { toast } from "sonner";

export default function StudentResults() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const shareCode = params.shareCode as string;

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!firebaseUser || !shareCode || authLoading) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          toast.error("You must be logged in.");
          router.push("/login");
          return;
        }

        const { hasSubmission, submission: fetchedSubmission } =
          await api.quiz.checkSubmission(idToken, shareCode);

        if (!hasSubmission || !fetchedSubmission) {
          toast.error("Submission not found.");
          router.push("/student/dashboard");
          return;
        }

        router.push(`/results/${fetchedSubmission.id}`);
      } catch (error) {
        console.error("Error fetching submission details:", error);
        toast.error(
          error instanceof Error
            ? error.message.endsWith(".")
              ? error.message
              : `${error.message}.`
            : "Failed to load submission details."
        );
        router.push("/student/dashboard");
      }
    };

    fetchSubmission();
  }, [firebaseUser, shareCode, router, authLoading]);

  return <SubmissionDetailsSkeleton showResultCard={true} />;
}
