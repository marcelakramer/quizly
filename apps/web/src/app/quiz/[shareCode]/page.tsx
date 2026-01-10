"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  ClipboardList,
  User,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { LoadingSpinner, LoadingIcon } from "@/components/LoadingIcon";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { UserRole } from "@teachy/db";

type QuizStep = "intro" | "quiz" | "complete";

interface QuizQuestion {
  id: string;
  title: string;
  order: number;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
  }>;
}

interface QuizList {
  id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

interface SubmissionResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: Date;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    correctOptionId: string;
  }>;
}

export default function StudentQuiz() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.shareCode as string;
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<QuizStep>("intro");
  const [dbUser, setDbUser] = useState<{ name: string; role: UserRole } | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [list, setList] = useState<QuizList | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] =
    useState<SubmissionResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!shareCode) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          toast.error("You must be logged in to take this quiz.");
          router.push("/login");
          return;
        }

        const [listResult, userResult, submissionResult] = await Promise.all([
          api.quiz.getByShareCode(shareCode),
          api.auth.me(idToken),
          api.quiz
            .checkSubmission(idToken, shareCode)
            .catch(() => ({ hasSubmission: false })),
        ]);

        if (listResult && listResult.list) {
          const listWithTeacher = listResult.list as QuizList;
          setList(listWithTeacher);
        }

        if (userResult?.user) {
          if (userResult.user.role !== UserRole.STUDENT) {
            toast.error("Only students can take quizzes.");
            router.push("/");
            return;
          }
          setDbUser(userResult.user);
        }

        if (
          submissionResult.hasSubmission &&
          "submission" in submissionResult &&
          submissionResult.submission
        ) {
          setExistingSubmission(
            submissionResult.submission as SubmissionResult
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;

    if (!user) {
      toast.error("You must be logged in to take this quiz.");
      router.push("/login");
      return;
    }

    fetchData();
  }, [shareCode, user, authLoading, router]);

  if (loading || authLoading || !dbUser) {
    return <LoadingSpinner />;
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-foreground">
              Quiz not found
            </h1>
            <p className="text-muted-foreground mt-2">
              This quiz doesn&apos;t exist or has been removed
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = list.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / list.questions.length) * 100;

  const handleStartQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setStep("quiz");
  };

  const handleSelectAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please select an answer.");
      return;
    }
    if (currentQuestionIndex < list.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please select an answer.");
      return;
    }

    if (!user || !dbUser) {
      toast.error("You must be logged in to submit.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = getAuthInstance();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated");
      }

      const answerArray = list.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || "",
      }));

      const { submission } = await api.quiz.submit(
        idToken,
        shareCode,
        answerArray
      );
      setSubmissionResult(submission);
      setStep("complete");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(
        error instanceof Error
          ? error.message.endsWith(".")
            ? error.message
            : `${error.message}.`
          : "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card hover-lift max-w-2xl w-full opacity-0 animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <ClipboardList className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-3">
              {list.title}
            </CardTitle>
            {list.description && (
              <CardDescription className="text-base mt-2 max-w-md mx-auto">
                {list.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {existingSubmission ? (
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
                      {existingSubmission.correctAnswers}/
                      {existingSubmission.totalQuestions}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      {existingSubmission.score.toFixed(0)}% correct
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Submitted on{" "}
                      {new Date(
                        existingSubmission.createdAt || new Date()
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/student/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="glass-card rounded-lg p-4 text-center opacity-0 animate-fade-up">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {list.questions.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.questions.length === 1 ? "Question" : "Questions"}
                    </p>
                  </div>

                  <div className="glass-card rounded-lg p-4 text-center opacity-0 animate-fade-up [animation-delay:150ms]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mx-auto mb-3">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {list.teacher.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created by
                    </p>
                  </div>

                  <div className="glass-card rounded-lg p-4 text-center opacity-0 animate-fade-up [animation-delay:300ms]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 mx-auto mb-3">
                      <Clock className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.ceil(list.questions.length * 1.5)} min
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Est. time
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={handleStartQuiz}
                    className="w-full"
                    size="lg"
                    style={{ animationDelay: "0.4s" }}
                  >
                    Start Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "complete" && submissionResult) {
    const percentage = submissionResult.score;
    const emoji =
      percentage >= 80
        ? "🎉"
        : percentage >= 60
          ? "👍"
          : percentage >= 40
            ? "💪"
            : "📚";

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-lg w-full opacity-0 animate-scale-in">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="text-6xl">{emoji}</div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Quiz Complete!
              </h1>
              <p className="text-muted-foreground mt-1">
                Well done, {dbUser.name}!
              </p>
            </div>

            <div className="py-6">
              <div className="text-5xl font-bold text-primary">
                {submissionResult.correctAnswers}/
                {submissionResult.totalQuestions}
              </div>
              <p className="text-lg text-muted-foreground mt-2">
                {percentage.toFixed(0)}% correct
              </p>
            </div>

            <div className="space-y-3">
              {list.questions.map((question, index) => {
                const answer = submissionResult.answers.find(
                  (a) => a.questionId === question.id
                );
                const isCorrect = answer?.isCorrect || false;
                const selectedOption = question.options.find(
                  (o) => o.id === answer?.selectedOptionId
                );
                const correctOption = question.options.find(
                  (o) => o.id === answer?.correctOptionId
                );

                return (
                  <div
                    key={question.id}
                    className={`rounded-lg p-3 text-left text-sm ${
                      isCorrect ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Q{index + 1}: {question.title}
                        </p>
                        {!isCorrect && (
                          <div className="mt-1 text-muted-foreground space-y-1">
                            <p>Your answer: {selectedOption?.label}</p>
                            <p className="text-success">
                              Correct: {correctOption?.label}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="opacity-0 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {list.questions.length}
            </span>
            <span className="text-sm font-medium text-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card
          className="glass-card opacity-0 animate-scale-in"
          key={currentQuestion.id}
        >
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed text-foreground">
              {currentQuestion.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleSelectAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleSelectAnswer(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer font-normal text-foreground"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div
          className="flex items-center justify-between opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex === list.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <LoadingIcon size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
