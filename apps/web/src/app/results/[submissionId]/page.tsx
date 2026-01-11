"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SubmissionDetailsSkeleton } from "@/components/SubmissionDetailsSkeleton";
import { SubmissionDetailsView } from "@/components/SubmissionDetailsView";
import { User } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@teachy/db";
import { SubmissionDetail } from "@/types";

export default function SubmissionDetails() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, dbUser, loading: authLoading } = useAuth();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!firebaseUser || !submissionId) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          toast.error("You must be logged in.");
          router.push("/login");
          return;
        }

        const { submission: fetchedSubmission } =
          await api.exercises.submissions.getById(idToken, submissionId);

        setSubmission(fetchedSubmission);
      } catch (error) {
        console.error("Error fetching submission details:", error);
        toast.error(
          error instanceof Error
            ? error.message.endsWith(".")
              ? error.message
              : `${error.message}.`
            : "Failed to load submission details."
        );
        if (dbUser?.role === UserRole.TEACHER) {
          router.push("/teacher/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmission();
    }
  }, [firebaseUser, submissionId, router, authLoading, dbUser]);

  if (loading || authLoading) {
    return (
      <SubmissionDetailsSkeleton
        showResultCard={dbUser?.role !== UserRole.TEACHER}
      />
    );
  }

  if (!submission) {
    const dashboardUrl =
      dbUser?.role === UserRole.TEACHER
        ? "/teacher/dashboard"
        : "/student/dashboard";
    const backLabel =
      dbUser?.role === UserRole.TEACHER
        ? "Back to Dashboard"
        : "Back to Dashboard";

    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground">
              Submission not found
            </h1>
            <Button
              variant="tertiary"
              onClick={() => router.push(dashboardUrl)}
              className="mt-4"
            >
              {backLabel}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isTeacher = dbUser?.role === UserRole.TEACHER;

  const getBackUrl = () => {
    if (isTeacher) {
      return `/teacher/results/${submission.exerciseList.id}`;
    }
    return "/student/dashboard";
  };

  return (
    <SubmissionDetailsView
      submission={submission}
      onBack={() => router.push(getBackUrl())}
      backLabel={isTeacher ? "Back to Results" : "Back to Dashboard"}
      showResultCard={!isTeacher}
      answersTitle={isTeacher ? "Detailed Answers" : "Your Answers"}
      answerLabel={isTeacher ? "Student's Answer" : "Your Answer"}
      firstCardContent={{
        icon: User,
        title: isTeacher
          ? submission.student?.name || "Unknown"
          : submission.exerciseList.teacher?.name || "Unknown",
        subtitle: isTeacher ? submission.student?.email || "" : "Teacher",
      }}
    />
  );
}
