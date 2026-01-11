"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { UserRole, QuestionType } from "@teachy/db";
import { QuizStep, QuizList, SubmissionResult } from "@/types";
import { useQuizValidation } from "./use-quiz-validation";

export function useQuiz(shareCode: string) {
  const router = useRouter();
  const { firebaseUser, dbUser, status } = useAuth();
  const teacherRedirectedRef = useRef(false);

  const [list, setList] = useState<QuizList | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingSubmission, setExistingSubmission] =
    useState<SubmissionResult | null>(null);

  const [step, setStep] = useState<QuizStep>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { allFilled: validatedAll } = useQuizValidation(
    list?.questions || [],
    answers,
    textAnswers
  );

  const authLoading = status === "idle" || status === "loading";

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

  const handleStartQuiz = useCallback(() => {
    setAnswers({});
    setTextAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setStep("quiz");
  }, []);

  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      if (!list) return;
      const currentQuestion = list.questions[currentQuestionIndex];
      setAnswers((prev) => ({ ...prev, [currentQuestion.id ?? ""]: optionId }));
    },
    [list, currentQuestionIndex]
  );

  const handleTextAnswerChange = useCallback(
    (text: string) => {
      if (!list) return;
      const currentQuestion = list.questions[currentQuestionIndex];
      setTextAnswers((prev) => ({ ...prev, [currentQuestion.id ?? ""]: text }));
    },
    [list, currentQuestionIndex]
  );

  const handleNext = useCallback(() => {
    if (!list) return;
    const currentQuestion = list.questions[currentQuestionIndex];
    const qid = currentQuestion.id ?? "";
    const isOpenEnded = currentQuestion.type === QuestionType.OPEN_ENDED;
    const hasAnswer = isOpenEnded ? textAnswers[qid]?.trim() : answers[qid];

    if (!hasAnswer) {
      toast.error(
        isOpenEnded ? "Please provide an answer." : "Please select an answer."
      );
      return;
    }
    if (currentQuestionIndex < list.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [list, currentQuestionIndex, answers, textAnswers]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    if (!list || !firebaseUser || !dbUser) {
      toast.error("You must be logged in to submit.");
      return;
    }

    const currentQuestion = list.questions[currentQuestionIndex];
    const qid = currentQuestion.id ?? "";
    const isOpenEnded = currentQuestion.type === QuestionType.OPEN_ENDED;
    const hasAnswer = isOpenEnded ? textAnswers[qid]?.trim() : answers[qid];

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
        const qid = q.id ?? "";
        return {
          questionId: qid,
          ...(isQuestionOpenEnded
            ? { textAnswer: textAnswers[qid] || "" }
            : { selectedOptionId: answers[qid] || "" }),
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
  }, [
    list,
    firebaseUser,
    dbUser,
    currentQuestionIndex,
    answers,
    textAnswers,
    shareCode,
  ]);

  const handleCancel = useCallback(() => {
    router.push("/student/dashboard");
  }, [router]);

  const goToDashboard = useCallback(() => {
    router.push("/student/dashboard");
  }, [router]);

  return {
    list,
    loading: loading || authLoading || !dbUser,
    existingSubmission,
    step,
    currentQuestionIndex,
    answers,
    textAnswers,
    submissionResult,
    submitting,
    showCancelDialog,
    validatedAll,
    handleStartQuiz,
    handleSelectAnswer,
    handleTextAnswerChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleCancel,
    goToDashboard,
    setShowCancelDialog,
  };
}
