"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { UserRole, QuestionType } from "@teachy/db";
import { QuizStep, QuizList, SubmissionResult } from "@/types";
import { useQuizValidation } from "@/hooks/use-quiz-validation";
import { ErrorStateCard } from "@/components/ErrorStateCard";
import { QuizIntroSkeleton } from "@/components/QuizIntroSkeleton";
import {
  QuizIntroStep,
  QuizQuestionStep,
  QuizCompleteStep,
} from "@/components/quiz";
import { XCircle } from "lucide-react";

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
          setList(listResult.list as QuizList);
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

    if (status === "idle" || status === "loading") return;

    if (status === "unauthenticated" || !firebaseUser || !dbUser) {
      router.push(`/login?redirect=/quiz/${shareCode}`);
      return;
    }

    fetchData();
  }, [shareCode, firebaseUser, dbUser, status, router]);

  const authLoading = status === "idle" || status === "loading";

  // Handler functions
  const handleStartQuiz = () => {
    setAnswers({});
    setTextAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setStep("quiz");
  };

  const handleSelectAnswer = (optionId: string) => {
    if (!list) return;
    const currentQuestion = list.questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleTextAnswerChange = (text: string) => {
    if (!list) return;
    const currentQuestion = list.questions[currentQuestionIndex];
    setTextAnswers({ ...textAnswers, [currentQuestion.id]: text });
  };

  const handleNext = () => {
    if (!list) return;
    const currentQuestion = list.questions[currentQuestionIndex];
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
    if (!list || !firebaseUser || !dbUser) {
      toast.error("You must be logged in to submit.");
      return;
    }

    const currentQuestion = list.questions[currentQuestionIndex];
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

  // Loading state
  if (loading || authLoading || !dbUser) {
    return <QuizIntroSkeleton />;
  }

  // Error state - quiz not found
  if (!list) {
    return (
      <ErrorStateCard
        icon={XCircle}
        title="Quiz Not Found"
        message="This quiz doesn't exist or has been removed."
        iconBg="bg-destructive/10"
        iconColor="text-destructive"
        onBack={() => router.push("/student/dashboard")}
        backLabel="Back to Dashboard"
      />
    );
  }

  // Intro step
  if (step === "intro") {
    return (
      <QuizIntroStep
        list={list}
        existingSubmission={existingSubmission}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  // Complete step
  if (step === "complete" && submissionResult) {
    return (
      <QuizCompleteStep
        submissionResult={submissionResult}
        questions={list.questions}
        onGoToDashboard={() => router.push("/student/dashboard")}
      />
    );
  }

  // Quiz step (default)
  return (
    <QuizQuestionStep
      questions={list.questions}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      textAnswers={textAnswers}
      submitting={submitting}
      validatedAll={validatedAll}
      showCancelDialog={showCancelDialog}
      onSelectAnswer={handleSelectAnswer}
      onTextAnswerChange={handleTextAnswerChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onShowCancelDialog={setShowCancelDialog}
      onCancel={() => router.push("/student/dashboard")}
    />
  );
}
