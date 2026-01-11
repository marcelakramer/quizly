"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateTimeLong } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { api } from "@/lib/api";
import { QuizIntroSkeleton } from "@/components/QuizIntroSkeleton";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { UserRole, QuestionType } from "@teachy/db";
import { QuizStep, QuizList, SubmissionResult } from "@/types";
import { getResultMessage } from "@/lib/utils/exercise";
import { useQuizValidation } from "@/hooks/use-quiz-validation";

export default function StudentQuiz() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.shareCode as string;
  const { firebaseUser, dbUser, status } = useAuth();
  const teacherRedirectedRef = useRef(false);

  const [step, setStep] = useState<QuizStep>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [list, setList] = useState<QuizList | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] =
    useState<SubmissionResult | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { allFilled: validatedAll } = useQuizValidation(
    list?.questions || [],
    answers,
    textAnswers
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!shareCode || !firebaseUser || !dbUser) return;

      if (dbUser.role !== UserRole.STUDENT) {
        if (!teacherRedirectedRef.current) {
          teacherRedirectedRef.current = true;

          try {
            const listResult = await api.quiz.getByShareCode(shareCode);
            if (listResult?.list?.teacher?.id === dbUser.id) {
              router.replace(`/teacher/results/${listResult.list.id}`);
              return;
            }
          } catch {
            // Quiz not found or error, just redirect to dashboard
          }

          toast.error("Only students can take quizzes.");
          router.replace("/teacher/dashboard");
        }
        return;
      }

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          toast.error("You must be logged in to take this quiz.");
          router.push("/login");
          return;
        }

        const [listResult, submissionResult] = await Promise.all([
          api.quiz.getByShareCode(shareCode),
          api.quiz
            .checkSubmission(idToken, shareCode)
            .catch(() => ({ hasSubmission: false })),
        ]);

        if (listResult && listResult.list) {
          const listWithTeacher = listResult.list as QuizList;
          setList(listWithTeacher);
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

    // Wait for auth to fully resolve
    if (status === "idle" || status === "loading") return;

    if (status === "unauthenticated" || !firebaseUser || !dbUser) {
      router.push(`/login?redirect=/quiz/${shareCode}`);
      return;
    }

    fetchData();
  }, [shareCode, firebaseUser, dbUser, status, router]);

  const authLoading = status === "idle" || status === "loading";

  if (loading || authLoading || !dbUser) {
    return <QuizIntroSkeleton />;
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full opacity-0 animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Quiz Not Found
                </h1>
                <p className="text-muted-foreground">
                  This quiz doesn&apos;t exist or has been removed.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/student/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = list.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / list.questions.length) * 100;

  const _allAnswersFilled = list.questions.every((question) => {
    if (question.type === QuestionType.OPEN_ENDED) {
      return textAnswers[question.id]?.trim() || false;
    }
    return !!answers[question.id];
  });

  const handleStartQuiz = () => {
    setAnswers({});
    setTextAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setStep("quiz");
  };

  const handleSelectAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleTextAnswerChange = (text: string) => {
    setTextAnswers({ ...textAnswers, [currentQuestion.id]: text });
  };

  const handleNext = () => {
    const isOpenEnded = currentQuestion.type === QuestionType.OPEN_ENDED;
    const hasAnswer = isOpenEnded
      ? textAnswers[currentQuestion.id]?.trim()
      : answers[currentQuestion.id];

    if (!hasAnswer) {
      toast.error(
        isOpenEnded ? "Please provide an answer." : "Please select an answer."
      );
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
    const isOpenEnded = currentQuestion.type === QuestionType.OPEN_ENDED;
    const hasAnswer = isOpenEnded
      ? textAnswers[currentQuestion.id]?.trim()
      : answers[currentQuestion.id];

    if (!hasAnswer) {
      toast.error(
        isOpenEnded ? "Please provide an answer." : "Please select an answer."
      );
      return;
    }

    if (!firebaseUser || !dbUser) {
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

      const answerArray = list.questions.map((q) => {
        const isQuestionOpenEnded = q.type === QuestionType.OPEN_ENDED;
        return {
          questionId: q.id,
          ...(isQuestionOpenEnded
            ? { textAnswer: textAnswers[q.id] || "" }
            : { selectedOptionId: answers[q.id] || "" }),
        };
      });

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
                      <AnimatedNumber
                        value={existingSubmission.correctAnswers}
                        delay={200}
                      />
                      /{existingSubmission.totalQuestions}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      <AnimatedNumber
                        value={existingSubmission.score}
                        delay={300}
                        suffix="%"
                      />{" "}
                      correct
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Submitted on{" "}
                      {formatDateTimeLong(
                        existingSubmission.createdAt || new Date()
                      )}
                    </p>
                  </div>
                  <Button
                    variant="tertiary"
                    onClick={() => router.push("/student/dashboard")}
                    className="w-full"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="glass-card rounded-lg p-6 text-center opacity-0 animate-fade-up">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      {list.questions.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {list.questions.length === 1 ? "Question" : "Questions"}
                    </p>
                  </div>

                  <div className="glass-card rounded-lg p-6 text-center opacity-0 animate-fade-up [animation-delay:150ms]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 mx-auto mb-4">
                      <User className="h-8 w-8 text-accent" />
                    </div>
                    <p className="text-base font-semibold text-foreground truncate">
                      {list.teacher.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Created by
                    </p>
                  </div>

                  <div className="glass-card rounded-lg p-6 text-center opacity-0 animate-fade-up [animation-delay:300ms]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-success/10 mx-auto mb-4">
                      <Clock className="h-8 w-8 text-success" />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {Math.ceil(list.questions.length * 1.5)} min
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Est. time
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button
                    onClick={handleStartQuiz}
                    className="w-full"
                    size="lg"
                    style={{ animationDelay: "0.4s" }}
                  >
                    Start Quiz
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/student/dashboard")}
                    className="w-full"
                    size="lg"
                  >
                    Cancel
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
    const result = getResultMessage(percentage);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-lg w-full opacity-0 animate-scale-in">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div
              className="text-6xl opacity-0 animate-celebrate-bounce"
              style={{ animationDelay: "0.3s" }}
            >
              {result.emoji}
            </div>

            <div
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              <h1 className="text-2xl font-bold text-foreground">
                {result.title}
              </h1>
              <p className="text-muted-foreground mt-1">{result.message}</p>
            </div>

            <div
              className="py-6 opacity-0 animate-score-reveal"
              style={{ animationDelay: "0.7s" }}
            >
              <div className="text-5xl font-bold text-primary">
                <AnimatedNumber
                  value={submissionResult.correctAnswers}
                  delay={900}
                  duration={800}
                />
                /{submissionResult.totalQuestions}
              </div>
              <p className="text-lg text-muted-foreground mt-2">
                <AnimatedNumber
                  value={percentage}
                  delay={1100}
                  duration={800}
                  suffix="%"
                />{" "}
                correct
              </p>
            </div>

            <div
              className="space-y-3 opacity-0 animate-fade-up"
              style={{ animationDelay: "1s" }}
            >
              {list.questions.map((question, index) => {
                const answer = submissionResult.answers.find(
                  (a) => a.questionId === question.id
                );
                const isOpenEnded = question.type === QuestionType.OPEN_ENDED;
                const isCorrect = answer?.isCorrect;
                const selectedOption = question.options.find(
                  (o) => o.id === answer?.selectedOptionId
                );
                const correctOption = question.options.find(
                  (o) => o.id === answer?.correctOptionId
                );

                return (
                  <div
                    key={question.id}
                    className={`rounded-lg p-3 text-left text-sm opacity-0 animate-fade-up ${
                      isOpenEnded
                        ? "bg-success/10"
                        : isCorrect
                          ? "bg-success/10"
                          : "bg-destructive/10"
                    }`}
                    style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-2">
                      {isOpenEnded ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Q{index + 1}: {question.title}
                        </p>
                        {isOpenEnded ? (
                          <div className="mt-1 text-muted-foreground space-y-1">
                            <p>
                              Your answer:{" "}
                              {answer?.textAnswer || "No answer provided"}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1 text-muted-foreground space-y-1">
                            <p
                              className={
                                isCorrect ? "text-success" : "text-destructive"
                              }
                            >
                              Your answer:{" "}
                              {selectedOption?.label || "No answer provided"}
                            </p>
                            {!isCorrect && correctOption && (
                              <p className="text-success">
                                Correct: {correctOption.label}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="opacity-0 animate-fade-up"
              style={{
                animationDelay: `${1.2 + list.questions.length * 0.1}s`,
              }}
            >
              <Button
                onClick={() => router.push("/student/dashboard")}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
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
            <CardTitle className="text-lg leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {currentQuestion.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === QuestionType.OPEN_ENDED ? (
              <>
                <FormField
                  as="textarea"
                  id="text-answer"
                  value={textAnswers[currentQuestion.id] || ""}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                  onBlur={(e) =>
                    handleTextAnswerChange(e.currentTarget.value.trim())
                  }
                  maxLength={2000}
                  placeholder="Type your answer here..."
                  rows={7}
                  autoGrow
                  showCounter
                />
              </>
            ) : (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleSelectAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 w-full min-w-0 transition-all cursor-pointer active:scale-[0.99] active:brightness-95 ${
                      answers[currentQuestion.id] === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectAnswer(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 min-w-0 cursor-pointer font-normal text-foreground whitespace-pre-wrap break-words text-lg"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
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

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowCancelDialog(true)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            {currentQuestionIndex === list.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !validatedAll}
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Quiz?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel? Your progress will be lost and
                you&apos;ll need to start over.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                Continue Quiz
              </Button>
              <Button
                variant="destructive"
                onClick={() => router.push("/student/dashboard")}
              >
                Yes, Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
