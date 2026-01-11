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
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Users, Trophy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Submission, ExerciseListSummary } from "@/types";

export default function ViewResults() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const listId = params.listId as string;

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground">
              List not found
            </h1>
            <Button asChild className="mt-4">
              <Link href="/teacher/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/quiz/${list.shareCode}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", {
        description: "Share this link with your students",
      });
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc, sub) => acc + sub.percentage, 0) /
        submissions.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <Link
          href="/teacher/dashboard"
          className="mb-6 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors opacity-0 animate-fade-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div
          className="mb-8 flex items-start justify-between opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">{list.title}</h1>
            {list.description && (
              <p className="mt-1 text-muted-foreground">{list.description}</p>
            )}
          </div>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>

        <div
          className="grid gap-4 md:grid-cols-3 mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {submissions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Submissions</p>
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
                    {averageScore.toFixed(0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <span className="text-lg font-bold text-accent">
                    {list.questions.length}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {list.questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Questions</p>
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
            <CardTitle>Student Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No submissions yet"
                description="Share the quiz link with your students to start receiving responses"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {submissions.map((submission, index) => {
                  const percentage = submission.percentage;
                  return (
                    <Link
                      key={submission.id}
                      href={`/teacher/results/${listId}/submissions/${submission.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 opacity-0 animate-fade-up hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                      style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {submission.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {submission.studentName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              submission.submittedAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            percentage >= 70
                              ? "text-success"
                              : percentage >= 50
                                ? "text-accent"
                                : "text-destructive"
                          }`}
                        >
                          {submission.score}/{submission.totalQuestions}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
