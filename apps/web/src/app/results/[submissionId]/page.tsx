"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubmissionDetailsSkeleton } from "@/components/SubmissionDetailsSkeleton";
import { SubmissionDetailsView } from "@/components/SubmissionDetailsView";
import { User, ShieldX, FileQuestion, ArrowLeft } from "lucide-react";
import { UserRole } from "@teachy/db";
import { SubmissionDetail } from "@/types";

export default function SubmissionDetails() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, dbUser, loading: authLoading } = useAuth();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: "not-found" | "forbidden" | "error";
    message: string;
  } | null>(null);

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

    const Icon = errorConfig.icon;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full opacity-0 animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full ${errorConfig.iconBg}`}
                >
                  <Icon className={`h-10 w-10 ${errorConfig.iconColor}`} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {errorConfig.title}
                </h1>
                <p className="text-muted-foreground">{error.message}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(dashboardUrl)}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full opacity-0 animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                  <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Submission Not Found
                </h1>
                <p className="text-muted-foreground">
                  This submission could not be found.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(dashboardUrl)}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
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
