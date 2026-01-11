"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { CheckCircle, XCircle } from "lucide-react";
import { QuestionType } from "@teachy/db";
import { QuizQuestion, SubmissionResult } from "@/types";
import { getResultMessage } from "@/lib/utils/exercise";

interface QuizCompleteStepProps {
  submissionResult: SubmissionResult;
  questions: QuizQuestion[];
  onGoToDashboard: () => void;
}

export function QuizCompleteStep({
  submissionResult,
  questions,
  onGoToDashboard,
}: QuizCompleteStepProps) {
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

          <ScoreDisplay
            correctAnswers={submissionResult.correctAnswers}
            totalQuestions={submissionResult.totalQuestions}
            percentage={percentage}
          />

          <AnswersSummary
            questions={questions}
            answers={submissionResult.answers}
          />

          <div
            className="opacity-0 animate-fade-up"
            style={{
              animationDelay: `${1.2 + questions.length * 0.1}s`,
            }}
          >
            <Button onClick={onGoToDashboard} className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ScoreDisplayProps {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

function ScoreDisplay({
  correctAnswers,
  totalQuestions,
  percentage,
}: ScoreDisplayProps) {
  return (
    <div
      className="py-6 opacity-0 animate-score-reveal"
      style={{ animationDelay: "0.7s" }}
    >
      <div className="text-5xl font-bold text-primary">
        <AnimatedNumber value={correctAnswers} delay={900} duration={800} />/
        {totalQuestions}
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
  );
}

interface AnswersSummaryProps {
  questions: QuizQuestion[];
  answers: SubmissionResult["answers"];
}

function AnswersSummary({ questions, answers }: AnswersSummaryProps) {
  return (
    <div
      className="space-y-3 opacity-0 animate-fade-up"
      style={{ animationDelay: "1s" }}
    >
      {questions.map((question, index) => {
        const answer = answers.find((a) => a.questionId === question.id);
        const isOpenEnded = question.type === QuestionType.OPEN_ENDED;
        const isCorrect = answer?.isCorrect;
        const selectedOption = question.options.find(
          (o) => o.id === answer?.selectedOptionId
        );
        const correctOption = question.options.find(
          (o) => o.id === answer?.correctOptionId
        );

        return (
          <AnswerItem
            key={question.id}
            index={index}
            question={question}
            isOpenEnded={isOpenEnded}
            isCorrect={isCorrect}
            selectedOption={selectedOption}
            correctOption={correctOption}
            textAnswer={answer?.textAnswer}
          />
        );
      })}
    </div>
  );
}

interface AnswerItemProps {
  index: number;
  question: QuizQuestion;
  isOpenEnded: boolean;
  isCorrect: boolean | undefined;
  selectedOption: { label: string } | undefined;
  correctOption: { label: string } | undefined;
  textAnswer: string | undefined;
}

function AnswerItem({
  index,
  question,
  isOpenEnded,
  isCorrect,
  selectedOption,
  correctOption,
  textAnswer,
}: AnswerItemProps) {
  const bgClass =
    isOpenEnded || isCorrect ? "bg-success/10" : "bg-destructive/10";
  const Icon = isOpenEnded || isCorrect ? CheckCircle : XCircle;
  const iconClass =
    isOpenEnded || isCorrect ? "text-success" : "text-destructive";

  return (
    <div
      className={`rounded-lg p-3 text-left text-sm opacity-0 animate-fade-up ${bgClass}`}
      style={{ animationDelay: `${1.2 + index * 0.1}s` }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`h-5 w-5 ${iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="font-medium text-foreground">
            Q{index + 1}: {question.title}
          </p>
          {isOpenEnded ? (
            <div className="mt-1 text-muted-foreground space-y-1">
              <p>Your answer: {textAnswer || "No answer provided"}</p>
            </div>
          ) : (
            <div className="mt-1 text-muted-foreground space-y-1">
              <p className={isCorrect ? "text-success" : "text-destructive"}>
                Your answer: {selectedOption?.label || "No answer provided"}
              </p>
              {!isCorrect && correctOption && (
                <p className="text-success">Correct: {correctOption.label}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
