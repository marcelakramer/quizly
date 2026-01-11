"use client";

import { useParams } from "next/navigation";
import { useQuiz } from "@/hooks/use-quiz";
import { ErrorStateCard, QuizIntroSkeleton } from "@/components/common";
import {
  QuizIntroStep,
  QuizQuestionStep,
  QuizCompleteStep,
} from "@/components/quiz";
import { XCircle } from "lucide-react";

export default function StudentQuiz() {
  const params = useParams();
  const shareCode = params.shareCode as string;

  const {
    list,
    loading,
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
  } = useQuiz(shareCode);

  if (loading) {
    return <QuizIntroSkeleton />;
  }

  if (!list) {
    return (
      <ErrorStateCard
        icon={XCircle}
        title="Quiz Not Found"
        message="This quiz doesn't exist or has been removed."
        iconBg="bg-destructive/10"
        iconColor="text-destructive"
        onBack={goToDashboard}
        backLabel="Back to Dashboard"
      />
    );
  }

  if (step === "intro") {
    return (
      <QuizIntroStep
        list={list}
        existingSubmission={existingSubmission}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  if (step === "complete" && submissionResult) {
    return (
      <QuizCompleteStep
        submissionResult={submissionResult}
        questions={list.questions}
        onGoToDashboard={goToDashboard}
      />
    );
  }

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
      onCancel={handleCancel}
    />
  );
}
