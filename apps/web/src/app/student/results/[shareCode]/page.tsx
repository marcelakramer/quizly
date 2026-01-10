"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingIcon";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

interface SubmissionDetail {
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
    questions: Array<{
      id: string;
      title: string;
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
  answers: Array<{
    questionId: string;
    question: {
      id: string;
      title: string;
      order: number;
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
      }>;
    };
    selectedOptionId: string;
    selectedOption: {
      id: string;
      label: string;
      isCorrect: boolean;
    };
    isCorrect: boolean;
    correctOptionId: string;
  }>;
}

export default function StudentResults() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const shareCode = params.shareCode as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!user || !shareCode) return;

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

        // Fetch full details using the submission ID
        const { submission: fullSubmission } =
          await api.exercises.submissions.getById(
            idToken,
            fetchedSubmission.id
          );

        setSubmission(fullSubmission);
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
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmission();
    }
  }, [user, shareCode, router, authLoading]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground">
              Submission not found
            </h1>
            <Button asChild className="mt-4">
              <Link href="/student/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const percentage = submission.score;
  const sortedAnswers = [...submission.answers].sort(
    (a, b) => a.question.order - b.question.order
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <Link
          href="/student/dashboard"
          className="mb-6 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors opacity-0 animate-fade-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div
          className="mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            {submission.exerciseList.title}
          </h1>
          {submission.exerciseList.description && (
            <p className="mt-1 text-muted-foreground">
              {submission.exerciseList.description}
            </p>
          )}
        </div>

        <div
          className="grid gap-4 md:grid-cols-3 mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {submission.exerciseList.teacher.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Teacher</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {submission.correctAnswers}/{submission.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {percentage.toFixed(0)}% correct
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(submission.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card
          className="glass-card opacity-0 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">
                Your Answers
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedAnswers.map((answer, index) => {
                const isCorrect = answer.isCorrect;
                const correctOption = answer.question.options.find(
                  (opt) => opt.id === answer.correctOptionId
                );

                return (
                  <div
                    key={answer.questionId}
                    className={`rounded-lg p-4 border-2 ${
                      isCorrect
                        ? "bg-success/10 border-success/20"
                        : "bg-destructive/10 border-destructive/20"
                    } opacity-0 animate-fade-up`}
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-2">
                          Q{index + 1}: {answer.question.title}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Your Answer:
                            </p>
                            <p
                              className={`text-sm ${
                                isCorrect ? "text-success" : "text-destructive"
                              }`}
                            >
                              {answer.selectedOption.label}
                            </p>
                          </div>
                          {!isCorrect && correctOption && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Correct Answer:
                              </p>
                              <p className="text-sm text-success font-medium">
                                {correctOption.label}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
