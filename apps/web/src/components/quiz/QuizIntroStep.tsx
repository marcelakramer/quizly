"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { QuizInfoCard } from "./QuizInfoCard";
import { AnimatedNumber } from "@/components/common";
import {
  ArrowRight,
  CheckCircle,
  ClipboardList,
  User,
  FileText,
  Clock,
} from "lucide-react";
import { formatDateTimeLong } from "@/lib/utils/date";
import { QuizList, SubmissionResult } from "@/types";

interface QuizIntroStepProps {
  list: QuizList;
  existingSubmission: SubmissionResult | null;
  onStartQuiz: () => void;
}

export function QuizIntroStep({
  list,
  existingSubmission,
  onStartQuiz,
}: QuizIntroStepProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-card hover-lift max-w-3xl w-full opacity-0 animate-scale-in">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <ClipboardList className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-4">
            {list.title}
          </CardTitle>
          {list.description && (
            <CardDescription className="text-lg mt-2 max-w-lg mx-auto">
              {list.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          {existingSubmission ? (
            <ExistingSubmissionCard
              submission={existingSubmission}
              onBack={() => router.push("/student/dashboard")}
            />
          ) : (
            <NewQuizContent
              list={list}
              onStartQuiz={onStartQuiz}
              onCancel={() => router.push("/student/dashboard")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ExistingSubmissionCardProps {
  submission: SubmissionResult;
  onBack: () => void;
}

function ExistingSubmissionCard({
  submission,
  onBack,
}: ExistingSubmissionCardProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-lg p-6 bg-accent/10 border border-accent/20 opacity-0 animate-fade-up text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Quiz Already Completed
        </h3>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground">Your score:</p>
          <p className="text-3xl font-bold text-primary">
            <AnimatedNumber value={submission.correctAnswers} delay={200} />/
            {submission.totalQuestions}
          </p>
          <p className="text-lg text-muted-foreground">
            <AnimatedNumber value={submission.score} delay={300} suffix="%" />{" "}
            correct
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Submitted on{" "}
            {formatDateTimeLong(submission.createdAt || new Date())}
          </p>
        </div>
        <Button variant="tertiary" onClick={onBack} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

interface NewQuizContentProps {
  list: QuizList;
  onStartQuiz: () => void;
  onCancel: () => void;
}

function NewQuizContent({ list, onStartQuiz, onCancel }: NewQuizContentProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <QuizInfoCard
          icon={FileText}
          value={list.questions.length}
          label={list.questions.length === 1 ? "Question" : "Questions"}
          colorClass="primary"
        />
        <QuizInfoCard
          icon={User}
          value={list.teacher.name}
          label="Created by"
          colorClass="accent"
          animationDelay="150ms"
        />
        <QuizInfoCard
          icon={Clock}
          value={`${Math.ceil(list.questions.length * 1.5)} min`}
          label="Est. time"
          colorClass="success"
          animationDelay="300ms"
        />
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <Button
          onClick={onStartQuiz}
          className="w-full"
          size="lg"
          style={{ animationDelay: "0.4s" }}
        >
          Start Quiz
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button variant="ghost" onClick={onCancel} className="w-full" size="lg">
          Cancel
        </Button>
      </div>
    </>
  );
}
