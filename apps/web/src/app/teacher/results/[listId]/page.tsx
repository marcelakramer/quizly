"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber, EmptyState, StatCard } from "@/components/common";
import { ResultsSkeleton, SubmissionListItem } from "@/components/submission";
import { PageContainer, PageHeader } from "@/components/layout";
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
    return <ResultsSkeleton />;
  }

  if (!list) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground">List not found</h1>
          <Button
            variant="tertiary"
            onClick={() => router.push("/teacher/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </PageContainer>
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
    <PageContainer>
      <Button
        variant="tertiary"
        onClick={() => router.push("/teacher/dashboard")}
        className="mb-6 opacity-0 animate-fade-up"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <PageHeader
        title={list.title}
        description={list.description ?? undefined}
        align="start"
        animationDelay="0.1s"
        actions={
          <Button
            variant="outline"
            onClick={handleShare}
            className="whitespace-nowrap"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        }
      />

      <div
        className="grid gap-4 md:grid-cols-3 mb-8 opacity-0 animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <StatCard
          icon={Users}
          value={<AnimatedNumber value={submissions.length} delay={200} />}
          label="Submissions"
          colorClass="primary"
          variant="card"
        />
        <StatCard
          icon={Trophy}
          value={<AnimatedNumber value={averageScore} delay={300} suffix="%" />}
          label="Avg. Score"
          colorClass="success"
          variant="card"
        />
        <StatCard
          icon={
            <span className="text-lg font-bold text-accent">
              <AnimatedNumber value={list.questions.length} delay={400} />
            </span>
          }
          value={<AnimatedNumber value={list.questions.length} delay={400} />}
          label="Questions"
          colorClass="accent"
          variant="card"
        />
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
            />
          ) : (
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <SubmissionListItem
                  key={submission.id}
                  submission={submission}
                  animationDelay={`${0.4 + index * 0.1}s`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
