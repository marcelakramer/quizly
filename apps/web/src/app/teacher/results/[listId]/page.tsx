"use client";
export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { useListResults } from "@/hooks/use-list-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber, EmptyState, StatCard } from "@/components/common";
import { ResultsSkeleton, SubmissionListItem } from "@/components/submission";
import { PageContainer, PageHeader } from "@/components/layout";
import { ArrowLeft, Users, Trophy, Share2 } from "lucide-react";

export default function ViewResults() {
  const params = useParams();
  const router = useRouter();
  const listId = params.listId as string;

  const { list, submissions, loading, averageScore, handleShare } =
    useListResults(listId);

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
