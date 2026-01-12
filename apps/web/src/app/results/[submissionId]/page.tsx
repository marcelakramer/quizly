"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api/client";
import {
  SubmissionDetailsSkeleton,
  SubmissionDetailsView,
} from "@/components/submission";
import { ErrorStateCard } from "@/components/common";
import { User, ShieldX, FileQuestion } from "lucide-react";
import { UserRole } from "@teachy/db";
import { SubmissionDetail } from "@/types";

export default function SubmissionDetails() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, dbUser, status } = useAuth();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: "not-found" | "forbidden" | "error";
    message: string;
  } | null>(null);

  const authLoading = status === "idle" || status === "loading";

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!firebaseUser || !submissionId) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          router.push("/login");
          return;
        }

        const { submission: fetchedSubmission } =
          await api.exercises.submissions.getById(idToken, submissionId);

        setSubmission(fetchedSubmission);
      } catch (err) {
        console.error("Error fetching submission details:", err);
        const message = err instanceof Error ? err.message : "";

        if (message.toLowerCase().includes("forbidden")) {
          setError({
            type: "forbidden",
            message: "You do not have permission to view this submission.",
          });
        } else if (message.toLowerCase().includes("not found")) {
          setError({
            type: "not-found",
            message: "This submission could not be found.",
          });
        } else {
          setError({
            type: "error",
            message: "Something went wrong while loading this submission.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmission();
    }
  }, [firebaseUser, submissionId, router, authLoading]);

  const dashboardUrl =
    dbUser?.role === UserRole.TEACHER
      ? "/teacher/dashboard"
      : "/student/dashboard";

  if (loading || authLoading) {
    return (
      <SubmissionDetailsSkeleton
        showResultCard={dbUser?.role !== UserRole.TEACHER}
      />
    );
  }

  if (error) {
    const errorConfig = {
      "not-found": {
        icon: FileQuestion,
        title: "Submission Not Found",
        iconBg: "bg-muted/50",
        iconColor: "text-muted-foreground",
      },
      forbidden: {
        icon: ShieldX,
        title: "Access Denied",
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
      },
      error: {
        icon: FileQuestion,
        title: "Something Went Wrong",
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
      },
    }[error.type];

    return (
      <ErrorStateCard
        icon={errorConfig.icon}
        title={errorConfig.title}
        message={error.message}
        iconBg={errorConfig.iconBg}
        iconColor={errorConfig.iconColor}
        onBack={() => router.push(dashboardUrl)}
        backLabel="Back to Dashboard"
      />
    );
  }

  if (!submission) {
    return (
      <ErrorStateCard
        icon={FileQuestion}
        title="Submission Not Found"
        message="This submission could not be found."
        onBack={() => router.push(dashboardUrl)}
        backLabel="Back to Dashboard"
        fullScreen={false}
      />
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
