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
import { ArrowLeft, CheckCircle, XCircle, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { QuestionType } from "@teachy/db";
import { SubmissionDetail } from "@/types";

export default function SubmissionDetails() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const listId = params.listId as string;
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!user || !submissionId) return;

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
        router.push(`/teacher/results/${listId}`);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmission();
    }
  }, [user, submissionId, listId, router, authLoading]);

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
              <Link href={`/teacher/results/${listId}`}>Back to Results</Link>
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
          href={`/teacher/results/${listId}`}
          className="mb-6 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors opacity-0 animate-fade-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
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
                    {submission.student?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {submission.student?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
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
            <CardTitle className="text-xl text-foreground">
              Detailed Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedAnswers.map((answer, index) => {
                const isOpenEnded =
                  answer.question.type === QuestionType.OPEN_ENDED;
                const isCorrect = answer.isCorrect;
                const correctOption = answer.question.options.find(
                  (opt) => opt.id === answer.correctOptionId
                );

                return (
                  <div
                    key={answer.questionId}
                    className={`rounded-lg p-4 border-2 ${
                      isOpenEnded
                        ? "bg-success/10 border-success/20"
                        : isCorrect
                          ? "bg-success/10 border-success/20"
                          : "bg-destructive/10 border-destructive/20"
                    } opacity-0 animate-fade-up`}
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      {isOpenEnded ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-2">
                          Q{index + 1}: {answer.question.title}
                        </p>
                        <div className="space-y-2">
                          {isOpenEnded ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Student&apos;s Answer:
                              </p>
                              <p className="text-sm text-success">
                                {answer.textAnswer || "No answer provided"}
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Student&apos;s Answer:
                                </p>
                                <p
                                  className={`text-sm ${
                                    isCorrect
                                      ? "text-success"
                                      : "text-destructive"
                                  }`}
                                >
                                  {answer.selectedOption?.label}
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
                            </>
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
