"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { getScoreColorClass } from "@/lib/utils/exercise";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, PageContainer } from "@/components/layout";
import { IconCardHeader, StatCard } from "@/components/common";
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
import { StudentDashboardSkeleton } from "@/components/dashboard";
import { EmptyState, AnimatedNumber } from "@/components/common";

import { StudentSubmission } from "@/types";

export default function StudentDashboard() {
  const router = useRouter();
  const { firebaseUser, status } = useAuth();
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

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
      await api.quiz.getByShareCode(shareCode.trim().toUpperCase());
      router.push(`/quiz/${shareCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error("Error validating quiz code:", error);
      setShareCode("");
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
    return <StudentDashboardSkeleton />;
  }

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
    <PageContainer>
      <PageHeader
        title="My Activities"
        description="Enter a quiz code or view your previous results"
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div
          className="opacity-0 animate-fade-up h-full"
          style={{ animationDelay: "0.1s" }}
        >
          <Card className="glass-card h-full flex flex-col">
            <IconCardHeader
              icon={Hash}
              title="Enter Quiz Code"
              description="Get the code from your teacher to start the quiz"
            />
            <CardContent className="flex-1 flex flex-col">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="space-y-2">
                  <FormField
                    label="Quiz Code"
                    leftInnerIcon={Key}
                    id="shareCode"
                    name="shareCode"
                    type="text"
                    placeholder="Enter quiz code (e.g., ABC123)"
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                    className="font-mono tracking-widest"
                    maxLength={6}
                    disabled={loading}
                    autoFocus
                    showError={false}
                  />
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
            <IconCardHeader
              icon={TrendingUp}
              title="Performance Overview"
              description="Your overall quiz statistics"
            />
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
                  <StatCard
                    icon={Trophy}
                    value={
                      <AnimatedNumber
                        value={averageScore}
                        suffix="%"
                        delay={200}
                      />
                    }
                    label="Average Score"
                    colorClass="primary"
                  />
                  <StatCard
                    icon={Award}
                    value={
                      <AnimatedNumber
                        value={bestScore}
                        suffix="%"
                        delay={300}
                      />
                    }
                    label="Best Score"
                    colorClass="success"
                  />
                  <StatCard
                    icon={FileText}
                    value={<AnimatedNumber value={totalQuizzes} delay={400} />}
                    label={totalQuizzes === 1 ? "Quiz" : "Quizzes"}
                    colorClass="accent"
                  />
                  <StatCard
                    icon={CheckCircle}
                    value={
                      <>
                        <AnimatedNumber value={totalCorrect} delay={500} />/
                        {totalQuestions}
                      </>
                    }
                    label="Total Correct"
                    colorClass="primary"
                  />
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
          <IconCardHeader
            icon={ClipboardList}
            title="My Results"
            description="View your previous quiz submissions"
          />
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
                  const scoreColorClass = getScoreColorClass(percentage);

                  return (
                    <Link
                      key={submission.id}
                      href={`/results/${submission.id}`}
                      className="block rounded-lg border border-border/50 p-4 hover:border-primary/50 hover:bg-primary/5 transition-all opacity-0 animate-fade-up active:scale-[0.99] active:brightness-95"
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
                              {submission.exerciseList.questionCount} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(submission.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${scoreColorClass}`}>
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
    </PageContainer>
  );
}
