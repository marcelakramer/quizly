"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Hash,
  ArrowRight,
  Key,
  Trophy,
  User,
  Clock,
  FileText,
  TrendingUp,
  Award,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { LoadingSpinner } from "@/components/LoadingIcon";
import { EmptyState } from "@/components/EmptyState";

import { StudentSubmission } from "@/types";

export default function StudentDashboard() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

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
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [firebaseUser, authLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!shareCode.trim()) {
      toast.error("Please enter a quiz code.");
      return;
    }

    setLoading(true);

    try {
      // Validate the share code by trying to fetch the quiz
      await api.quiz.getByShareCode(shareCode.trim().toUpperCase());

      // If successful, redirect to the quiz
      router.push(`/quiz/${shareCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error("Error validating quiz code:", error);
      toast.error(
        error instanceof Error
          ? error.message.endsWith(".")
            ? error.message
            : `${error.message}.`
          : "Invalid quiz code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingSubmissions) {
    return <LoadingSpinner />;
  }

  // Calculate performance statistics
  const totalQuizzes = submissions.length;
  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc, sub) => acc + sub.score, 0) /
        submissions.length
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
    submissions.length > 0
      ? Math.max(...submissions.map((sub) => sub.score))
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8 opacity-0 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">My Activities</h1>
          <p className="mt-2 text-muted-foreground">
            Enter a quiz code or view your previous results
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <div
            className="opacity-0 animate-fade-up h-full"
            style={{ animationDelay: "0.1s" }}
          >
            <Card className="glass-card h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Enter Quiz Code</CardTitle>
                    <CardDescription>
                      Get the code from your teacher to start the quiz
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 h-full flex flex-col"
                >
                  <div className="space-y-2">
                    <Label htmlFor="shareCode">Quiz Code</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="shareCode"
                        type="text"
                        placeholder="Enter quiz code (e.g., ABC123)"
                        value={shareCode}
                        onChange={(e) =>
                          setShareCode(e.target.value.toUpperCase())
                        }
                        className="pl-10 font-mono tracking-widest"
                        maxLength={6}
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The code is usually 6 characters long
                    </p>
                  </div>

                  <div className="mt-auto">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading || !shareCode.trim()}
                    >
                      {loading ? (
                        "Validating..."
                      ) : (
                        <>
                          Start Quiz
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div
            className="opacity-0 animate-fade-up h-full"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="glass-card h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Performance Overview
                    </CardTitle>
                    <CardDescription>
                      Your overall quiz statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No data yet"
                    description="Complete quizzes to see your performance"
                    className="py-8"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-foreground">
                          {averageScore.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Average Score
                        </p>
                      </div>
                    </div>

                    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 flex-shrink-0">
                        <Award className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-foreground">
                          {bestScore.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Best Score
                        </p>
                      </div>
                    </div>

                    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-foreground">
                          {totalQuizzes}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totalQuizzes === 1 ? "Quiz" : "Quizzes"}
                        </p>
                      </div>
                    </div>

                    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-foreground">
                          {totalCorrect}/{totalQuestions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Correct
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">My Results</CardTitle>
                  <CardDescription>
                    View your previous quiz submissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No submissions yet"
                  description="Complete a quiz to see your results here"
                  className="py-8"
                />
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission, index) => {
                    const percentage = submission.score;
                    const scoreColorClass =
                      percentage >= 70
                        ? "text-success"
                        : percentage >= 50
                          ? "text-accent"
                          : "text-destructive";

                    return (
                      <Link
                        key={submission.id}
                        href={`/student/results/${submission.exerciseList.shareCode}`}
                        className="block rounded-lg border border-border/50 p-4 hover:border-primary/50 hover:bg-primary/5 transition-all opacity-0 animate-fade-up"
                        style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {submission.exerciseList.title}
                            </h3>
                            {submission.exerciseList.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                {submission.exerciseList.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {submission.exerciseList.teacher.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {submission.exerciseList.questionCount}{" "}
                                questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(
                                  submission.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p
                              className={`text-lg font-bold ${scoreColorClass}`}
                            >
                              {submission.correctAnswers}/
                              {submission.totalQuestions}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
