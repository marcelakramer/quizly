"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, PageContainer } from "@/components/layout";
import {
  IconCardHeader,
  StatCard,
  EmptyState,
  AnimatedNumber,
} from "@/components/common";
import { ResultListItem } from "@/components/submission";
import {
  Hash,
  ArrowRight,
  Key,
  Trophy,
  FileText,
  TrendingUp,
  Award,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { StudentDashboardSkeleton } from "@/components/dashboard";
import { useStudentSubmissions } from "@/hooks/use-student-submissions";
import { useShareCodeNavigation } from "@/hooks/use-share-code-navigation";

export default function StudentDashboard() {
  const { submissions, loading, stats } = useStudentSubmissions();
  const {
    shareCode,
    loading: codeLoading,
    handleSubmit,
    updateShareCode,
  } = useShareCodeNavigation();

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  const {
    totalQuizzes,
    averageScore,
    totalQuestions,
    totalCorrect,
    bestScore,
  } = stats;

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
                    onChange={(e) => updateShareCode(e.target.value)}
                    className="font-mono tracking-widest"
                    maxLength={6}
                    disabled={codeLoading}
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
                    disabled={codeLoading || !shareCode.trim()}
                  >
                    {codeLoading ? (
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
                {submissions.map((submission, index) => (
                  <ResultListItem
                    key={submission.id}
                    submission={submission}
                    index={index}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
