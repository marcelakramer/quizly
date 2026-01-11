"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowRight, ArrowLeft, Send, X } from "lucide-react";
import { QuestionType } from "@teachy/db";
import { QuizQuestion } from "@/types";

interface QuizQuestionStepProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  textAnswers: Record<string, string>;
  submitting: boolean;
  validatedAll: boolean;
  showCancelDialog: boolean;
  onSelectAnswer: (optionId: string) => void;
  onTextAnswerChange: (text: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onShowCancelDialog: (show: boolean) => void;
  onCancel: () => void;
}

export function QuizQuestionStep({
  questions,
  currentQuestionIndex,
  answers,
  textAnswers,
  submitting,
  validatedAll,
  showCancelDialog,
  onSelectAnswer,
  onTextAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  onShowCancelDialog,
  onCancel,
}: QuizQuestionStepProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isOpenEnded = currentQuestion.type === QuestionType.OPEN_ENDED;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        <QuizProgress
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          progress={progress}
        />

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
            {isOpenEnded ? (
              <FormField
                as="textarea"
                id="text-answer"
                value={textAnswers[currentQuestion.id ?? ""] || ""}
                onChange={(e) => onTextAnswerChange(e.target.value)}
                onBlur={(e) => onTextAnswerChange(e.currentTarget.value.trim())}
                maxLength={2000}
                placeholder="Type your answer here..."
                rows={7}
                autoGrow
                showCounter
              />
            ) : (
              <QuizOptions
                options={currentQuestion.options.map((opt) => ({
                  id: opt.id ?? "",
                  label: opt.label,
                }))}
                selectedOptionId={answers[currentQuestion.id ?? ""]}
                onSelectOption={onSelectAnswer}
              />
            )}
          </CardContent>
        </Card>

        <QuizNavigation
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          submitting={submitting}
          validatedAll={validatedAll}
          onPrevious={onPrevious}
          onNext={onNext}
          onSubmit={onSubmit}
          onShowCancelDialog={() => onShowCancelDialog(true)}
        />

        <CancelDialog
          open={showCancelDialog}
          onOpenChange={onShowCancelDialog}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  progress: number;
}

function QuizProgress({
  currentIndex,
  totalQuestions,
  progress,
}: QuizProgressProps) {
  return (
    <div className="opacity-0 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-sm font-medium text-foreground">
          {progress.toFixed(0)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

interface QuizOptionsProps {
  options: { id: string; label: string }[];
  selectedOptionId: string | undefined;
  onSelectOption: (optionId: string) => void;
}

function QuizOptions({
  options,
  selectedOptionId,
  onSelectOption,
}: QuizOptionsProps) {
  return (
    <RadioGroup
      value={selectedOptionId || ""}
      onValueChange={onSelectOption}
      className="space-y-3"
    >
      {options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center space-x-3 rounded-lg border-2 p-4 w-full min-w-0 transition-all cursor-pointer active:scale-[0.99] active:brightness-95 ${
            selectedOptionId === option.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onSelectOption(option.id)}
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
  );
}

interface QuizNavigationProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  submitting: boolean;
  validatedAll: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onShowCancelDialog: () => void;
}

function QuizNavigation({
  isFirstQuestion,
  isLastQuestion,
  submitting,
  validatedAll,
  onPrevious,
  onNext,
  onSubmit,
  onShowCancelDialog,
}: QuizNavigationProps) {
  return (
    <div
      className="flex items-center justify-between opacity-0 animate-fade-up"
      style={{ animationDelay: "0.2s" }}
    >
      <Button variant="outline" onClick={onPrevious} disabled={isFirstQuestion}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onShowCancelDialog}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        {isLastQuestion ? (
          <Button onClick={onSubmit} disabled={submitting || !validatedAll}>
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

function CancelDialog({ open, onOpenChange, onCancel }: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Quiz?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel? Your progress will be lost and
            you&apos;ll need to start over.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Quiz
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            Yes, Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
